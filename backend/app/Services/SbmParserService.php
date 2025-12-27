<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use PhpOffice\PhpSpreadsheet\Reader\Xls;
use PhpOffice\PhpSpreadsheet\Reader\Csv;

class SbmParserService
{
    private string $basePath;
    private string $scanReportPath;
    private array $scanReport;
    private SbmMappingService $mapping;
    private string $currentGroupingLabel = '';
    private ?string $currentGolonganLabel = null;

    public function __construct(SbmMappingService $mapping)
    {
        $this->basePath = __DIR__ . '/../../storage/imports/Master_SBM/';
        $this->scanReportPath = __DIR__ . '/../../storage/sbm_scan_report.json';
        $this->mapping = $mapping;
        $this->loadScanReport();
    }

    /**
     * Load scan report JSON
     */
    private function loadScanReport(): void
    {
        if (!file_exists($this->scanReportPath)) {
            throw new \Exception("Scan report not found. Please run scanner first.");
        }

        $json = file_get_contents($this->scanReportPath);
        $this->scanReport = json_decode($json, true);
    }

    /**
     * Parse all files from scan report
     */
    public function parseAll(?callable $progressCallback = null): array
    {
        $allData = [];
        $stats = ['imported' => 0, 'skipped' => 0];
        $fileStats = [];

        foreach ($this->scanReport['files'] as $fileInfo) {
            if ($fileInfo['status'] === 'success') {
                // Progress callback BEFORE parsing
                if ($progressCallback) {
                    $progressCallback($fileInfo, 'before', null);
                }

                $result = $this->parseFile($fileInfo);
                $allData = array_merge($allData, $result['data']);
                $stats['imported'] += count($result['data']);
                $stats['skipped'] += $result['skipped'];

                // Collect file stats
                $fileStats[] = [
                    'label' => $fileInfo['label'] ?? $fileInfo['filename'],
                    'category' => $result['category'],
                    'imported' => count($result['data']),
                    'skipped' => $result['skipped'],
                    'skipped_rows' => $result['skipped_rows'],
                ];

                // Progress callback AFTER parsing
                if ($progressCallback) {
                    $progressCallback($fileInfo, 'after', $fileStats[count($fileStats) - 1]);
                }
            }
        }

        return [
            'data' => $allData,
            'stats' => $stats,
            'file_stats' => $fileStats,
        ];
    }

    /**
     * Parse a single file
     */
    public function parseFile(array $fileInfo): array
    {
        $filename = $fileInfo['filename'];
        $category = $fileInfo['category'];
        $filepath = $this->basePath . $filename;

        if (!file_exists($filepath)) {
            return ['data' => [], 'skipped' => 0, 'skipped_rows' => [], 'category' => $category];
        }

        try {
            $spreadsheet = $this->readFile($filepath);
            if ($spreadsheet === null) {
                return ['data' => [], 'skipped' => 0, 'skipped_rows' => [], 'category' => $category];
            }

            $result = [];
            $totalSkipped = 0;
            $allSkippedRows = [];
            $fileCategory = $category;

            foreach ($fileInfo['sheets'] as $sheetInfo) {
                $sheet = $spreadsheet->getSheetByName($sheetInfo['name']);
                if ($sheet) {
                    $parsed = $this->parseSheet($sheet, $sheetInfo, $category);
                    $result = array_merge($result, $parsed['data']);
                    $totalSkipped += $parsed['skipped'];
                    $allSkippedRows = array_merge($allSkippedRows, $parsed['skipped_rows']);
                    $fileCategory = $parsed['category'];
                }
            }

            return [
                'data' => $result,
                'skipped' => $totalSkipped,
                'skipped_rows' => $allSkippedRows,
                'category' => $fileCategory,
            ];

        } catch (\Exception $e) {
            echo "Error parsing {$filename}: " . $e->getMessage() . "\n";
            return ['data' => [], 'skipped' => 0, 'skipped_rows' => [], 'category' => $category];
        }
    }

    /**
     * Try to read file with multiple readers
     */
    private function readFile(string $filepath)
    {
        $readers = [
            'Xlsx' => new Xlsx(),
            'Xls' => new Xls(),
            'Csv' => new Csv(),
        ];

        foreach ($readers as $name => $reader) {
            try {
                return $reader->load($filepath);
            } catch (\Exception $e) {
                continue;
            }
        }

        return null;
    }

