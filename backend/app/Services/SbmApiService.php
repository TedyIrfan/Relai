<?php

namespace App\Services;

use App\Models\SbmDetail;
use Illuminate\Pagination\LengthAwarePaginator;

class SbmApiService
{
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
            $query->where('data->sub_category', $filters['sub_category']);
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
