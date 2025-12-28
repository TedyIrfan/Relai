<?php
require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

echo "=== DIAGNOSTIK: APA YANG TERBACA OLEH SCANNER vs PARSER ===\n\n";

// Check files
$files = [
    [
        'file' => 'Honorarium 35 SATUAN BIAYA SEWA KENDARAAN.xlsx',
        'sheet' => 'Honorarium35',
        'category' => 'honorarium_35',
        'target_label' => 'PEJABAT ESELON II',
        'target_section' => '35.2',
    ],
    [
        'file' => 'Honorarium 36 SATUAN BIAYA PENGADAAN KENDARAAN DINAS.xlsx',
        'sheet' => 'Sheet1',
        'category' => 'honorarium_36',
        'target_label' => 'PEJABAT ESELON II',
        'target_section' => '36.1',
    ],
    [
        'file' => '6. SATUAN BIAYA BANTUAN BEASISWA PROGRAM GELARNONGELAR DALAM NEGERI.xlsx',
        'sheet' => null,
        'category' => 'beasiswa',
        'target_label' => 'Uang Buku dan Referensi',
        'target_section' => '6.2',
    ],
    [
        'file' => '8. HONORARARIUM NARASUMBER PAKAR PRAKTISI PROFESIONAL.xlsx',
        'sheet' => null,
        'category' => 'honorarium_narasumber',
        'target_label' => 'Kegiatan Di Luar Negeri',
        'target_section' => '8.2',
    ],
];

foreach ($files as $fileInfo) {
    echo "\n" . str_repeat('=', 80) . "\n";
    echo "FILE: {$fileInfo['file']}\n";
    echo "Target: {$fileInfo['target_section']} - {$fileInfo['target_label']}\n";
    echo str_repeat('=', 80) . "\n\n";

    $filepath = __DIR__ . '/storage/imports/Master_SBM/' . $fileInfo['file'];
    if (!file_exists($filepath)) {
        echo "File not found!\n";
        continue;
    }

    try {
        $spreadsheet = IOFactory::load($filepath);
        $sheet = $fileInfo['sheet']
            ? $spreadsheet->getSheetByName($fileInfo['sheet'])
            : $spreadsheet->getSheet(0);

        // Check scan report first
        $scanReport = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);
        $scanData = null;
        foreach ($scanReport['files'] ?? [] as $f) {
            if ($f['category'] === $fileInfo['category']) {
                $scanData = $f;
                break;
            }
        }

        echo "1. SCANNER DETECTED:\n";
        if ($scanData && isset($scanData['sheets'][0]['sub_sections'])) {
            foreach ($scanData['sheets'][0]['sub_sections'] as $idx => $sub) {
                $label = $sub['label'] ?? '';
                $startRow = $sub['data_start_row'] ?? 'N/A';
                $endRow = $sub['data_end_row'] ?? 'N/A';
                echo "   Sub-section " . ($idx + 1) . ": \"$label\" (rows $startRow to $endRow)\n";

                // Cek if target label found
                if (stripos($label, $fileInfo['target_label']) !== false) {
                    echo "   ✅ TARGET LABEL FOUND IN SCAN!\n";
                }
            }
        } else {
            echo "   No sub_sections found in scan report\n";
        }

        // Check Excel directly
        echo "\n2. EXCEL STRUCTURE (looking for target):\n";
        $highestRow = $sheet->getHighestRow();
        echo "   Total rows in sheet: $highestRow\n";

        // Find target rows
        $targetFound = false;
        $targetRow = null;

        for ($row = 1; $row <= min($highestRow, 100); $row++) {
            // Get first 5 columns
            $rowData = [];
            for ($col = 1; $col <= 5; $col++) {
                $cell = $sheet->getCell([$col, $row]);
                $val = trim($cell->getFormattedValue());
                if ($val !== '') {
                    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                    $rowData[$colLetter] = $val;
                }
            }

            // Check if this row contains target label
            $rowText = implode(' | ', $rowData);
            if (stripos($rowText, $fileInfo['target_label']) !== false) {
                echo "   Row $row: $rowText\n";
                $targetFound = true;
                $targetRow = $row;

                // Show structure
                echo "   Structure: " . count($rowData) . " columns\n";

                // Check surrounding rows
                echo "\n   Surrounding rows ($row ± 3):\n";
                for ($r = max(1, $row - 3); $r <= min($highestRow, $row + 3); $r++) {
                    $surroundData = [];
                    for ($col = 1; $col <= 5; $col++) {
                        $cell = $sheet->getCell([$col, $r]);
                        $val = trim($cell->getFormattedValue());
                        if ($val !== '') {
                            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                            $surroundData[] = "$colLetter: '$val'";
                        }
                    }
                    if (!empty($surroundData)) {
                        $marker = ($r === $row) ? '← TARGET' : '';
                        echo "   Row $r: " . implode(' | ', $surroundData) . " $marker\n";
                    }
                }
                break;
            }
        }

        if (!$targetFound) {
            echo "   ❌ TARGET LABEL NOT FOUND IN EXCEL!\n";
        }

    } catch (\Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n";
    }
}

echo "\n" . str_repeat('=', 80) . "\n";
echo "DIAGNOSTIC COMPLETE\n";
echo str_repeat('=', 80) . "\n";