    /**
     * Parse a sheet
     */
    public function parseSheet($sheet, array $sheetInfo, string $category): array
    {
        $result = [];
        $totalSkipped = 0;
        $allSkippedRows = [];

        // Check if this sheet has sub-sections (multiple headers)
        if (!empty($sheetInfo['sub_sections'])) {
            // Parse each sub-section separately
            foreach ($sheetInfo['sub_sections'] as $subSection) {
                $parsed = $this->parseSubSection($sheet, $subSection, $category, $sheetInfo);
                $result = array_merge($result, $parsed['data']);
                $totalSkipped += $parsed['skipped'];
                $allSkippedRows = array_merge($allSkippedRows, $parsed['skipped_rows']);
            }
        } else {
            // Parse as single section
            $parsed = $this->parseSingleSection($sheet, $sheetInfo, $category);
            $result = array_merge($result, $parsed['data']);
            $totalSkipped += $parsed['skipped'];
            $allSkippedRows = array_merge($allSkippedRows, $parsed['skipped_rows']);
        }

        return [
            'data' => $result,
            'skipped' => $totalSkipped,
            'skipped_rows' => $allSkippedRows,
            'category' => $category,
        ];
    }

    /**
     * Parse a sub-section (with its own header)
     */
    private function parseSubSection($sheet, array $subSectionInfo, string $category, array $sheetInfo): array
    {
        $result = [];
        $structure = $this->mapping->getStructure($category);
        $sectionLabel = $subSectionInfo['label'];

        // Reset grouping label for new sub-section
        $this->currentGroupingLabel = '';
        // Reset golongan label for new sub-section
        $this->currentGolonganLabel = null;

        // Determine sub-category and parent-section from section label
        $categoryInfo = $this->getSubCategoryFromSectionLabel($sectionLabel, $category);
        $subCategory = $categoryInfo['sub_category'] ?? null;
        $parentSection = $categoryInfo['parent_section'] ?? null;

        $currency = $this->mapping->getCurrency($category, $subCategory);
        $columns = $this->getColumnsForSubSection($category, $subCategory, $subSectionInfo);

        $headerRow = $subSectionInfo['header_row'];
        $dataStartRow = $subSectionInfo['data_start_row'];
        $dataEndRow = $subSectionInfo['data_end_row'];

        // Check if this category has grouping
        $hasGrouping = isset($structure['has_grouping']) && $structure['has_grouping'];

        // Parse data rows
        $skippedCount = 0;
        $skippedRows = [];
        for ($row = $dataStartRow; $row <= $dataEndRow; $row++) {
            $rowData = $this->getRowData($sheet, $row, $columns);

            // Check if this is a grouping label row (for categories with grouping)
            if ($hasGrouping && $this->isGroupingLabelRow($rowData, $category)) {
                $this->currentGroupingLabel = $this->extractGroupingLabel($rowData);
                $skippedCount++;
                $skippedRows[] = [
                    'row_number' => $row,
                    'data' => $rowData,
                    'reason' => 'Grouping label: ' . $this->currentGroupingLabel,
                ];
                continue;
            }

            if ($this->isValidDataRow($rowData)) {
                $result[] = [
                    'category' => $category,
                    'sub_category' => $subCategory,
                    'parent_section' => $parentSection,
                    'grouping_label' => $this->currentGroupingLabel ?: null,
                    'data' => json_encode($rowData),
                    'currency' => $currency,
                ];
            } else {
                $skippedCount++;
                $skippedRows[] = [
                    'row_number' => $row,
                    'data' => $rowData,
                    'reason' => $this->getSkipReason($rowData),
                ];
            }
        }

        return [
            'data' => $result,
            'skipped' => $skippedCount,
            'skipped_rows' => $skippedRows,
        ];
    }

