<?php
require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

$scanReport = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);

// Files with sub_sections
$categoriesWithSubs = [
    'honorarium_28',
    'honorarium_31',
    'honorarium_35',
    'honorarium_36',
    'honorarium_38',
    'penerjemahan_pengetikan',
    'beasiswa',
    'honorarium_narasumber',
    'bahan_makanan',
    'pemeliharaan_kendaraan',
    'perwakilan_ri',
];

echo "=== CHECKING FOR FIRST ROW DATA PATTERN ===\n\n";
echo "Pattern: First row has besaran value (DATA), then grouping label row\n\n";

foreach ($scanReport['files'] as $file) {
    if (in_array($file['category'], $categoriesWithSubs)) {
        echo "=== " . $file['category'] . " ===\n";
        echo "Filename: " . $file['filename'] . "\n\n";

        $filepath = __DIR__ . '/storage/imports/Master_SBM/' . $file['filename'];

        if (!file_exists($filepath)) {
            echo "File not found\n\n---\n\n";
            continue;
        }

        try {
            $spreadsheet = IOFactory::load($filepath);
            $sheet = $spreadsheet->getSheet(0);

            foreach ($file['sheets'] as $sheetInfo) {
                if (!empty($sheetInfo['sub_sections'])) {
                    foreach ($sheetInfo['sub_sections'] as $idx => $sub) {
                        $startRow = $sub['data_start_row'];
                        $endRow = min($startRow + 5, $sub['data_end_row']);

                        echo "Sub-section " . ($idx+1) . ": " . $sub['label'] . "\n";
                        echo "Checking rows $startRow to $endRow:\n";

                        for ($row = $startRow; $row <= $endRow; $row++) {
                            // Get first 4 columns
                            $cols = [];
                            for ($col = 0; $col < 4; $col++) {
                                $cell = $sheet->getCell([$col + 1, $row]);
                                $val = trim($cell->getFormattedValue());
                                $cols[] = $val;
                            }

                            // Check pattern
                            $hasBesaran = false;
                            $hasEmptyBesaran = false;

                            // Check if any column has currency or large number
                            foreach ($cols as $col) {
                                if (stripos($col, 'Rp') !== false || strpos($col, '$') !== false) {
                                    $hasBesaran = true;
                                }
                                if (preg_match('/^\d{1,3}[.,]\d{3}/', $col)) {
                                    $hasBesaran = true;
                                }
                            }

                            // Check if this looks like grouping label (empty besaran)
                            $emptyCount = 0;
                            foreach ($cols as $col) {
                                if ($col === '' || $col === '-') {
                                    $emptyCount++;
                                }
                            }
                            if ($emptyCount >= 2) {
                                $hasEmptyBesaran = true;
                            }

                            $rowStr = "  Row $row: " . implode(' | ', array_slice($cols, 0, 2));
                            if ($hasBesaran) {
                                $rowStr .= " → DATA (has besaran)";
                            } elseif ($hasEmptyBesaran) {
                                $rowStr .= " → POSSIBLE GROUPING LABEL (empty values)";
                            }
                            echo $rowStr . "\n";
                        }
                        echo "\n";
                    }
                }
            }
        } catch (\Exception $e) {
            echo "Error: " . $e->getMessage() . "\n\n";
        }

        echo "---\n\n";
    }
}

echo "\n=== SUMMARY ===\n";
echo "Categories with DATA row before GROUPING LABEL pattern:\n";
echo "- honorarium_35 (Sub 2: PEJABAT ESELON I)\n";
echo "- honorarium_36 (Sub 1: PEJABAT ESELON I)\n";
