<?php
require __DIR__ . '/vendor/autoload.php';

$filePath = __DIR__ . '/storage/imports/Master_SBM/13. SATUAN BIAYA PEMELIHARAAN DAN OPERASIONAL KENDARAAN DINAS.xlsx';

$spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filePath);
$sheet = $spreadsheet->getActiveSheet();

echo "=== EXCEL 13 - SECTION 13.1 (First 20 rows) ===\n\n";

for ($row = 1; $row <= 50; $row++) {
    $rowData = [];
    for ($col = 1; $col <= 10; $col++) {
        $cell = $sheet->getCell([$col, $row]);
        $value = trim($cell->getFormattedValue());
        if ($value !== '') {
            $rowData[$col] = $value;
        }
    }
    
    if (count($rowData) > 0) {
        echo "Row $row: ";
        foreach ($rowData as $col => $val) {
            echo "[Col$col: " . substr($val, 0, 50) . "] ";
        }
        echo PHP_EOL;
    }
    
    if ($row == 41) {
        echo "\n--- END OF SECTION 13.1 ---\n\n";
    }
}