    /**
     * Parse a single section (no sub-sections)
     */
    private function parseSingleSection($sheet, array $sheetInfo, string $category): array
    {
        $result = [];
        $structure = $this->mapping->getStructure($category);
        $subCategory = null;
        $parentSection = null; // Single section files have no subdivisions

        // Reset grouping label for new file
        $this->currentGroupingLabel = '';

        // Check if this category has sub-categories
        if (isset($structure['sub_categories']) && !empty($sheetInfo['sections'])) {
            // Use the first section as sub-category
            $subCategory = array_key_first($structure['sub_categories']);
        }

        $currency = $this->mapping->getCurrency($category, $subCategory);
        $columns = $sheetInfo['columns'];

        // Normalize column names
        $normalizedColumns = [];
        foreach ($columns as $col) {
            $normalizedColumns[] = $this->mapping->normalizeColumnName($col, $category, $subCategory);
        }

        $headerRow = $sheetInfo['header_row'];
        $dataStartRow = $sheetInfo['data_start_row'];
        $dataEndRow = $sheetInfo['data_end_row'];

        // Check if this category has grouping
        $hasGrouping = isset($structure['has_grouping']) && $structure['has_grouping'];

        // Check for sections (region labels like "AMERIKA UTARA")
        $currentSection = null;

        // Parse data rows
        $skippedCount = 0;
        $skippedRows = [];
        for ($row = $dataStartRow; $row <= $dataEndRow; $row++) {
            $rawRowData = $this->getRawRowData($sheet, $row, count($columns));

            // Check if this is a grouping label row (for categories with grouping)
            if ($hasGrouping && $this->isGroupingLabelRowArray($rawRowData, $category)) {
                $this->currentGroupingLabel = $this->extractGroupingLabelFromArray($rawRowData);
                $skippedCount++;
                $skippedRows[] = [
                    'row_number' => $row,
                    'data' => $rawRowData,
                    'reason' => 'Grouping label: ' . $this->currentGroupingLabel,
                ];
                continue;
            }

            // Check if this is a section label (like "AMERIKA UTARA") - legacy
            if ($this->isSectionLabel($rawRowData)) {
                $currentSection = implode(' ', $rawRowData);
                // For categories without grouping, use section as grouping
                if (!$hasGrouping) {
                    $this->currentGroupingLabel = $currentSection;
                }
                $skippedCount++;
                $skippedRows[] = [
                    'row_number' => $row,
                    'data' => $rawRowData,
                    'reason' => 'Section label: ' . $currentSection,
                ];
                continue;
            }

            // Map to normalized columns
            $rowData = [];
            foreach ($normalizedColumns as $index => $key) {
                $rowData[$key] = $rawRowData[$index] ?? null;
            }

            // Clean data values
            $rowData = $this->cleanDataRow($rowData, $category, $subCategory);

            if ($this->isValidDataRow($rowData)) {
                $result[] = [
                    'category' => $category,
                    'sub_category' => $subCategory,
                    'parent_section' => $parentSection,
                    'grouping_label' => $this->currentGroupingLabel ?: null,
                    'data' => json_encode($rowData),
                    'currency' => $currency,
                ];
            } else {
                $skippedCount++;
                $skippedRows[] = [
                    'row_number' => $row,
                    'data' => $rowData,
                    'reason' => $this->getSkipReason($rowData),
                ];
            }
        }

        return [
            'data' => $result,
            'skipped' => $skippedCount,
            'skipped_rows' => $skippedRows,
        ];
    }

    /**
     * Get row data for sub-section
     */
    private function getRowData($sheet, int $row, array $columns): array
    {
        $rowData = [];

        foreach ($columns as $index => $columnName) {
            $cell = $sheet->getCell([$index + 1, $row]);
            $value = $this->getCellValue($cell);
            $key = $this->normalizeKey($columnName);
            $rowData[$key] = $this->cleanValue($value, $key);
        }

        return $rowData;
    }

    /**
     * Get raw row data from sheet
     */
    private function getRawRowData($sheet, int $row, int $expectedCols): array
    {
        $rowData = [];

        for ($col = 1; $col <= $expectedCols; $col++) {
            $cell = $sheet->getCell([$col, $row]);
            $rowData[] = $this->getCellValue($cell);
        }

        return $rowData;
    }

    /**
     * Get cell value
     */
    private function getCellValue($cell): string
    {
        $value = trim((string)$cell->getFormattedValue());
        return $value;
    }

    /**
     * Normalize key from column name
     */
    private function normalizeKey(string $columnName): string
    {
        $key = strtolower($columnName);
        $key = preg_replace('/[^a-z0-9]+/', '_', $key);
        $key = trim($key, '_');
        return $key;
    }

