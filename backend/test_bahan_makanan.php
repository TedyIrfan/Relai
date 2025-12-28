<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST BAHAN MAKANAN PARSING ===\n\n";

$mapping = app(App\Services\SbmMappingService::class);
$parser = app(App\Services\SbmParserService::class);
$scanner = app(App\Services\SbmScannerService::class);

// Get scan report
$scanResult = $scanner->scanAll();

// Find bahan_makanan scan data
$scanData = null;
foreach ($scanResult['files'] as $f) {
    if ($f['category'] === 'bahan_makanan') {
        $scanData = $f;
        break;
    }
}

if (!$scanData) {
    echo "ERROR: bahan_makanan not found in scan result!\n";
    exit(1);
}

echo "Scan data found for bahan_makanan\n";
echo "Sub-sections: " . count($scanData['sheets'][0]['sub_sections']) . "\n\n";

// Test parsing sub-section 1 (9.2)
$subSection = $scanData['sheets'][0]['sub_sections'][1];
echo "Testing sub-section 1 (9.2):\n";
echo "  Label: " . substr($subSection['label'], 0, 50) . "...\n";
echo "  Data range: " . $subSection['data_start_row'] . " to " . $subSection['data_end_row'] . "\n\n";

// Check if excluded
$sectionMapping = $mapping->getSectionMapping('bahan_makanan', $subSection['label']);
echo "Section mapping result:\n";
print_r($sectionMapping);

if ($sectionMapping && isset($sectionMapping['exclude']) && $sectionMapping['exclude']) {
    echo "\n❌ SECTION EXCLUDED! Ini kenapa data tidak masuk!\n";
} else {
    echo "\n✓ Section tidak di-exclude\n";
}

// Check parent_section mapping
$reflection = new ReflectionClass($parser);
$method = $reflection->getMethod('getSubCategoryFromSectionLabel');
$method->setAccessible(true);

$categoryInfo = $method->invoke($parser, $subSection['label'], 'bahan_makanan');
echo "\nParent section mapping:\n";
print_r($categoryInfo);
