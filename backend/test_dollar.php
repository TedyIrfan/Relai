<?php

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use PhpOffice\PhpSpreadsheet\IOFactory;

$filename = 'storage/imports/Master_SBM/8. HONORARARIUM NARASUMBER PAKAR PRAKTISI PROFESIONAL.xlsx';
$filepath = __DIR__ . '/' . $filename;

$spreadsheet = IOFactory::load($filepath);
$sheet = $spreadsheet->getActiveSheet();

// Test row 6 (a. Narasumber Kelas A)
$row = 6;
$cellD = $sheet->getCell('D' . $row);

echo "=== Cell D6 Analysis ===" . PHP_EOL;
echo "FormattedValue: [" . $cellD->getFormattedValue() . "]" . PHP_EOL;
echo "CalculatedValue: [" . ($cellD->getCalculatedValue() ?? 'N/A') . "]" . PHP_EOL;
echo "Value: [" . ($cellD->getValue() ?? 'N/A') . "]" . PHP_EOL;
echo "DataType: " . $cellD->getDataType() . PHP_EOL;

// Test raw data reading
echo PHP_EOL . "=== Parser Reading Test ===" . PHP_EOL;

// Simulate parser's cleanValue
$rawValue = $cellD->getFormattedValue();
echo "Raw formatted: [$rawValue]" . PHP_EOL;
echo "Contains \$: " . (strpos($rawValue, '$') !== false ? 'YES' : 'NO') . PHP_EOL;
echo "Contains R: " . (strpos($rawValue, 'R') !== false ? 'YES' : 'NO') . PHP_EOL;

// Check actual bytes
echo PHP_EOL . "=== Actual Bytes ===" . PHP_EOL;
echo "Bytes: " . bin2hex($rawValue) . PHP_EOL;
