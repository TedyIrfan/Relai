<?php

namespace App\Services;

use App\Models\SbmDetail;
use Illuminate\Pagination\LengthAwarePaginator;

class SbmApiService
{
    /**
     * Search across all SBM categories
     * Used by Master SBM Search Popup in Nominatif
     */
    public function searchAll(string $searchTerm): array
    {
        $results = [];

        // Get ALL categories dynamically from database
        $categories = SbmDetail::select('category')
            ->distinct()
            ->pluck('category')
            ->toArray();

        foreach ($categories as $categoryKey) {
            // Build query for this category
            $query = SbmDetail::where('category', $categoryKey);

            // Apply search - OPTIMIZED for performance
            $query->where(function ($q) use ($searchTerm) {
                // Normalize search term for better matching
                $normalizedSearch = preg_replace('/\s+/', '', strtolower(trim($searchTerm)));

                // Split into words for multi-word search
                $words = array_filter(explode(' ', strtolower(trim($searchTerm))));

                if (empty($words)) {
                    return;
                }

                // OPTIMIZED: Simple LIKE queries without heavy regex
                $q->where(function ($main) use ($normalizedSearch, $words) {
                    // Try normalized search first (for "J A M B I" → "jambi")
                    $main->whereRaw("LOWER(data::text) LIKE ?", ['%' . $normalizedSearch . '%']);

                    // Also match individual words (more flexible)
                    foreach ($words as $word) {
                        $main->orWhereRaw("LOWER(data::text) LIKE ?", ['%' . $word . '%']);
                    }
                })

                // Search in metadata fields (lightweight)
                ->orWhere('source_file', 'ilike', '%' . $normalizedSearch . '%')
                ->orWhere('parent_section', 'ilike', '%' . $normalizedSearch . '%')
                ->orWhere('sub_category', 'ilike', '%' . $normalizedSearch . '%');
            });

            // Get all matching records (no limit for complete results)
            $records = $query->get();

            if ($records->isNotEmpty()) {
                // Get category label and group
                $categoryLabel = $this->getCategoryLabel($categoryKey);
                $categoryGroup = $this->getCategoryGroup($categoryKey);

                // Get total count for this category
                $totalCount = SbmDetail::where('category', $categoryKey)->count();

                // Get grouping metadata (with total_count and match_count per group)
                $grouping = $this->getGroupingMetadata($categoryKey, $records->toArray());

                $results[] = [
                    'category' => $categoryKey,
                    'categoryName' => $categoryLabel,
                    'group' => $categoryGroup,
                    'totalCount' => $totalCount,
                    'filteredCount' => $records->count(),
                    'grouping' => $grouping,
                    'data' => $records->toArray(),
                ];
            }
        }

        // Sort by category name
        usort($results, function ($a, $b) {
            return strcmp($a['categoryName'], $b['categoryName']);
        });

        return $results;
    }

