<?php
require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

echo "=== DIAGNOSTIK STRUKTUR EXCEL SBM ===\n\n";

// Files to check
$checks = [
    [
        'file' => 'Honorarium 35 SATUAN BIAYA SEWA KENDARAAN.xlsx',
        'sheet' => 'Honorarium35',
        'section' => 'H35.2 - Sewa Kendaraan Operasional Pejabat',
        'start_row' => 40,
        'end_row' => 55,
    ],
    [
        'file' => 'Honorarium 36 SATUAN BIAYA PENGADAAN KENDARAAN DINAS.xlsx',
        'sheet' => 'Sheet1',
        'section' => 'H36.1 - Kendaraan Dinas Pejabat',
        'start_row' => 1,
        'end_row' => 20,
    ],
    [
        'file' => '6. SATUAN BIAYA BANTUAN BEASISWA PROGRAM GELARNONGELAR DALAM NEGERI.xlsx',
        'sheet' => null, // use first sheet
        'section' => 'No 6 - Beasiswa',
        'start_row' => 1,
        'end_row' => 50,
    ],
    [
        'file' => '8. HONORARARIUM NARASUMBER PAKAR PRAKTISI PROFESIONAL.xlsx',
        'sheet' => null,
        'section' => 'No 8 - Honorarium Narasumber',
        'start_row' => 1,
        'end_row' => 60,
    ],
];

foreach ($checks as $check) {
    $filepath = __DIR__ . '/storage/imports/Master_SBM/' . $check['file'];

    echo "\n" . str_repeat('=', 80) . "\n";
    echo "FILE: {$check['file']}\n";
    echo "SECTION: {$check['section']}\n";
    echo str_repeat('=', 80) . "\n\n";

    if (!file_exists($filepath)) {
        echo "ERROR: File not found!\n\n";
        continue;
    }

    try {
        $spreadsheet = IOFactory::load($filepath);

        if ($check['sheet']) {
            $sheet = $spreadsheet->getSheetByName($check['sheet']);
            if (!$sheet) {
                echo "ERROR: Sheet '{$check['sheet']}' not found!\n";
                $sheet = $spreadsheet->getSheet(0);
                echo "Using first sheet instead: {$sheet->getTitle()}\n\n";
            }
        } else {
            $sheet = $spreadsheet->getSheet(0);
        }

        for ($row = $check['start_row']; $row <= $check['end_row']; $row++) {
            // Get first 6 columns
            $rowData = [];
            $highestColumn = $sheet->getHighestColumn();
            $colCount = min(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn), 6);

            for ($col = 0; $col < $colCount; $col++) {
                $cell = $sheet->getCell([$col + 1, $row]); // Use array notation [col, row] - 1-indexed
                $formatted = trim($cell->getFormattedValue());
                $calculated = trim($cell->getCalculatedValue());
                $rowData[] = [
                    'formatted' => $formatted,
                    'calculated' => $calculated,
                ];
            }

            // Skip completely empty rows
            $allEmpty = true;
            foreach ($rowData as $cellData) {
                if ($cellData['formatted'] !== '' && $cellData['formatted'] !== '-') {
                    $allEmpty = false;
                    break;
                }
            }
            if ($allEmpty) {
                continue;
            }

            echo "Row $row:\n";
            foreach ($rowData as $idx => $cellData) {
                $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($idx);
                $formatted = $cellData['formatted'];
                $calculated = $cellData['calculated'];

                if ($formatted === '' || $formatted === '-') {
                    $display = "[EMPTY]";
                } else {
                    $display = "'$formatted'";
                    if ($formatted !== $calculated && $calculated !== '' && $calculated !== '-') {
                        $display .= " (calc: '$calculated')";
                    }
                }

                echo "  $colLetter: $display\n";

                // Highlight if looks like PEJABAT ESELON
                if (stripos($formatted, 'PEJABAT') !== false || stripos($formatted, 'ESELON') !== false) {
                    echo "    ^^^ PEJABAT/ESELON DETECTED!\n";
                }
            }
            echo "\n";
        }

    } catch (\Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n\n";
    }
}

echo "\n" . str_repeat('=', 80) . "\n";
echo "SCAN COMPLETE\n";
echo str_repeat('=', 80) . "\n";
