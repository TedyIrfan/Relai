<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use PhpOffice\PhpSpreadsheet\Reader\Xls;
use PhpOffice\PhpSpreadsheet\Reader\Csv;

class SbmScannerService
{
    private string $basePath;
    private array $fileMapping;
    private array $sbmNumberMap;
    private array $scanResult = [];
    private $mappingService;

    public function __construct()
    {
        $this->basePath = __DIR__ . '/../../storage/imports/Master_SBM/';
        $this->initFileMapping();
        $this->mappingService = new SbmMappingService();
    }

    /**
     * Initialize file mapping from MasterSBM.md
     */
    private function initFileMapping(): void
    {
        $this->fileMapping = [
            // Honorarium 28-39
            'honorarium_28' => 'Honorarium 28 SATUAN BIAYA UANG HARIAN DAN UANG REPRESENTASI PERJALANAN DINAS DALAM NEGERI.xlsx',
            'honorarium_29' => 'Honorarium 29 SATUAN BIAYA UANG HARIAN PERJALANAN DINAS LUAR NEGERI.xlsx',
            'honorarium_30' => 'Honorarium 30 PENGINAPAN DINAS DALAM NEGERI.xlsx',
            'honorarium_31' => 'Honorarium 31 SATUAN BIAYA RAPAT atau PERTEMUAN DI LUAR KANTOR.xlsx',
            'honorarium_32' => 'Honorarium 32 SATUAN BIAYA TIKET PERJALANAN DINAS PINDAH LUAR NEGERI (ONE  WAY ).xlsx',
            'honorarium_33' => 'Honorarium 33 SATUAN BIAYA OPERASIONAL KHUSUS KEPALA PERWAKILAN REPUBLIK INDONESIA DI LUAR NEGERI.xlsx',
            'honorarium_34' => 'Honorarium 34 SATUAN BIAYA MAKANAN PENAMBAH DAYA TAHAN TUBUH.xlsx',
            'honorarium_35' => 'Honorarium 35 SATUAN BIAYA SEWA KENDARAAN.xlsx',
            'honorarium_36' => 'Honorarium 36 SATUAN BIAYA PENGADAAN KENDARAAN DINAS.xlsx',
            'honorarium_37' => 'Honorarium 37 SATUAN BIAYA PENGADAAN PAKAIAN DINAS.xlsx',
            'honorarium_38' => 'Honorarium 38 SATUAN BIAYA KONSUMSI RAPAT atau PERTEMUAN.xlsx',
            'honorarium_39' => 'Honorarium 39 SATUAN BIAYA KONSUMSI KEGIATAN PENDIDIKAN DAN PELATIHAN (DIKLAT).xlsx',

            // Lainnya 1-19
            'transportasi_provinsi' => '1. SATUAN BIAYA TRANSPORTASI DARAT DARI IBUKOTA PROVINSI KE KABUPATEN atau KOTA DALAM PROVINSI YANG SAMA (ONE  WAY ).xlsx',
            'transportasi_dki' => '2. SATUAN BIAYA TRANSPORTASI DARI DKI JAKARTA KE KABUPATEN atau KOTA SEKITAR (ONE WAY  ).xlsx',
            'transportasi_kabupaten' => '3. SATUAN BIAYA TRANSPOR KEGIATAN DALAM KABUPATENKOTA PERGI PULANG (PP).xlsx',
            'pemeliharaan_sarana_kantor' => '4. SATUAN BIAYA PEMELIHARAAN SARANA KANTOR.xlsx',
            'penerjemahan_pengetikan' => '5. SATUAN BIAYA PENERJEMAHAN DAN PENGETIKAN.xlsx',
            'beasiswa' => '6. SATUAN BIAYA BANTUAN BEASISWA PROGRAM GELARNONGELAR DALAM NEGERI.xlsx',
            'sewa_fotokopi' => '7. SATUAN BIAYA SEWA MESIN FOTOKOPI.xlsx',
            'honorarium_narasumber' => '8. HONORARARIUM NARASUMBER PAKAR PRAKTISI PROFESIONAL.xlsx',
            'bahan_makanan' => '9. SATUAN BIAYA PENGADAAN BAHAN MAKANAN.xlsx',
            'konsumsi_tahanan' => '10. SATUAN BIAYA KONSUMSI TAHANAN DETENIABK NONJUSTISIA.xlsx',
            'keperluan_perkantoran' => '11. SATUAN BIAYA KEPERLUAN SEHARI-HARI PERKANTORAN DI DALAM NEGERI.xlsx',
            'penggantian_inventaris' => '12. SATUAN BIAYA PENGGANTIAN INVENTARIS LAMA DAN ATAU PEMBELIAN INVENTARIS UNTUK PEGAWAI BARU.xlsx',
            'pemeliharaan_kendaraan' => '13. SATUAN BIAYA PEMELIHARAAN DAN OPERASIONAL KENDARAAN DINAS.xlsx',
            'pemeliharaan_gedung' => '14. SATUAN BIAYA PEMELIHARAAN GEDUNG BANGUNAN DALAM NEGERI.xlsx',
            'sewa_gedung' => '15. SATUAN BIAYA SEWA GEDUNG PERTEMUAN.xlsx',
            'transportasi_terminal' => '16. SATUAN BIAYA TRANSPORTASI DARI DANATAU KE TERMINAL BUS STASIUN BANDARA PELABUHAN DALAM RANGKA PERJALANAN DINAS DALAM NEGERI.xlsx',
            'tiket_pesawat_dalam_negeri' => '17. SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS DALAM NEGERI PERGI PULANG  (PP).xlsx',
            'tiket_pesawat_luar_negeri' => '18. SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS LUAR NEGERI PERGI PULANG (PP).xlsx',
            'perwakilan_ri' => '19. SATUAN BIAYA PENYELENGGARAAN PERWAKILAN REPUBLIK INDONESIA DI LUAR NEGERI.xlsx',
        ];

        // Initialize SBM number mapping (1-31, 28-39)
        $this->sbmNumberMap = [
            'transportasi_provinsi' => 1,
            'transportasi_dki' => 2,
            'transportasi_kabupaten' => 3,
            'pemeliharaan_sarana_kantor' => 4,
            'penerjemahan_pengetikan' => 5,
            'beasiswa' => 6,
            'sewa_fotokopi' => 7,
            'honorarium_narasumber' => 8,
            'bahan_makanan' => 9,
            'konsumsi_tahanan' => 10,
            'keperluan_perkantoran' => 11,
            'penggantian_inventaris' => 12,
            'pemeliharaan_kendaraan' => 13,
            'pemeliharaan_gedung' => 14,
            'sewa_gedung' => 15,
            'transportasi_terminal' => 16,
            'tiket_pesawat_dalam_negeri' => 17,
            'tiket_pesawat_luar_negeri' => 18,
            'perwakilan_ri' => 19,
            'honorarium_28' => 28,
            'honorarium_29' => 29,
            'honorarium_30' => 30,
            'honorarium_31' => 31,
            'honorarium_32' => 32,
            'honorarium_33' => 33,
            'honorarium_34' => 34,
            'honorarium_35' => 35,
            'honorarium_36' => 36,
            'honorarium_37' => 37,
            'honorarium_38' => 38,
            'honorarium_39' => 39,
        ];
    }

