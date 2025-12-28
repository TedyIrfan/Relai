<?php
require __DIR__ . '/vendor/autoload.php';

use App\Services\SbmParserService;
use App\Services\SbmMappingService;

echo "=== DEBUG: GROUPING LABEL DETECTION ===\n\n";

$mapping = new SbmMappingService();
$parser = new SbmParserService($mapping);

// Test row: PEJABAT ESELON II
$testRow = [
    'NO' => '',
    'PROVINSI' => 'PEJABAT ESELON II',
    'SATUAN' => '',
    'BESARAN' => '',
];

echo "Test Row:\n";
print_r($testRow);

echo "\n--- Debug Analysis ---\n";

// Check structure
$structure = $mapping->getStructure('honorarium_35');
echo "1. has_grouping: " . ($structure['has_grouping'] ?? 'NOT SET') . "\n";

// Check isPenomoranRow
$reflection = new \ReflectionClass($parser);
$method = $reflection->getMethod('isPenomoranRow');
$method->setAccessible(true);
$isPenomoran = $method->invoke($parser, $testRow);
echo "2. isPenomoranRow: " . ($isPenomoran ? 'YES' : 'NO') . "\n";

// Count non-empty values
$nonEmptyValues = [];
foreach ($testRow as $value) {
    $trimmed = trim($value ?? '');
    if ($trimmed !== '' && $trimmed !== '-' && $trimmed !== null) {
        $nonEmptyValues[] = $trimmed;
    }
}
echo "3. Non-empty values: " . count($nonEmptyValues) . "\n";
echo "   Values: " . json_encode($nonEmptyValues, JSON_UNESCAPED_UNICODE) . "\n";

// Check isAmountValue
$method = $reflection->getMethod('isAmountValue');
$method->setAccessible(true);
$hasAmount = false;
foreach ($testRow as $key => $value) {
    $result = $method->invoke($parser, $value, $key);
    if ($result) {
        echo "4. isAmountValue found at key '$key': '$value'\n";
        $hasAmount = true;
    }
}
if (!$hasAmount) {
    echo "4. isAmountValue: NO amount found\n";
}

// Final check
$method = $reflection->getMethod('isGroupingLabelRow');
$method->setAccessible(true);
$finalResult = $method->invoke($parser, $testRow, 'honorarium_35');
echo "\n--- FINAL RESULT ---\n";
echo "isGroupingLabelRow: " . ($finalResult ? "YES ✅" : "NO ❌") . "\n";

if (!$finalResult) {
    echo "\n⚠️  The row SHOULD be detected as a grouping label but isn't!\n";
    echo "Possible causes:\n";
    echo "  1. isPenomoranRow() returning true when it shouldn't\n";
    echo "  2. isAmountValue() detecting amount when it shouldn't\n";
    echo "  3. Non-empty count not equal to 1\n";
}

echo "\n==========================================\n";
