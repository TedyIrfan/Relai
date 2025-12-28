<?php
require __DIR__ . '/vendor/autoload.php';

use App\Services\SbmParserService;
use App\Services\SbmMappingService;

echo "=== TEST: GROUPING LABEL DETECTION ===\n\n";

$mapping = new SbmMappingService();
$parser = new SbmParserService($mapping);

// Test the isGroupingLabelRow method directly
// Simulate the row data structure that the parser creates

echo "Test 1: H35 - PEJABAT ESELON II row\n";
echo "Expected: Should be detected as grouping label\n";

// Row 47 from H35: Z=[EMPTY], A='PEJABAT ESELON II', B-E=[EMPTY]
// After mapping to columns: NO='', PROVINSI='PEJABAT ESELON II', SATUAN='', BESARAN=''
$testRow1 = [
    'NO' => '',
    'PROVINSI' => 'PEJABAT ESELON II',
    'SATUAN' => '',
    'BESARAN' => '',
];

// Use reflection to access private method
$reflection = new \ReflectionClass($parser);
$method = $reflection->getMethod('isGroupingLabelRow');
$method->setAccessible(true);

$result1 = $method->invoke($parser, $testRow1, 'honorarium_35');
echo "Result: " . ($result1 ? "✅ DETECTED as grouping label" : "❌ NOT detected") . "\n";
echo "  Row data: " . json_encode($testRow1, JSON_UNESCAPED_UNICODE) . "\n\n";

echo "Test 2: H36 - PEJABAT ESELON II row\n";
echo "Expected: Should be detected as grouping label\n";

// Row 6 from H36: Z=[EMPTY], A='PEJABAT ESELON II', B-E=[EMPTY]
$testRow2 = [
    'NO' => '',
    'PROVINSI' => 'PEJABAT ESELON II',
    'SATUAN' => '',
    'BESARAN' => '',
];

$result2 = $method->invoke($parser, $testRow2, 'honorarium_36');
echo "Result: " . ($result2 ? "✅ DETECTED as grouping label" : "❌ NOT detected") . "\n";
echo "  Row data: " . json_encode($testRow2, JSON_UNESCAPED_UNICODE) . "\n\n";

echo "Test 3: H35 - Actual data row (should NOT be grouping label)\n";
echo "Expected: Should NOT be detected as grouping label (has besaran)\n";

// Row 48 from H35: Z='35.2.2.1', A='ACEH', B='Per bulan', C='Rp14,180,000'
$testRow3 = [
    'NO' => '35.2.2.1',
    'PROVINSI' => 'ACEH',
    'SATUAN' => 'Per bulan',
    'BESARAN' => 'Rp14,180,000',
];

$result3 = $method->invoke($parser, $testRow3, 'honorarium_35');
echo "Result: " . (!$result3 ? "✅ NOT detected as grouping label" : "❌ INCORRECTLY detected") . "\n";
echo "  Row data: " . json_encode($testRow3, JSON_UNESCAPED_UNICODE) . "\n\n";

echo "Test 4: H35 - PEJABAT ESELON I row (has besaran, should NOT be grouping label)\n";
echo "Expected: Should NOT be detected as grouping label (has besaran)\n";

// Row 46 from H35: Z='35.02.01', A='PEJABAT ESELON I', B='Per bulan', C='Rp17,660,000'
$testRow4 = [
    'NO' => '35.02.01',
    'PROVINSI' => 'PEJABAT ESELON I',
    'SATUAN' => 'Per bulan',
    'BESARAN' => 'Rp17,660,000',
];

$result4 = $method->invoke($parser, $testRow4, 'honorarium_35');
echo "Result: " . (!$result4 ? "✅ NOT detected as grouping label" : "❌ INCORRECTLY detected") . "\n";
echo "  Row data: " . json_encode($testRow4, JSON_UNESCAPED_UNICODE) . "\n\n";

echo "==========================================\n";
echo "SUMMARY:\n";
$pass = 0;
$fail = 0;
if ($result1) $pass++; else $fail++;
if ($result2) $pass++; else $fail++;
if (!$result3) $pass++; else $fail++;
if (!$result4) $pass++; else $fail++;

echo "  Pass: $pass/4\n";
echo "  Fail: $fail/4\n";

if ($fail === 0) {
    echo "\n✅ All tests passed! Grouping label detection is working correctly.\n";
    echo "   The issue must be elsewhere in the parsing process.\n";
} else {
    echo "\n❌ Some tests failed! The isGroupingLabelRow() method needs fixing.\n";
}
echo "==========================================\n";