    /**
     * Scan all files in Master_SBM folder
     */
    public function scanAll(): array
    {
        $this->scanResult = [
            'scan_date' => date('Y-m-d H:i:s'),
            'total_files' => count($this->fileMapping),
            'summary' => [
                'success' => 0,
                'error' => 0,
                'with_multiple_sheets' => 0,
                'with_sections' => 0,
            ],
            'files' => [],
        ];

        $processedFiles = [];

        foreach ($this->fileMapping as $category => $filename) {
            // Skip if already processed (same file for multiple categories)
            if (in_array($filename, $processedFiles)) {
                continue;
            }

            $processedFiles[] = $filename;
            $result = $this->scanFile($filename, $category);

            $this->scanResult['files'][] = $result;

            if ($result['status'] === 'success') {
                $this->scanResult['summary']['success']++;
            } else {
                $this->scanResult['summary']['error']++;
            }
        }

        return $this->scanResult;
    }

    /**
     * Scan a single file
     */
    public function scanFile(string $filename, string $category): array
    {
        $filepath = $this->basePath . $filename;

        $sbmNumber = $this->sbmNumberMap[$category] ?? null;

        $result = [
            'filename' => $filename,
            'category' => $category,
            'sbm_number' => $sbmNumber,
            'display_order' => $sbmNumber,
            'source_file' => $filename,
            'status' => 'not_found',
            'error' => null,
            'sheets' => [],
        ];

        if (!file_exists($filepath)) {
            $result['status'] = 'not_found';
            $result['error'] = 'File not found';
            return $result;
        }

        try {
            $spreadsheet = $this->readFile($filepath);

            if ($spreadsheet === null) {
                $result['status'] = 'error';
                $result['error'] = 'Unable to read file with any reader';
                return $result;
            }

            $result['status'] = 'success';
            $result['total_sheets'] = $spreadsheet->getSheetCount();

            // Scan each sheet
            foreach ($spreadsheet->getSheetNames() as $index => $sheetName) {
                $sheet = $spreadsheet->getSheet($index);
                $sheetData = $this->scanSheet($sheet, $sheetName, $category);
                $sheetData['name'] = $sheetName;
                $result['sheets'][] = $sheetData;

                if ($sheetData['has_sections']) {
                    $this->scanResult['summary']['with_sections']++;
                }
            }

            if ($spreadsheet->getSheetCount() > 1) {
                $this->scanResult['summary']['with_multiple_sheets']++;
            }

        } catch (\Exception $e) {
            $result['status'] = 'error';
            $result['error'] = $e->getMessage();
        }

        return $result;
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
                $spreadsheet = $reader->load($filepath);
                return $spreadsheet;
            } catch (\Exception $e) {
                // Try next reader
                continue;
            }
        }

        return null;
    }

    /**
     * Scan a sheet and detect structure (supports multiple sections/headers)
     */
    public function scanSheet($sheet, string $sheetName, ?string $category = null): array
    {
        $result = [
            'name' => $sheetName,
            'total_rows' => $sheet->getHighestRow(),
            'highest_column' => $sheet->getHighestColumn(),
            'header_row' => 0,
            'data_start_row' => 0,
            'data_end_row' => 0,
            'has_sections' => false,
            'sections' => [],
            'sub_sections' => [], // NEW: Multiple sections with different headers
            'columns' => [],
            'sample_data' => [],
        ];

        // Collect ALL rows (not just 200, to detect all sections)
        $rows = [];
        $totalRows = $sheet->getHighestRow();

        for ($row = 1; $row <= $totalRows; $row++) {
            $rowData = [];
            $cellIterator = $sheet->getRowIterator()->seek($row)->current()->getCellIterator();
            $cellIterator->setIterateOnlyExistingCells(false);

            foreach ($cellIterator as $cell) {
                $val = trim((string)$cell->getFormattedValue());
                if ($val !== '') {
                    $rowData[] = $val;
                }
            }

            if (!empty($rowData)) {
                $rows[$row] = $rowData;
            }
        }

        // Detect ALL header rows (multiple headers in one sheet)
        $headerRows = $this->detectAllHeaderRows($rows);

        // NEW: Also detect section label rows (like "6.2 | Uang Buku dan Referensi")
        // These rows have pattern: X.Y (section number) + section name
        $sectionLabelRows = $this->detectSectionLabelRows($rows);

        // Build a map: headerRow => sectionLabel (if section label exists immediately before header)
        $sectionLabelMap = [];
        foreach ($sectionLabelRows as $sectionRow) {
            // Check if next row is a header row
            if (in_array($sectionRow + 1, $headerRows)) {
                // Section label at row $sectionRow applies to header at row $sectionRow + 1
                $headerRow = $sectionRow + 1;
                // Get the label text (second column of the section label row)
                // IMPORTANT: Normalize spaces to match parser's mapping
                $label = trim((string)($rows[$sectionRow][1] ?? ''));
                $sectionLabelMap[$headerRow] = preg_replace('/\s+/', ' ', $label);
            }
        }

        if (empty($headerRows)) {
            return $result;
        }

        // First header (for backward compatibility)
        $firstHeaderRow = $headerRows[0];
        $result['header_row'] = $firstHeaderRow;
        $result['columns'] = $rows[$firstHeaderRow];

        // Check for multiple sections (multiple headers)
        if (count($headerRows) > 1) {
            $result['has_sections'] = true;

            // Create sub-sections for each header
            foreach ($headerRows as $index => $headerRow) {
                $nextHeaderRow = $headerRows[$index + 1] ?? ($totalRows + 1);

                // Check if there's a section label for this header
                $sectionLabel = $sectionLabelMap[$headerRow] ?? null;

                // If no section label, use the old method to detect section label
                if ($sectionLabel === null) {
                    $sectionLabel = $this->detectSectionLabelForHeader($rows, $headerRow);
                    if ($sectionLabel === null) {
                        $sectionLabel = "Section " . ($index + 1);
                    }
                }

                // IMPORTANT: Normalize section label to remove extra spaces
                // This ensures matching with parser's getSubCategoryFromSectionLabel mapping
                $sectionLabel = preg_replace('/\s+/', ' ', trim($sectionLabel));

                // Normalize column names
                $normalizedColumns = [];
                foreach ($rows[$headerRow] as $col) {
                    $normalizedColumns[] = $this->normalizeColumnName($col);
                }

                $subSection = [
                    'label' => $sectionLabel,
                    'header_row' => $headerRow,
                    'columns' => $normalizedColumns,
                    'data_start_row' => $headerRow + 1,  // Default: start from row after header
                    'data_end_row' => $nextHeaderRow - 1,
                    'column_count' => count($normalizedColumns),
                ];

                // Apply section configuration from mapping service (custom data_start_row, exclude, etc.)
                if ($category) {
                    $sectionMapping = $this->mappingService->getSectionMapping($category, $sectionLabel);
                    if ($sectionMapping) {
                        // Apply custom data_start_row if specified
                        if (isset($sectionMapping['data_start_row'])) {
                            $subSection['data_start_row'] = $sectionMapping['data_start_row'];
                        }
                        // Mark section for exclusion if needed
                        if (isset($sectionMapping['exclude']) && $sectionMapping['exclude']) {
                            $subSection['exclude'] = true;
                        }
                    }
                }

                // NOTE: Parser will skip non-data rows (penomoran, grouping labels, section labels)
                // So we don't need to find the "first actual data row" here - just start from headerRow + 1

                // Find actual data end (scan backwards from next header, stop before golongan labels)
                for ($r = $nextHeaderRow - 1; $r >= $subSection['data_start_row']; $r--) {
                    if (!isset($rows[$r])) {
                        continue;
                    }

                    // Check if this is a golongan label row (a., b., c., d.)
                    // BUT only treat it as a label if it has FEW columns (just the label, not full data)
                    $firstCol = trim((string)($rows[$r][0] ?? ''));
                    if (preg_match('/^[a-d]\.?\s*$/', $firstCol) && count($rows[$r]) < count($rows[$headerRow]) * 0.5) {
                        // This is a golongan label (has few columns), stop before it
                        $subSection['data_end_row'] = $r - 1;
                        break;
                    }

                    // If we find a valid data row, this is our end
                    if ($this->isDataRow($rows[$r], $rows[$headerRow], $category)) {
                        $subSection['data_end_row'] = $r;
                        break;
                    }
                }

                // Collect sample data for this section
                $sampleCount = 0;
                $subSection['sample_data'] = [];
                foreach ($rows as $rowNum => $rowData) {
                    if ($rowNum >= $subSection['data_start_row'] && $rowNum < $nextHeaderRow && $sampleCount < 3) {
                        if ($this->isDataRow($rowData, $rows[$headerRow], $category)) {
                            $sampleData = [];
                            foreach ($rows[$headerRow] as $colIndex => $colName) {
                                $sampleData[$colName] = $rowData[$colIndex] ?? '';
                            }
                            if (!empty(array_filter($sampleData))) {
                                $subSection['sample_data'][] = $sampleData;
                                $sampleCount++;
                            }
                        }
                    }
                }

                $result['sub_sections'][] = $subSection;
            }

            // Also populate sections array (just labels, for backward compatibility)
            $result['sections'] = array_map(fn($s) => $s['label'], $result['sub_sections']);
        } else {
            // Single section - use original logic for backward compatibility
            $sections = $this->detectSections($rows, $firstHeaderRow);
            $result['has_sections'] = !empty($sections);
            $result['sections'] = $sections;

            // Find data range
            $dataStartRow = $firstHeaderRow + 1;  // Start from row after header (includes grouping labels, penomoran, etc.)
            $dataEndRow = $totalRows;

            // NOTE: Parser will skip non-data rows (penomoran, grouping labels, section labels)
            // So we don't need to find the "first actual data row" here

            // Find actual data end (scan backwards from end, stop before golongan labels)
            for ($r = $totalRows; $r >= $dataStartRow; $r--) {
                if (!isset($rows[$r])) {
                    continue;
                }

                // Check if this is a golongan label row (a., b., c., d.)
                // BUT only treat it as a label if it has FEW columns (just the label, not full data)
                $firstCol = trim((string)($rows[$r][0] ?? ''));
                if (preg_match('/^[a-d]\.?\s*$/', $firstCol) && count($rows[$r]) < count($result['columns']) * 0.5) {
                    // This is a golongan label (has few columns), stop before it
                    $dataEndRow = $r - 1;
                    break;
                }

                // If we find a valid data row, this is our end
                if ($this->isDataRow($rows[$r], $result['columns'], $category)) {
                    $dataEndRow = $r;
                    break;
                }
            }

            $result['data_start_row'] = $dataStartRow;
            $result['data_end_row'] = $dataEndRow;

            // Collect sample data (first 3 data rows)
            $sampleCount = 0;
            foreach ($rows as $rowNum => $rowData) {
                if ($rowNum >= $dataStartRow && $sampleCount < 3) {
                    if ($this->isDataRow($rowData, $result['columns'], $category)) {
                        $sampleData = [];
                        foreach ($result['columns'] as $colIndex => $colName) {
                            $sampleData[$colName] = $rowData[$colIndex] ?? '';
                        }
                        $result['sample_data'][] = $sampleData;
                        $sampleCount++;
                    }
                }
            }
        }

        return $result;
    }

    /**
     * Detect ALL header rows (for multiple sections in one sheet)
     */
    public function detectAllHeaderRows(array $rows): array
    {
        $headerRows = [];

        foreach ($rows as $rowNum => $rowData) {
            $firstCell = strtoupper(trim((string)($rowData[0] ?? '')));

            // Check if first cell contains "NO", "No.", "NOMOR", or similar
            if (preg_match('/^(NO|NOMOR|NO\.)\s*/i', $firstCell)) {
                // Also check if row has multiple columns (not just a label)
                if (count($rowData) >= 3) {
                    $headerRows[] = $rowNum;
                }
            }
        }

        return $headerRows;
    }

    /**
     * Detect section label rows (like "6.2 | Uang Buku dan Referensi")
     * These rows have 2 columns: section number (X.Y) + section name
     */
    public function detectSectionLabelRows(array $rows): array
    {
        $sectionLabelRows = [];

        foreach ($rows as $rowNum => $rowData) {
            // Look for rows with exactly 2 non-empty columns
            $nonEmptyCount = 0;
            foreach ($rowData as $val) {
                $trimmed = trim((string)$val);
                if ($trimmed !== '' && $trimmed !== '-') {
                    $nonEmptyCount++;
                }
            }

            if ($nonEmptyCount === 2) {
                // Check pattern: first column is X.Y (section number), second is section name
                $firstCol = trim((string)($rowData[0] ?? ''));
                $secondCol = trim((string)($rowData[1] ?? ''));

                // First column should be like "6.1", "6.2", "8.1", "8.2"
                if (preg_match('/^\d+\.\d+$/', $firstCol)) {
                    // Second column should be text (section name)
                    if (preg_match('/[A-Za-z]/', $secondCol) &&
                        !preg_match('/^Rp/i', $secondCol) &&
                        !preg_match('/^\$/', $secondCol)) {
                        $sectionLabelRows[] = $rowNum;
                    }
                }
            }
        }

        return $sectionLabelRows;
    }

    /**
     * Detect section label for a single header row
     * Looks for section label BEFORE the header row (within 5 rows)
     */
    public function detectSectionLabelForHeader(array $rows, int $headerRow): ?string
    {
        // Look for section label BEFORE this header (within 5 rows)
        // Search from closest to header backwards
        $bestMatch = null;
        $bestScore = 0;

        for ($r = $headerRow - 1; $r >= max(1, $headerRow - 5); $r--) {
            if (!isset($rows[$r])) {
                continue;
            }

            $rowText = trim(implode(' ', $rows[$r]));
            $score = 0;
            $label = null;

            // Score each pattern (higher score = higher priority)
            // Pattern "a.", "b.", "c." - HIGHEST PRIORITY (golongan)
            if (preg_match('/^([a-c])\.\s+(.+)$/i', $rowText, $matches)) {
                $score = 100;
                $label = trim($matches[2]);
            }
            // Pattern "(A)", "(B)", "(C)" - golongan with parentheses
            elseif (preg_match('/^\(([A-Z])\)\s+(.+)$/i', $rowText, $matches)) {
                $score = 90;
                $label = trim($matches[2]);
            }
            // Pattern "31.1", "19.2" - numbered subsections
            elseif (preg_match('/^\d+\.\d+\s+(.+)$/', $rowText, $matches)) {
                $score = 70;
                $label = trim($matches[1]);
            }
            // Keywords
            elseif (preg_match('/(ATK|Pemeliharaan|Pengadaan|Sewa Kendaraan|Konsumsi)/i', $rowText)) {
                $score = 50;
                $label = $rowText;
            }

            // Clean up label
            if ($label !== null) {
                $label = preg_replace('/^\d+\.\d+\s*/', '', $label);
                $label = preg_replace('/^[a-c]\.\s*/i', '', $label);
                $label = preg_replace('/^\([A-Z]\)\s*/i', '', $label);
                $label = trim($label);
                $label = preg_replace('/\s+/', ' ', $label); // Remove extra spaces
            }

            if ($label !== null && !empty($label) && $score > $bestScore) {
                $bestMatch = $label;
                $bestScore = $score;

                // If we found the highest priority pattern, stop searching
                if ($score >= 90) {
                    break;
                }
            }
        }

        return $bestMatch;
    }

    /**
     * Detect section labels based on header row positions
     */
    public function detectSectionLabels(array $rows, array $headerRows): array
    {
        $sectionLabels = [];

        foreach ($headerRows as $index => $headerRow) {
            // NEW: First check if this header row itself is a section label (X.Y + section name pattern)
            if (isset($rows[$headerRow]) && count($rows[$headerRow]) >= 2) {
                $firstCol = trim((string)($rows[$headerRow][0] ?? ''));
                $secondCol = trim((string)($rows[$headerRow][1] ?? ''));

                // Check pattern: X.Y (section number) + section name
                if (preg_match('/^\d+\.\d+$/', $firstCol) &&
                    preg_match('/[A-Za-z]/', $secondCol) &&
                    !preg_match('/^Rp/i', $secondCol) &&
                    !preg_match('/^\$/', $secondCol)) {
                    // This row itself is a section label
                    // IMPORTANT: Normalize spaces to match parser's mapping
                    $sectionLabels[] = preg_replace('/\s+/', ' ', $secondCol);
                    continue;
                }
            }

            // Otherwise, look for section label BEFORE this header (within 5 rows)
            // Search from closest to header backwards
            $labelFound = false;
            $bestMatch = null;
            $bestScore = 0;

            for ($r = $headerRow - 1; $r >= max(1, $headerRow - 5); $r--) {
                if (isset($rows[$r])) {
                    $rowText = trim(implode(' ', $rows[$r]));
                    $score = 0;
                    $label = null;

                    // Score each pattern (higher score = higher priority)
                    // Pattern "a.", "b.", "c." - HIGHEST PRIORITY (golongan)
                    if (preg_match('/^([a-c])\.\s+(.+)$/i', $rowText, $matches)) {
                        $score = 100;
                        $label = trim($matches[2]);
                    }
                    // Pattern "(A)", "(B)", "(C)" - golongan with parentheses
                    elseif (preg_match('/^\(([A-Z])\)\s+(.+)$/i', $rowText, $matches)) {
                        $score = 90;
                        $label = trim($matches[2]);
                    }
                    // Pattern "31.1", "19.2" - numbered subsections
                    elseif (preg_match('/^\d+\.\d+\s+(.+)$/', $rowText, $matches)) {
                        $score = 70;
                        $label = trim($matches[1]);
                    }
                    // Keywords
                    elseif (preg_match('/(ATK|Pemeliharaan|Pengadaan|Sewa Kendaraan|Konsumsi)/i', $rowText)) {
                        $score = 50;
                        $label = $rowText;
                    }

                    // Clean up label
                    if ($label !== null) {
                        $label = preg_replace('/^\d+\.\d+\s*/', '', $label);
                        $label = preg_replace('/^[a-c]\.\s*/i', '', $label);
                        $label = preg_replace('/^\([A-Z]\)\s*/i', '', $label);
                        $label = trim($label);
                        $label = preg_replace('/\s+/', ' ', $label); // Remove extra spaces
                    }

                    if ($label !== null && !empty($label) && $score > $bestScore) {
                        $bestMatch = $label;
                        $bestScore = $score;

                        // If we found the highest priority pattern, stop searching
                        if ($score >= 90) {
                            break;
                        }
                    }
                }
            }

            if ($bestMatch !== null) {
                $sectionLabels[] = $bestMatch;
                $labelFound = true;
            }

            // If no label found, use default
            if (!$labelFound) {
                $sectionLabels[] = "Section " . ($index + 1);
            }
        }

        return $sectionLabels;
    }

    /**
     * Detect which row contains the header (backward compatibility)
     */
    public function detectHeaderRow(array $rows): int
    {
        foreach ($rows as $rowNum => $rowData) {
            $firstCell = strtoupper(trim((string)($rowData[0] ?? '')));

            // Check if first cell contains "NO", "No.", "NOMOR", or similar
            if (preg_match('/^(NO|NOMOR|NO\.)\s*/i', $firstCell)) {
                // Also check if row has multiple columns (not just a label)
                if (count($rowData) >= 3) {
                    return $rowNum;
                }
            }
        }

        return 0;
    }

    /**
     * Detect section labels in the data
     */
    public function detectSections(array $rows, int $headerRow): array
    {
        $sections = [];
        $currentSection = null;

        foreach ($rows as $rowNum => $rowData) {
            // Skip rows before and including header
            if ($rowNum <= $headerRow) {
                continue;
            }

            // Check if this row is a section label
            // Section labels usually:
            // - Have fewer columns than header
            // - Are all uppercase or title case
            // - Don't contain numbers/currency
            // Special case: Patterns like "8.1", "8.2", "19.1", "19.2" etc. are section labels
            $firstCol = trim((string)($rowData[0] ?? ''));
            $isNumberDotPattern = preg_match('/^\d+\.\d+$/', $firstCol);

            if ($isNumberDotPattern || (count($rowData) < 3 && $this->isSectionLabel($rowData))) {
                // For number-dot patterns (8.1, 8.2, etc.), extract only the label part (first 2 columns)
                // For regular section labels, use all columns
                if ($isNumberDotPattern && count($rowData) >= 2) {
                    $labelParts = array_slice($rowData, 0, 2); // Take only first 2 columns
                    $label = trim(implode(' ', $labelParts));
                } else {
                    $label = trim(implode(' ', $rowData));
                }
                // Remove common prefixes
                $label = preg_replace('/^\d+[\.\)]\s*/', '', $label);
                if (!empty($label) && !in_array($label, $sections)) {
                    $sections[] = $label;
                    $currentSection = $label;
                }
            }
        }

        return $sections;
    }

    /**
     * Check if a row is a section label
     */
    private function isSectionLabel(array $rowData): bool
    {
        // First, check if the first column is a number - if so, it's a data row, not a section label
        $firstCol = trim((string)($rowData[0] ?? ''));
        if (preg_match('/^\d+$/', $firstCol)) {
            return false; // Data rows start with numbers like 1, 2, 3, etc.
        }

        $text = trim(implode(' ', $rowData));

        // Section labels are usually:
        // - All uppercase or title case
        // - Don't contain numbers (except maybe region numbers)
        // - Don't contain currency symbols
        // - Reasonable length (3-50 chars)

        if (strlen($text) < 3 || strlen($text) > 50) {
            return false;
        }

        // Check for currency symbols (Rp must be checked separately)
        if (strpos($text, 'Rp') !== false || strpos($text, '$') !== false ||
            strpos($text, chr(128)) !== false || strpos($text, chr(163)) !== false ||
            strpos($text, chr(165)) !== false || strpos($text, chr(8364)) !== false) {
            return false;
        }

        // Check if mostly uppercase or title case
        $upperCount = preg_match_all('/[A-Z]/', $text);
        $lowerCount = preg_match_all('/[a-z]/', $text);

        // If mostly uppercase or title case pattern
        if ($upperCount > $lowerCount || preg_match('/\b[A-Z][a-z]+\b/', $text)) {
            return true;
        }

        return false;
    }

    /**
     * Check if a row is a data row
     */
    private function isDataRow(array $rowData, array $headerColumns, ?string $category = null): bool
    {
        // Data row should have similar number of columns as header
        if (count($rowData) < count($headerColumns) * 0.5) {
            return false;
        }

        // For categories with grouping, check if this is a grouping label row
        // Grouping label rows should NOT be filtered out - they'll be handled by the parser
        $hasGrouping = false;
        if ($category) {
            $structure = $this->mappingService->getStructure($category);
            $hasGrouping = isset($structure['has_grouping']) && $structure['has_grouping'];
        }

        // Check if this is a grouping label row (only 1-2 non-empty values, no amount data)
        if ($hasGrouping) {
            $nonEmptyCount = 0;
            $firstNonEmptyValue = '';
            foreach ($rowData as $value) {
                $trimmed = trim((string)$value);
                if ($trimmed !== '' && $trimmed !== '-') {
                    $nonEmptyCount++;
                    if ($firstNonEmptyValue === '') {
                        $firstNonEmptyValue = $trimmed;
                    }
                }
            }
            // Grouping label: 1-2 non-empty values, no amount/currency, text is uppercase
            if ($nonEmptyCount <= 2) {
                $hasCurrency = (stripos($firstNonEmptyValue, 'Rp') !== false ||
                               stripos($firstNonEmptyValue, '$') !== false ||
                               preg_match('/\d+[\.,]\d+/', $firstNonEmptyValue));
                $isText = preg_match('/[A-Za-z]/', $firstNonEmptyValue);
                $isUppercase = ($firstNonEmptyValue === strtoupper($firstNonEmptyValue));

                if (!$hasCurrency && $isText && $isUppercase && strlen($firstNonEmptyValue) >= 3) {
                    // This looks like a grouping label row - don't filter it out
                    return true;
                }
            }
        }

        // Check if not a section label
        if ($this->isSectionLabel($rowData)) {
            return false;
        }

        // Check if this is a column numbering row like (1) (2) (3) (4), [1] [2] [3] [4], or -1 -2 -3 -4
        // These typically appear right after the header row
        $rowText = implode(' ', $rowData);
        if (preg_match('/^[-\[\(\}]?\d+[\)\]]?\s*[-\[\(\}]?\d+[\)\]]?\s*[-\[\(\}]?\d+[\)\]]?/', $rowText)) {
            // Check if ALL values are just numbers (with optional minus, brackets, or parentheses)
            $allNumbering = true;
            foreach ($rowData as $value) {
                $trimmed = trim($value);
                // Match: 1, 2, 3 OR -1, -2, -3 OR (1), (2), (3) OR [1], [2], [3]
                if (!preg_match('/^[-\[\(\}]?\d+[\)\]]?$/', $trimmed)) {
                    $allNumbering = false;
                    break;
                }
            }
            if ($allNumbering) {
                return false; // This is a column numbering row, skip it
            }
        }

        // Check if this is a sub-header row
        // Sub-headers typically have empty first column but multiple non-empty columns
        $firstCol = trim((string)($rowData[0] ?? ''));
        $nonEmptyCount = count(array_filter($rowData, function($v) { return !empty(trim($v)) && trim($v) !== '-'; }));
        if (empty($firstCol) && $nonEmptyCount > 1) {
            return false; // Sub-header rows have empty first column
        }

        // Check if this is a sub-header row (explanatory text without numeric data)
        // Sub-headers typically don't contain numbers/currency values and are mostly text
        $hasNumericData = false;
        foreach ($rowData as $value) {
            $trimmed = trim($value);
            if (empty($trimmed) || $trimmed === '-') {
                continue;
            }
            // Check if value contains numeric data (currency, numbers with units, etc.)
            if (preg_match('/\d/', $trimmed) && !preg_match('/^[a-zA-Z\s\(\)\/]+$/', $trimmed)) {
                $hasNumericData = true;
                break;
            }
        }
        // If row has text but no numeric data, it might be a sub-header
        if (!$hasNumericData && $nonEmptyCount > 1) {
            return false; // Likely a sub-header row
        }

        return true;
    }

    /**
     * Generate JSON report
     */
    public function generateJsonReport(array $scanResult): string
    {
        return json_encode($scanResult, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Generate Markdown report
     */
    public function generateMdReport(array $scanResult): string
    {
        $md = "# SBM Files Scan Report\n\n";
        $md .= "**Generated:** {$scanResult['scan_date']}\n\n";

        $md .= "## Summary\n\n";
        $md .= "| Metric | Count |\n";
        $md .= "|--------|-------|\n";
        $md .= "| Total Files | {$scanResult['total_files']} |\n";
        $md .= "| Success | {$scanResult['summary']['success']} |\n";
        $md .= "| Error | {$scanResult['summary']['error']} |\n";
        $md .= "| Multiple Sheets | {$scanResult['summary']['with_multiple_sheets']} |\n";
        $md .= "| With Sections | {$scanResult['summary']['with_sections']} |\n\n";

        $md .= "---\n\n";

        foreach ($scanResult['files'] as $index => $file) {
            $num = $index + 1;
            $md .= "## {$num}. {$file['filename']}\n\n";
            $md .= "**Category:** `{$file['category']}`\n\n";
            $md .= "**Status:** ";
            $md .= $file['status'] === 'success' ? "✅ SUCCESS" : "❌ {$file['status']}";
            if ($file['error']) {
                $md .= " - `{$file['error']}`";
            }
            $md .= "\n\n";

            if ($file['status'] === 'success' && !empty($file['sheets'])) {
                foreach ($file['sheets'] as $sheet) {
                    $md .= "### Sheet: {$sheet['name']}\n\n";
                    $md .= "| Property | Value |\n";
                    $md .= "|----------|-------|\n";
                    $md .= "| Total Rows | {$sheet['total_rows']} |\n";
                    $md .= "| Header Row | {$sheet['header_row']} |\n";
                    $md .= "| Data Range | Row {$sheet['data_start_row']} - {$sheet['data_end_row']} |\n";
                    $md .= "| Has Sections | " . ($sheet['has_sections'] ? 'Yes' : 'No') . " |\n";

                    if (!empty($sheet['sections'])) {
                        $md .= "| Sections | " . implode(', ', $sheet['sections']) . " |\n";
                    }

                    $md .= "| Columns | " . count($sheet['columns']) . " |\n";
                    $md .= "\n";

                    // Columns
                    $md .= "**Columns (" . count($sheet['columns']) . "):**\n\n";
                    foreach ($sheet['columns'] as $i => $col) {
                        $md .= ($i + 1) . ". `{$col}`\n";
                    }
                    $md .= "\n";

                    // Sub-Sections (NEW: for multiple headers in one sheet)
                    if (!empty($sheet['sub_sections'])) {
                        $md .= "**Sub-Sections (" . count($sheet['sub_sections']) . "):**\n\n";
                        foreach ($sheet['sub_sections'] as $i => $sub) {
                            $md .= "##### " . ($i + 1) . ". {$sub['label']}\n\n";
                            $md .= "| Property | Value |\n";
                            $md .= "|----------|-------|\n";
                            $md .= "| Header Row | {$sub['header_row']} |\n";
                            $md .= "| Data Range | Row {$sub['data_start_row']} - {$sub['data_end_row']} |\n";
                            $md .= "| Columns | {$sub['column_count']} |\n";
                            $md .= "\n";

                            $md .= "**Columns:**\n";
                            foreach ($sub['columns'] as $col) {
                                $md .= "- `{$col}`\n";
                            }
                            $md .= "\n";

                            if (!empty($sub['sample_data'])) {
                                $md .= "**Sample Data:**\n";
                                $md .= "| " . implode(" | ", array_keys($sub['sample_data'][0])) . " |\n";
                                $md .= "|" . str_repeat("|---", count($sub['sample_data'][0])) . "|\n";
                                foreach ($sub['sample_data'] as $row) {
                                    $md .= "| " . implode(" | ", array_values($row)) . " |\n";
                                }
                                $md .= "\n";
                            }
                        }
                    }

                    // Sample Data (for single section files)
                    if (empty($sheet['sub_sections']) && !empty($sheet['sample_data'])) {
                        $md .= "**Sample Data:**\n\n";
                        $md .= "| " . implode(" | ", array_keys($sheet['sample_data'][0])) . " |\n";
                        $md .= "|" . str_repeat("|---", count($sheet['sample_data'][0])) . "|\n";

                        foreach ($sheet['sample_data'] as $row) {
                            $md .= "| " . implode(" | ", array_values($row)) . " |\n";
                        }
                        $md .= "\n";
                    }

                    $md .= "---\n\n";
                }
            }
        }

        return $md;
    }

    /**
     * Save reports to files
     */
    public function saveReports(array $scanResult): void
    {
        $jsonReport = $this->generateJsonReport($scanResult);
        $mdReport = $this->generateMdReport($scanResult);

        $storagePath = __DIR__ . '/../../storage/';

        file_put_contents($storagePath . 'sbm_scan_report.json', $jsonReport);
        file_put_contents($storagePath . 'sbm_scan_report.md', $mdReport);
    }

    /**
     * Normalize column name from Excel
     * - Remove trailing dots (NO. → NO)
     * - Trim and normalize spaces
     */
    private function normalizeColumnName(string $columnName): string
    {
        // Remove trailing dots
        $columnName = rtrim($columnName, '.');

        // Normalize spaces (remove extra spaces)
        $columnName = preg_replace('/\s+/', ' ', $columnName);
        $columnName = trim($columnName);

        return $columnName;
    }
}