    /**
     * Get all categories dengan metadata
     */
    public function getAllCategories(): array
    {
        // Define urutan kategori sesuai MasterSBM
        $categoryOrder = [
            // Honorarium 28-39
            'honorarium_28',
            'honorarium_29',
            'honorarium_30',
            'honorarium_31',
            'honorarium_32',
            'honorarium_33',
            'honorarium_34',
            'honorarium_35',
            'honorarium_36',
            'honorarium_37',
            'honorarium_38',
            'honorarium_39',
            // Section 1-19
            'transportasi_provinsi',
            'transportasi_dki',
            'transportasi_kabupaten',
            'pemeliharaan_sarana_kantor',
            'penerjemahan_pengetikan',
            'beasiswa',
            'sewa_fotokopi',
            'honorarium_narasumber',
            'bahan_makanan',
            'konsumsi_tahanan',
            'keperluan_perkantoran',
            'penggantian_inventaris',
            'pemeliharaan_kendaraan',
            'pemeliharaan_gedung',
            'sewa_gedung',
            'transportasi_terminal',
            'tiket_pesawat_dalam_negeri',
            'tiket_pesawat_luar_negeri',
            'perwakilan_ri',
        ];

        $categories = SbmDetail::selectRaw('
            category,
            source_file,
            COUNT(*) as total_records,
            MIN(created_at) as last_updated
        ')
        ->groupBy('category', 'source_file')
        ->get()
        ->map(function ($item) {
            return [
                'category' => $item->category,
                'source_file' => $item->source_file,
                'total_records' => (int) $item->total_records,
                'last_updated' => $item->last_updated,
            ];
        })
        ->sortBy(function ($item) use ($categoryOrder) {
            $index = array_search($item['category'], $categoryOrder);
            return $index === false ? 999 : $index;
        })
        ->values();

        return $categories->toArray();
    }

    /**
     * Get data by category dengan filter, search, sort, pagination
     */
    public function getByCategory(string $category, array $filters): LengthAwarePaginator
    {
        $query = SbmDetail::where('category', $category);

        // Apply Filters
        $this->applyFilters($query, $filters);

        // Apply Search
        $this->applySearch($query, $filters['search'] ?? null);

        // Apply Sorting
        $this->applySorting($query, $filters);

        // Pagination
        $perPage = $filters['per_page'] ?? 15;
        $page = $filters['page'] ?? 1;

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get available filter options
     */
    public function getFilterOptions(): array
    {
        // Get categories
        $categories = SbmDetail::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->toArray();

        // Get sub_categories from database column
        $subCategories = SbmDetail::select('sub_category')
            ->distinct()
            ->whereNotNull('sub_category')
            ->where('sub_category', '!=', '')
            ->orderBy('sub_category')
            ->pluck('sub_category')
            ->toArray();

        // Get parent_sections from database column
        $parentSections = SbmDetail::select('parent_section')
            ->distinct()
            ->whereNotNull('parent_section')
            ->where('parent_section', '!=', '')
            ->orderBy('parent_section')
            ->pluck('parent_section')
            ->toArray();

        // Get grouping_labels from database column
        $groupingLabels = SbmDetail::select('grouping_label')
            ->distinct()
            ->whereNotNull('grouping_label')
            ->where('grouping_label', '!=', '')
            ->orderBy('grouping_label')
            ->pluck('grouping_label')
            ->toArray();

        return [
            'categories' => $categories,
            'sub_categories' => $subCategories,
            'parent_sections' => $parentSections,
            'grouping_labels' => $groupingLabels,
        ];
    }

    /**
     * Get filter options by specific category
     */
    public function getFilterOptionsByCategory(string $category): array
    {
        // Get all data for this category (including grouping fields)
        $records = SbmDetail::where('category', $category)
            ->select('data', 'source_file', 'parent_section', 'sub_category', 'grouping_label')
            ->get();

        // Check which grouping fields have values
        $hasParentSection = $records->contains(function ($record) {
            return !empty($record->parent_section);
        });
        $hasSubCategory = $records->contains(function ($record) {
            return !empty($record->sub_category);
        });
        $hasGroupingLabel = $records->contains(function ($record) {
            return !empty($record->grouping_label);
        });

        // Collect source files
        $sourceFiles = [];
        foreach ($records as $record) {
            if (!empty($record->source_file) && !in_array($record->source_file, $sourceFiles)) {
                $sourceFiles[] = $record->source_file;
            }
        }
        sort($sourceFiles);

        $filterOptions = [];

        if ($hasParentSection && $hasSubCategory) {
            // Nested: parent_section -> sub_category
            foreach ($records as $record) {
                $parent = $record->parent_section ?? 'General';
                $sub = $record->sub_category ?? 'General';

                if (!isset($filterOptions[$parent])) {
                    $filterOptions[$parent] = [];
                }
                if (!isset($filterOptions[$parent][$sub])) {
                    $filterOptions[$parent][$sub] = [];
                }

                $data = $record->data;
                if (is_array($data)) {
                    foreach ($data as $key => $value) {
                        if (in_array($key, ['_detected_currency', '_row_number'])) {
                            continue;
                        }
                        if ($value === null || $value === '' || trim($value) === '') {
                            continue;
                        }
                        if (!isset($filterOptions[$parent][$sub][$key])) {
                            $filterOptions[$parent][$sub][$key] = [];
                        }
                        if (!in_array($value, $filterOptions[$parent][$sub][$key])) {
                            $filterOptions[$parent][$sub][$key][] = $value;
                        }
                    }
                }
            }

            // Sort nested arrays
            foreach ($filterOptions as $parent => $subGroups) {
                ksort($subGroups);
                foreach ($subGroups as $sub => $options) {
                    foreach ($options as $key => $values) {
                        sort($filterOptions[$parent][$sub][$key]);
                    }
                }
            }
        } elseif ($hasParentSection && $hasGroupingLabel) {
            // Nested: parent_section -> grouping_label
            foreach ($records as $record) {
                $parent = $record->parent_section ?? 'General';
                $group = $record->grouping_label ?? 'General';

                if (!isset($filterOptions[$parent])) {
                    $filterOptions[$parent] = [];
                }
                if (!isset($filterOptions[$parent][$group])) {
                    $filterOptions[$parent][$group] = [];
                }

                $data = $record->data;
                if (is_array($data)) {
                    foreach ($data as $key => $value) {
                        if (in_array($key, ['_detected_currency', '_row_number'])) {
                            continue;
                        }
                        if ($value === null || $value === '' || trim($value) === '') {
                            continue;
                        }
                        if (!isset($filterOptions[$parent][$group][$key])) {
                            $filterOptions[$parent][$group][$key] = [];
                        }
                        if (!in_array($value, $filterOptions[$parent][$group][$key])) {
                            $filterOptions[$parent][$group][$key][] = $value;
                        }
                    }
                }
            }

            // Sort nested arrays
            foreach ($filterOptions as $parent => $groups) {
                ksort($groups);
                foreach ($groups as $group => $options) {
                    foreach ($options as $key => $values) {
                        sort($filterOptions[$parent][$group][$key]);
                    }
                }
            }
        } elseif ($hasSubCategory && $hasGroupingLabel) {
            // Nested: sub_category -> grouping_label
            foreach ($records as $record) {
                $sub = $record->sub_category ?? 'General';
                $group = $record->grouping_label ?? 'General';

                if (!isset($filterOptions[$sub])) {
                    $filterOptions[$sub] = [];
                }
                if (!isset($filterOptions[$sub][$group])) {
                    $filterOptions[$sub][$group] = [];
                }

                $data = $record->data;
                if (is_array($data)) {
                    foreach ($data as $key => $value) {
                        if (in_array($key, ['_detected_currency', '_row_number'])) {
                            continue;
                        }
                        if ($value === null || $value === '' || trim($value) === '') {
                            continue;
                        }
                        if (!isset($filterOptions[$sub][$group][$key])) {
                            $filterOptions[$sub][$group][$key] = [];
                        }
                        if (!in_array($value, $filterOptions[$sub][$group][$key])) {
                            $filterOptions[$sub][$group][$key][] = $value;
                        }
                    }
                }
            }

            // Sort nested arrays
            foreach ($filterOptions as $sub => $groups) {
                ksort($groups);
                foreach ($groups as $group => $options) {
                    foreach ($options as $key => $values) {
                        sort($filterOptions[$sub][$group][$key]);
                    }
                }
            }
        } elseif ($hasParentSection) {
            // Group by parent_section only
            foreach ($records as $record) {
                $parent = $record->parent_section ?? 'General';
                if (!isset($filterOptions[$parent])) {
                    $filterOptions[$parent] = [];
                }

                $data = $record->data;
                if (is_array($data)) {
                    foreach ($data as $key => $value) {
                        if (in_array($key, ['_detected_currency', '_row_number'])) {
                            continue;
                        }
                        if ($value === null || $value === '' || trim($value) === '') {
                            continue;
                        }
                        if (!isset($filterOptions[$parent][$key])) {
                            $filterOptions[$parent][$key] = [];
                        }
                        if (!in_array($value, $filterOptions[$parent][$key])) {
                            $filterOptions[$parent][$key][] = $value;
                        }
                    }
                }
            }

            // Sort arrays
            foreach ($filterOptions as $parent => $options) {
                foreach ($options as $key => $values) {
                    sort($filterOptions[$parent][$key]);
                }
            }
        } elseif ($hasSubCategory) {
            // Group by sub_category only
            foreach ($records as $record) {
                $sub = $record->sub_category ?? 'General';
                if (!isset($filterOptions[$sub])) {
                    $filterOptions[$sub] = [];
                }

                $data = $record->data;
                if (is_array($data)) {
                    foreach ($data as $key => $value) {
                        if (in_array($key, ['_detected_currency', '_row_number'])) {
                            continue;
                        }
                        if ($value === null || $value === '' || trim($value) === '') {
                            continue;
                        }
                        if (!isset($filterOptions[$sub][$key])) {
                            $filterOptions[$sub][$key] = [];
                        }
                        if (!in_array($value, $filterOptions[$sub][$key])) {
                            $filterOptions[$sub][$key][] = $value;
                        }
                    }
                }
            }

            // Sort arrays
            foreach ($filterOptions as $sub => $options) {
                foreach ($options as $key => $values) {
                    sort($filterOptions[$sub][$key]);
                }
            }
        } elseif ($hasGroupingLabel) {
            // Group by grouping_label only
            foreach ($records as $record) {
                $group = $record->grouping_label ?? 'General';
                if (!isset($filterOptions[$group])) {
                    $filterOptions[$group] = [];
                }

                $data = $record->data;
                if (is_array($data)) {
                    foreach ($data as $key => $value) {
                        if (in_array($key, ['_detected_currency', '_row_number'])) {
                            continue;
                        }
                        if ($value === null || $value === '' || trim($value) === '') {
                            continue;
                        }
                        if (!isset($filterOptions[$group][$key])) {
                            $filterOptions[$group][$key] = [];
                        }
                        if (!in_array($value, $filterOptions[$group][$key])) {
                            $filterOptions[$group][$key][] = $value;
                        }
                    }
                }
            }

            // Sort arrays
            foreach ($filterOptions as $group => $options) {
                foreach ($options as $key => $values) {
                    sort($filterOptions[$group][$key]);
                }
            }
        } else {
            // No grouping - all fields flat
            foreach ($records as $record) {
                $data = $record->data;
                if (is_array($data)) {
                    foreach ($data as $key => $value) {
                        if (in_array($key, ['_detected_currency', '_row_number'])) {
                            continue;
                        }
                        if ($value === null || $value === '' || trim($value) === '') {
                            continue;
                        }
                        if (!isset($filterOptions[$key])) {
                            $filterOptions[$key] = [];
                        }
                        if (!in_array($value, $filterOptions[$key])) {
                            $filterOptions[$key][] = $value;
                        }
                    }
                }
            }

            // Sort arrays
            foreach ($filterOptions as $key => $values) {
                sort($filterOptions[$key]);
            }
        }

        // Sort groups alphabetically
        ksort($filterOptions);

        // Build metadata
        $metadata = [
            '_source_files' => $sourceFiles,
            '_grouping_fields' => array_filter([
                $hasParentSection ? 'parent_section' : null,
                $hasSubCategory ? 'sub_category' : null,
                $hasGroupingLabel ? 'grouping_label' : null,
            ]),
        ];

        return $metadata + $filterOptions;
    }

    /**
     * Get summary statistics
     */
    public function getSummary(): array
    {
        $totalRecords = SbmDetail::count();
        $totalCategories = SbmDetail::select('category')
            ->distinct()
            ->count();

        $byCategory = SbmDetail::selectRaw('
            category,
            COUNT(*) as total
        ')
        ->groupBy('category')
        ->orderBy('category')
        ->get()
        ->pluck('total', 'category')
        ->toArray();

        return [
            'total_records' => $totalRecords,
            'total_categories' => $totalCategories,
            'by_category' => $byCategory,
        ];
    }

    /**
     * Get single record by ID
     */
    public function getById(int $id): ?SbmDetail
    {
        return SbmDetail::find($id);
    }

    /**
     * Apply search across all JSON data fields
     */
    private function applySearchAllFields($query, string $searchTerm): void
    {
        // Normalize search term: remove spaces
        $normalizedSearch = preg_replace('/\s+/', '', strtolower($searchTerm));

        // Split into words for strict matching
        $searchWords = array_filter(explode(' ', $normalizedSearch));

        // Build search query
        $query->where(function ($q) use ($searchWords) {
            // Search in all JSON fields using raw JSONB query
            $q->whereRaw("EXISTS (
                SELECT 1
                FROM jsonb_each_text(data)
                WHERE lower(replace(value::text, '\\s+', '')) LIKE ?
            )", ['%' . $searchWords[0] . '%']);

            // If multiple words, ensure ALL words exist
            foreach (array_slice($searchWords, 1) as $word) {
                $q->whereRaw("EXISTS (
                    SELECT 1
                    FROM jsonb_each_text(data)
                    WHERE lower(replace(value::text, '\\s+', '')) LIKE ?
                )", ['%' . $word . '%']);
            }

            // Also search in source_file, parent_section, sub_category
            foreach ($searchWords as $word) {
                $q->orWhere('source_file', 'ilike', '%' . $word . '%')
                  ->orWhere('parent_section', 'ilike', '%' . $word . '%')
                  ->orWhere('sub_category', 'ilike', '%' . $word . '%');
            }
        });
    }

    /**
     * Get category label from defined labels
     */
    private function getCategoryLabel(string $category): string
    {
        $labels = [
            'honorarium_28' => 'Honorarium 28 SATUAN BIAYA UANG HARIAN DAN UANG REPRESENTASI PERJALANAN DINAS DALAM NEGERI',
            'honorarium_29' => 'Honorarium 29 SATUAN BIAYA UANG HARIAN PERJALANAN DINAS LUAR NEGERI',
            'honorarium_30' => 'Honorarium 30 SATUAN BIAYA PENGINAPAN PERJALANAN DINAS DALAM NEGERI',
            'honorarium_31' => 'Honorarium 31 SATUAN BIAYA PAKET KEGIATAN RAPAT/PERTEMUAN DI LUAR KANTOR',
            'honorarium_32' => 'Honorarium 32 SATUAN BIAYA TIKET PERJALANAN DINAS PINDAH LUAR NEGERI',
            'honorarium_33' => 'Honorarium 33 SATUAN BIAYA OPERASIONAL KEPALA PERWAKILAN RI LUAR NEGERI',
            'honorarium_34' => 'Honorarium 34 SATUAN BIAYA MAKANAN PENAMBAH DAYA TAHAN TUBUH',
            'honorarium_35' => 'Honorarium 35 SATUAN BIAYA SEWA KENDARAAN',
            'honorarium_36' => 'Honorarium 36 SATUAN BIAYA PENGADAAN KENDARAAN DINAS',
            'honorarium_37' => 'Honorarium 37 SATUAN BIAYA PENGADAAN PAKAIAN DINAS',
            'honorarium_38' => 'Honorarium 38 SATUAN BIAYA KONSUMSI RAPAT/PERTEMUAN',
            'honorarium_39' => 'Honorarium 39 SATUAN BIAYA KONSUMSI DIKLAT',
            'transportasi_provinsi' => 'Section 1 SATUAN BIAYA TRANSPORTASI PROVINSI',
            'transportasi_dki' => 'Section 2 SATUAN BIAYA TRANSPORTASI DKI JAKARTA',
            'transportasi_kabupaten' => 'Section 3 SATUAN BIAYA TRANSPORTASI KABUPATEN',
            'pemeliharaan_sarana_kantor' => 'Section 4 SATUAN BIAYA PEMELIHARAAN SARANA KANTOR',
            'penerjemahan_pengetikan' => 'Section 5 SATUAN BIAYA PENERJEMAHAN DAN PENGETIKAN',
            'beasiswa' => 'Section 6 SATUAN BIAYA BEASISWA',
            'sewa_fotokopi' => 'Section 7 SATUAN BIAYA SEWA FOTOKOPI',
            'honorarium_narasumber' => 'Section 8 SATUAN BIAYA HONORARIUM NARASUMBER',
            'bahan_makanan' => 'Section 9 SATUAN BIAYA BAHAN MAKANAN',
            'konsumsi_tahanan' => 'Section 10 SATUAN BIAYA KONSUMSI TAHANAN',
            'keperluan_perkantoran' => 'Section 11 SATUAN BIAYA KEPERLUAN PERKANTORAN',
            'penggantian_inventaris' => 'Section 12 SATUAN BIAYA PENGGANTIAN INVENTARIS',
            'pemeliharaan_kendaraan' => 'Section 13 SATUAN BIAYA PEMELIHARAAN KENDARAAN',
            'pemeliharaan_gedung' => 'Section 14 SATUAN BIAYA PEMELIHARAAN GEDUNG',
            'sewa_gedung' => 'Section 15 SATUAN BIAYA SEWA GEDUNG',
            'transportasi_terminal' => 'Section 16 SATUAN BIAYA TRANSPORTASI TERMINAL',
            'tiket_pesawat_dalam_negeri' => 'Section 17 SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS DALAM NEGERI',
            'tiket_pesawat_luar_negeri' => 'Section 18 SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS LUAR NEGERI',
            'perwakilan_ri' => 'Section 19 SATUAN BIAYA PERWAKILAN RI LUAR NEGERI',
        ];

        return $labels[$category] ?? $category;
    }

    /**
     * Get category group
     */
    private function getCategoryGroup(string $category): string
    {
        if (str_starts_with($category, 'honorarium_')) {
            return 'Honorarium';
        }
        return 'Section';
    }

    /**
     * Check if category has grouping_label field
     */
    private function hasGroupingLabel(string $categoryKey): bool
    {
        return in_array($categoryKey, ['honorarium_29', 'honorarium_32', 'honorarium_33']);
    }

    /**
     * Check if category has sub_category field
     */
    private function hasSubCategory(string $categoryKey): bool
    {
        return $categoryKey === 'honorarium_31';
    }

    /**
     * Get grouping metadata for a category
     * Returns total_count and match_count for each group
     */
    private function getGroupingMetadata(string $categoryKey, array $filteredData): array
    {
        // Get ALL records for this category (to calculate total counts)
        $allRecords = SbmDetail::where('category', $categoryKey)->get();
        $grouping = [];

        // Case 1: grouping_label (H29, H32, H33)
        if ($this->hasGroupingLabel($categoryKey)) {
            $groups = [];

            // Build groups from all records
            foreach ($allRecords as $record) {
                $label = $record->grouping_label;
                if (!$label) continue;

                if (!isset($groups[$label])) {
                    $groups[$label] = [
                        'label' => $label,
                        'key' => $label,
                        'total_count' => 0,
                        'match_count' => 0,
                    ];
                }
                $groups[$label]['total_count']++;
            }

            // Count matches from filtered data
            $filteredIds = array_column($filteredData, 'id');
            foreach ($filteredData as $record) {
                $label = $record->grouping_label ?? null;
                if ($label && isset($groups[$label])) {
                    $groups[$label]['match_count']++;
                }
            }

            $grouping = array_values($groups);
        }
        // Case 2: parent_section + sub_category (H31)
        elseif ($this->hasSubCategory($categoryKey)) {
            $groups = [];

            foreach ($allRecords as $record) {
                $parent = $record->parent_section ?? '';
                $sub = $record->sub_category ?? '';
                $key = "{$parent}|{$sub}";
                $label = $sub ? "{$parent} - {$sub}" : $parent;

                if (!isset($groups[$key])) {
                    $groups[$key] = [
                        'label' => $label,
                        'key' => $key,
                        'total_count' => 0,
                        'match_count' => 0,
                    ];
                }
                $groups[$key]['total_count']++;
            }

            foreach ($filteredData as $record) {
                $parent = $record->parent_section ?? '';
                $sub = $record->sub_category ?? '';
                $key = "{$parent}|{$sub}";
                if (isset($groups[$key])) {
                    $groups[$key]['match_count']++;
                }
            }

            $grouping = array_values($groups);
        }
        // Case 3 & 4: parent_section grouping (H28, H30, Section files, etc)
        else {
            $parentSections = $allRecords->pluck('parent_section')->unique()->filter()->toArray();

            if (count($parentSections) > 1) {
                // Multiple parent_sections - create groups
                foreach ($parentSections as $section) {
                    $totalInSection = $allRecords->where('parent_section', $section)->count();
                    $matchInSection = collect($filteredData)->where('parent_section', $section)->count();

                    $grouping[] = [
                        'label' => $section,
                        'key' => $section,
                        'total_count' => $totalInSection,
                        'match_count' => $matchInSection,
                    ];
                }
            } elseif (count($parentSections) === 1) {
                // Single parent_section - create one group
                $section = $parentSections[0];
                $totalInSection = $allRecords->where('parent_section', $section)->count();
                $matchInSection = collect($filteredData)->where('parent_section', $section)->count();

                $grouping[] = [
                    'label' => $section,
                    'key' => $section,
                    'total_count' => $totalInSection,
                    'match_count' => $matchInSection,
                ];
            } else {
                // No parent_section - create "All Data" group
                $grouping[] = [
                    'label' => 'Semua Data',
                    'key' => 'all',
                    'total_count' => $allRecords->count(),
                    'match_count' => count($filteredData),
                ];
            }
        }

        return $grouping;
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Apply filters (provinsi, grouping, sub_category)
     */
    private function applyFilters($query, array $filters): void
    {
        // Filter by Provinsi
        if (!empty($filters['provinsi'])) {
            $query->where('data->provinsi', $filters['provinsi']);
        }

        // Filter by Grouping Label
        if (!empty($filters['grouping'])) {
            $query->where('data->grouping_label', $filters['grouping']);
        }

        // Filter by Sub Category
        if (!empty($filters['sub_category'])) {
            $query->where('sub_category', $filters['sub_category']);
        }

        // Filter by Parent Section
        if (!empty($filters['parent_section'])) {
            $query->where('parent_section', $filters['parent_section']);
        }
    }

    /**
     * Apply search (keyword search di uraian, provinsi)
     */
    private function applySearch($query, ?string $keyword): void
    {
        if (empty($keyword)) {
            return;
        }

        $query->where(function ($q) use ($keyword) {
            $q->where('data->uraian', 'ilike', '%' . $keyword . '%')
              ->orWhere('data->provinsi', 'ilike', '%' . $keyword . '%')
              ->orWhere('data->keterangan', 'ilike', '%' . $keyword . '%');
        });
    }

    /**
     * Apply sorting
     */
    private function applySorting($query, array $filters): void
    {
        $sortBy = $filters['sort_by'] ?? 'id';
        $order = $filters['order'] ?? 'asc';

        // Mapping sort_by ke kolom database
        $sortColumn = match($sortBy) {
            'no' => 'data->no',
            'provinsi' => 'data->provinsi',
            'uraian' => 'data->uraian',
            'besaran' => 'data->besaran',
            default => 'id',
        };

        $query->orderBy($sortColumn, $order);
    }
}
