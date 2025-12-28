<?php
require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

$file = __DIR__ . '/storage/imports/Master_SBM/Honorarium 35 SATUAN BIAYA SEWA KENDARAAN.xlsx';

$spreadsheet = IOFactory::load($file);
$sheet = $spreadsheet->getSheetByName('Honorarium35');

echo "=== Honorarium 35 - Sewa Kendaraan Operasional Pejabat (H35.2) ===\n";
echo "\nRows 44-90 (Full section):\n\n";

for ($row = 44; $row <= 90; $row++) {
    $col1 = trim($sheet->getCell('A' . $row)->getFormattedValue());
    $col2 = trim($sheet->getCell('B' . $row)->getFormattedValue());
    $col3 = trim($sheet->getCell('C' . $row)->getFormattedValue());
    $col4 = trim($sheet->getCell('D' . $row)->getFormattedValue());

    // Skip empty rows
    if ($col1 === '' && $col2 === '' && $col3 === '' && $col4 === '') {
        continue;
    }

    echo "Row $row:\n";
    echo "  A: '$col1'\n";
    echo "  B: '$col2'\n";
    echo "  C: '$col3'\n";
    echo "  D: '$col4'\n";
    echo "\n";
}