    /**
     * Clean a single value
     */
    private function cleanValue(string $value, string $key): string
    {
        // Remove common currency prefixes
        $value = preg_replace('/^Rp\s*/', '', $value);
        $value = preg_replace('/^\$\s*/', '', $value);
        $value = preg_replace('/^USD\s*/', '', $value);

        // Remove thousand separators
        $value = str_replace(['.', ','], '', $value);

        // Clean up extra spaces
        $value = preg_replace('/\s+/', ' ', $value);
        $value = trim($value);

        // Handle empty/dash values
        if ($value === '' || $value === '-' || $value === '()') {
            return '';
        }

        return $value;
    }

    /**
     * Clean entire data row based on category
     */
    private function cleanDataRow(array $rowData, string $category, ?string $subCategory): array
    {
        $cleaned = [];

        foreach ($rowData as $key => $value) {
            $cleaned[$key] = $this->cleanValue($value, $key);
        }

        return $cleaned;
    }

    /**
     * Check if row is a section label
     */
    private function isSectionLabel(array $rowData): bool
    {
        if (count($rowData) < 2) {
            return false;
        }

        $firstCell = trim($rowData[0]);

        // Check if first cell looks like a section label (uppercase, no numbers)
        if (preg_match('/^[A-Z\s]+$/', $firstCell) && strlen($firstCell) > 3) {
            // Also check that it doesn't look like data (no currency symbols, etc)
            $text = implode(' ', $rowData);
            if (!preg_match('/[\d\$Rp]/', $text)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if row is a grouping label row (for categories with grouping)
     * This checks the associative array version (key-value pairs)
     */
    private function isGroupingLabelRow(array $rowData, string $category): bool
    {
        $structure = $this->mapping->getStructure($category);

        // Only check for categories that have grouping
        if (!isset($structure['has_grouping']) || !$structure['has_grouping']) {
            return false;
        }

        // Skip penomoran rows first
        if ($this->isPenomoranRow($rowData)) {
            return false;
        }

        // Grouping label usually has only 1 non-empty field
        $nonEmptyCount = 0;
        foreach ($rowData as $value) {
            if (!empty($value) && $value !== '' && $value !== '-') {
                $nonEmptyCount++;
            }
        }

        // If only 1 field is filled and it's not a penomoran, it's likely a grouping label
        if ($nonEmptyCount === 1) {
            return true;
        }

        return false;
    }

    /**
     * Check if row array is a grouping label row (for parseSingleSection)
     * This checks the indexed array version
     */
    private function isGroupingLabelRowArray(array $rowData, string $category): bool
    {
        $structure = $this->mapping->getStructure($category);

        // Only check for categories that have grouping
        if (!isset($structure['has_grouping']) || !$structure['has_grouping']) {
            return false;
        }

        // Skip penomoran rows first
        if ($this->isPenomoranRow($rowData)) {
            return false;
        }

        // Grouping label usually has only 1 non-empty field
        $nonEmptyCount = 0;
        foreach ($rowData as $value) {
            if (!empty($value) && trim($value) !== '' && trim($value) !== '-') {
                $nonEmptyCount++;
            }
        }

        // If only 1 field is filled and it's not a penomoran, it's likely a grouping label
        if ($nonEmptyCount === 1) {
            return true;
        }

        return false;
    }

    /**
     * Extract grouping label from row data (associative array)
     */
    private function extractGroupingLabel(array $rowData): string
    {
        // Return the first non-empty value
        foreach ($rowData as $value) {
            if (!empty($value) && trim($value) !== '' && trim($value) !== '-') {
                return trim($value);
            }
        }
        return '';
    }

    /**
     * Extract grouping label from row data (indexed array)
     */
    private function extractGroupingLabelFromArray(array $rowData): string
    {
        // Return the first non-empty value
        foreach ($rowData as $value) {
            if (!empty($value) && trim($value) !== '' && trim($value) !== '-') {
                return trim($value);
            }
        }
        return '';
    }

    /**
     * Check if row is a golongan label row (e.g., "(A) Menteri dan Setingkat Menteri")
     * This detects patterns like (A), (B), (C) followed by text
     */
    private function isGolonganLabelRow(array $rowData): bool
    {
        foreach ($rowData as $value) {
            if (is_string($value) && preg_match('/^\([A-Z]\)\s+.+/', $value)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Extract golongan label from row data
     * Returns the text after (A), (B), etc.
     */
    private function extractGolonganLabel(array $rowData): ?string
    {
        foreach ($rowData as $value) {
            if (is_string($value) && preg_match('/^\([A-Z]\)\s+(.+)$/', $value, $matches)) {
                return trim($matches[1]);
            }
        }
        return null;
    }

    /**
     * Get sub-category and parent-section from section label
     * Maps section labels detected by scanner to database values
     * Returns array with 'sub_category' and 'parent_section' keys
     */
    private function getSubCategoryFromSectionLabel(string $sectionLabel, string $category): array
    {
        // Define mapping for all categories - based on MasterSBM.md
        $mapping = [
            // Honorarium 28
            'honorarium_28' => [
                'Uang Harian Perjalanan Dinas Dalam Negeri' => [
                    'sub_category' => null,
                    'parent_section' => '28.1 Uang Harian Perjalanan Dinas Dalam Negeri',
                ],
                'Uang Representasi Perjalanan Dinas Dalam Negeri' => [
                    'sub_category' => null,
                    'parent_section' => '28.2 Uang Representasi Perjalanan Dinas Dalam Negeri',
                ],
            ],
            // Honorarium 29 - No subdivisions
            'honorarium_29' => [
                'default' => [
                    'sub_category' => null,
                    'parent_section' => null,
                ],
            ],
            // Honorarium 30 - No subdivisions
            'honorarium_30' => [
                'default' => [
                    'sub_category' => null,
                    'parent_section' => null,
                ],
            ],
            // Honorarium 31 - WITH golongan
            'honorarium_31' => [
                'Menteri dan Setingkat Menteri' => [
                    'sub_category' => 'Menteri',
                    'parent_section' => '31.1 Paket Kegiatan Rapat/Pertemuan di Luar Kantor',
                ],
                'Pejabat Eselon I dan II' => [
                    'sub_category' => 'Eselon I-II',
                    'parent_section' => '31.1 Paket Kegiatan Rapat/Pertemuan di Luar Kantor',
                ],
                'Pejabat Eselon III Ke Bawah' => [
                    'sub_category' => 'Eselon III',
                    'parent_section' => '31.1 Paket Kegiatan Rapat/Pertemuan di Luar Kantor',
                ],
                'Uang Harian Kegiatan Rapat/Pertemuan di Luar Kantor' => [
                    'sub_category' => null,
                    'parent_section' => '31.2 Uang Harian Kegiatan Rapat/Pertemuan di Luar Kantor',
                ],
            ],
            // Honorarium 32 - No subdivisions
            'honorarium_32' => [
                'default' => [
                    'sub_category' => null,
                    'parent_section' => null,
                ],
            ],
            // Honorarium 33 - No subdivisions
            'honorarium_33' => [
                'default' => [
                    'sub_category' => null,
                    'parent_section' => null,
                ],
            ],
            // Honorarium 34 - No subdivisions
            'honorarium_34' => [
                'default' => [
                    'sub_category' => null,
                    'parent_section' => null,
                ],
            ],
            // Honorarium 35
            'honorarium_35' => [
                'Sewa Kendaraan Pelaksanaan Kegiatan Insidentil' => [
                    'sub_category' => null,
                    'parent_section' => '35.1 Sewa Kendaraan Pelaksanaan Kegiatan Insidentil',
                ],
                'Sewa Kendaraan Operasional Pejabat' => [
                    'sub_category' => null,
                    'parent_section' => '35.2 Sewa Kendaraan Operasional Pejabat',
                ],
                'Sewa Kendaraan Operasional Kantor dan/atau Lapangan' => [
                    'sub_category' => null,
                    'parent_section' => '35.3 Sewa Kendaraan Operasional Kantor dan/atau Lapangan',
                ],
            ],
            // Honorarium 36
            'honorarium_36' => [
                'Kendaraan Dinas Pejabat' => [
                    'sub_category' => null,
                    'parent_section' => '36.1 Kendaraan Dinas Pejabat',
                ],
                'Kendaraan Pejabat Eselon III sebagai Kepala Kantor, Operasional Kantor dan/atau Lapangan Roda 4 (Empat)' => [
                    'sub_category' => null,
                    'parent_section' => '36.2 Kendaraan Pejabat Eselon III sebagai Kepala Kantor, Operasional Kantor dan/atau Lapangan Roda 4 (Empat)',
                ],
                'Kendaraan Operasional Bus' => [
                    'sub_category' => null,
                    'parent_section' => '36.3 Kendaraan Operasional Bus',
                ],
                'Kendaraan Operasional Kantor dan/atau Lapangan Roda 2 (Dua)' => [
                    'sub_category' => null,
                    'parent_section' => '36.4 Kendaraan Operasional Kantor dan/atau Lapangan Roda 2 (Dua)',
                ],
                'Kendaraan Listrik Berbasis Baterai' => [
                    'sub_category' => null,
                    'parent_section' => '36.5 Kendaraan Listrik Berbasis Baterai',
                ],
            ],
            // Honorarium 37 - No subdivisions
            'honorarium_37' => [
                'default' => [
                    'sub_category' => null,
                    'parent_section' => null,
                ],
            ],
            // Honorarium 38 - No sub_sections detected, using default
            'honorarium_38' => [
                'default' => [
                    'sub_category' => null,
                    'parent_section' => null,
                ],
            ],
            // Honorarium 39 - No subdivisions
            'honorarium_39' => [
                'default' => [
                    'sub_category' => null,
                    'parent_section' => null,
                ],
            ],
            // Transportasi - No subdivisions
            'transportasi_provinsi' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            'transportasi_dki' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            'transportasi_kabupaten' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            'transportasi_terminal' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            // Pemeliharaan Sarana Kantor - No subdivisions
            'pemeliharaan_sarana_kantor' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            // Penerjemahan Pengetikan - No subdivisions
            'penerjemahan_pengetikan' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            // Beasiswa - No subdivisions
            'beasiswa' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            // Sewa Fotokopi - No subdivisions
            'sewa_fotokopi' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            // Honorarium Narasumber - No subdivisions
            'honorarium_narasumber' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            // Bahan Makanan (9)
            'bahan_makanan' => [
                'Pengadaan Bahan Makanan untuk Narapidana/Tahanan dan Anak di Lapas/Rutan Kementerian Hukum dan Hak Asasi Manusia' => [
                    'sub_category' => null,
                    'parent_section' => '9.1 Pengadaan Bahan Makanan untuk Narapidana/Tahanan dan Anak di Lapas/Rutan Kementerian Hukum dan Hak Asasi Manusia',
                ],
                'Pengadaan Bahan Makanan untuk Operasi Pasukan/Latihan Pratugas/Latihan Pasukan Lainnya Bagi Anggota Polri/TNI, Dikma/Taruna/Karbol/Kadet Bagi Anggota Polri/TNI, Diklat Lainnya Bagi Kementerian Pertahanan (Kemhan)/Anggota Polri/TNI, Anggota yang Sakit Bagi Kemhan/Anggota Polri/TNI, Tahanan Anggota Polri/TNI, dan Jaga Kawal Bagi Kemhan/Anggota Polri/TNI' => [
                    'sub_category' => null,
                    'parent_section' => '9.2 Pengadaan Bahan Makanan untuk Operasi Pasukan/Latihan Pratugas/Latihan Pasukan Lainnya Bagi Anggota Polri/TNI, Dikma/Taruna/Karbol/Kadet Bagi Anggota Polri/TNI, Diklat Lainnya Bagi Kementerian Pertahanan (Kemhan)/Anggota Polri/TNI, Anggota yang Sakit Bagi Kemhan/Anggota Polri/TNI, Tahanan Anggota Polri/TNI, dan Jaga Kawal Bagi Kemhan/Anggota Polri/TNI',
                ],
                'Pengadaan Bahan Makanan untuk Pasien Rumah Sakit dan Penyandang Masalah Kesejahteraan Sosial (PMKS)' => [
                    'sub_category' => null,
                    'parent_section' => '9.3 Pengadaan Bahan Makanan untuk Pasien Rumah Sakit dan Penyandang Masalah Kesejahteraan Sosial (PMKS)',
                ],
                'Pengadaan Bahan Makanan untuk Keluarga Penjaga Menara Suar (PMS), Petugas Pengamatan Laut, Anak Buah Kapal (ABK) Cadangan pada Kapal Negara, ABK Aktif pada Kapal Negara, dan Petugas Stasiun Radio Pantai (SROP) dan Vessel Traffic Information Service (VTIS)' => [
                    'sub_category' => null,
                    'parent_section' => '9.4 Pengadaan Bahan Makanan untuk Keluarga Penjaga Menara Suar (PMS), Petugas Pengamatan Laut, Anak Buah Kapal (ABK) Cadangan pada Kapal Negara, ABK Aktif pada Kapal Negara, dan Petugas Stasiun Radio Pantai (SROP) dan Vessel Traffic Information Service (VTIS)',
                ],
                'Pengadaan Bahan Makanan untuk Petugas Bengkel dan Galangan Kapal Kenavigasian, Petugas Pabrik Gas Aga untuk Lampu Suar, PMS, dan Kelompok Tenaga Kesehatan Kerja Pelayaran' => [
                    'sub_category' => null,
                    'parent_section' => '9.5 Pengadaan Bahan Makanan untuk Petugas Bengkel dan Galangan Kapal Kenavigasian, Petugas Pabrik Gas Aga untuk Lampu Suar, PMS, dan Kelompok Tenaga Kesehatan Kerja Pelayaran',
                ],
                'Pengadaan Bahan Makanan untuk Mahasiswa / Siswa Sipil dan Mahasiswa Militer / Semi Militer di Lingkup Sekolah Kedinasan' => [
                    'sub_category' => null,
                    'parent_section' => '9.6 Pengadaan Bahan Makanan untuk Mahasiswa/Siswa Sipil dan Mahasiswa Militer/Semi Militer di Lingkup Sekolah Kedinasan',
                ],
                'Pengadaan Bahan Makanan untuk Rescue Team' => [
                    'sub_category' => null,
                    'parent_section' => '9.7 Pengadaan Bahan Makanan untuk Rescue Team',
                ],
            ],
            // Konsumsi Tahanan - No subdivisions
            'konsumsi_tahanan' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            // Keperluan Perkantoran - No subdivisions
            'keperluan_perkantoran' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            // Penggantian Inventaris - No subdivisions
            'penggantian_inventaris' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            // Pemeliharaan Kendaraan (13)
            'pemeliharaan_kendaraan' => [
                'Kendaraan Dinas Pejabat' => [
                    'sub_category' => null,
                    'parent_section' => '13.1 Kendaraan Dinas Pejabat',
                ],
                'Kendaraan Dinas Operasional' => [
                    'sub_category' => null,
                    'parent_section' => '13.2 Kendaraan Dinas Operasional',
                ],
                'Operasional dalam Lingkungan Kantor, Roda 6, Roda 6 Khusus Tahanan Kejaksaan, dan Speed Boat' => [
                    'sub_category' => null,
                    'parent_section' => '13.3 Operasional dalam Lingkungan Kantor, Roda 6, Roda 6 Khusus Tahanan Kejaksaan, dan Speed Boat',
                ],
                'Kendaraan Dinas Operasional Patroli Jalan Raya (PJR)' => [
                    'sub_category' => null,
                    'parent_section' => '13.4 Kendaraan Dinas Operasional Patroli Jalan Raya (PJR)',
                ],
                'Operasional Kendaraan Dinas Untuk Pengadaan Dari Sewa' => [
                    'sub_category' => null,
                    'parent_section' => '13.5 Operasional Kendaraan Dinas Untuk Pengadaan Dari Sewa',
                ],
                'Kendaraan Bermotor Listrik Berbasis Baterai' => [
                    'sub_category' => null,
                    'parent_section' => '13.6 Kendaraan Bermotor Listrik Berbasis Baterai',
                ],
            ],
            // Pemeliharaan Gedung - No subdivisions
            'pemeliharaan_gedung' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            // Sewa Gedung - No subdivisions
            'sewa_gedung' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            // Tiket Pesawat Dalam Negeri - No subdivisions
            'tiket_pesawat_dalam_negeri' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            // Tiket Pesawat Luar Negeri - No subdivisions
            'tiket_pesawat_luar_negeri' => [
                'default' => ['sub_category' => null, 'parent_section' => null],
            ],
            // Perwakilan RI (19)
            'perwakilan_ri' => [
                'ATK, Langganan Koran / Majalah, Lampu, Pengamanan Sendiri, Kantong Diplomatik, dan Jamuan' => [
                    'sub_category' => null,
                    'parent_section' => '19.1 ATK, Langganan Koran/Majalah, Lampu, Pengamanan Sendiri, Kantong Diplomatik, dan Jamuan',
                ],
                'Pemeliharaan, Pengadaan Inventaris Kantor, Pakaian Sopir/Satpam, Sewa Kendaraan, dan Konsumsi Rapat' => [
                    'sub_category' => null,
                    'parent_section' => '19.2 Pemeliharaan, Pengadaan Inventaris Kantor, Pakaian Sopir/Satpam, Sewa Kendaraan, dan Konsumsi Rapat',
                ],
            ],
        ];

        // Check if category exists in mapping
        if (!isset($mapping[$category])) {
            return ['sub_category' => null, 'parent_section' => null];
        }

        // Exact match first
        if (isset($mapping[$category][$sectionLabel])) {
            return $mapping[$category][$sectionLabel];
        }

        // Partial match - search for pattern in section label
        foreach ($mapping[$category] as $pattern => $info) {
            if (stripos($sectionLabel, $pattern) !== false) {
                return $info;
            }
        }

        // Default untuk kategori tanpa subdivisi
        if (isset($mapping[$category]['default'])) {
            return $mapping[$category]['default'];
        }

        return ['sub_category' => null, 'parent_section' => null];
    }

    /**
     * Check if data row is valid (not empty, not just column numbers, not penomoran)
     */
    private function isValidDataRow(array $rowData): bool
    {
        // Skip penomoran rows like (1), (2), (3), [1], [2], etc.
        if ($this->isPenomoranRow($rowData)) {
            return false;
        }

        $nonEmptyCount = 0;

        foreach ($rowData as $value) {
            if (!empty($value) && $value !== '' && $value !== '-') {
                $nonEmptyCount++;
            }
        }

        // Must have at least 2 non-empty values
        return $nonEmptyCount >= 2;
    }

    /**
     * Check if row is a penomoran row (1), (2), (3), etc.
     */
    private function isPenomoranRow(array $rowData): bool
    {
        foreach ($rowData as $value) {
            $trimmed = trim($value);
            // Check for patterns like (1), (2), [1], [2], etc.
            if (preg_match('/^\(\d+\)$/', $trimmed) || preg_match('/^\[\d+\]$/', $trimmed)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get reason why a row was skipped
     */
    private function getSkipReason(array $rowData): string
    {
        $nonEmptyCount = 0;
        $filledFields = [];

        foreach ($rowData as $key => $value) {
            if (!empty($value) && $value !== '' && $value !== '-') {
                $nonEmptyCount++;
                $filledFields[] = $key;
            }
        }

        if ($nonEmptyCount === 0) {
            return "Empty row (all fields are empty or '-')";
        } elseif ($nonEmptyCount === 1) {
            return "Only 1 field filled: " . implode(', ', $filledFields);
        } else {
            return "Only {$nonEmptyCount} fields filled (need at least 2): " . implode(', ', $filledFields);
        }
    }

    /**
     * Get columns for a sub-section
     */
    private function getColumnsForSubSection(string $category, ?string $subCategory, array $subSectionInfo): array
    {
        $structure = $this->mapping->getStructure($category);

        if ($subCategory && isset($structure['sub_categories'][$subCategory]['columns'])) {
            return $structure['sub_categories'][$subCategory]['columns'];
        }

        if (isset($structure['columns'])) {
            return $structure['columns'];
        }

        // Fallback to scan report columns
        return $subSectionInfo['columns'] ?? [];
    }

    /**
     * Get statistics about parsed data
     */
    public function getStatistics(): array
    {
        $stats = [
            'total_files' => count($this->scanReport['files']),
            'successful_files' => 0,
            'failed_files' => 0,
            'total_rows' => 0,
            'rows_by_category' => [],
        ];

        foreach ($this->scanReport['files'] as $file) {
            if ($file['status'] === 'success') {
                $stats['successful_files']++;
                foreach ($file['sheets'] as $sheet) {
                    if (!empty($sheet['sub_sections'])) {
                        foreach ($sheet['sub_sections'] as $sub) {
                            $rowCount = $sub['data_end_row'] - $sub['data_start_row'] + 1;
                            $stats['total_rows'] += $rowCount;
                        }
                    } else {
                        $rowCount = $sheet['data_end_row'] - $sheet['data_start_row'] + 1;
                        $stats['total_rows'] += $rowCount;
                    }
                }
            } else {
                $stats['failed_files']++;
            }
        }

        return $stats;
    }
}
