<?php

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use PhpOffice\PhpSpreadsheet\IOFactory;

$filename = 'storage/imports/Master_SBM/8. HONORARARIUM NARASUMBER PAKAR PRAKTISI PROFESIONAL.xlsx';
$filepath = __DIR__ . '/' . $filename;

$spreadsheet = IOFactory::load($filepath);
$sheet = $spreadsheet->getActiveSheet();

echo "=== Raw cell values for rows 4-8 ===" . PHP_EOL;
for ($row = 4; $row <= 8; $row++) {
    echo PHP_EOL . "Row $row:" . PHP_EOL;
    $columns = ['A', 'B', 'C', 'D'];
    foreach ($columns as $col) {
        $cell = $sheet->getCell($col . $row);
        $value = $cell->getFormattedValue();
        $calculated = $cell->getCalculatedValue();
        $raw = $cell->getValue();

        echo sprintf("  %s: formatted=[%s] calculated=[%s] raw=[%s]",
            $col,
            $value,
            is_string($calculated) ? $calculated : 'N/A',
            is_string($raw) ? $raw : 'N/A'
        ) . PHP_EOL;
    }
}
