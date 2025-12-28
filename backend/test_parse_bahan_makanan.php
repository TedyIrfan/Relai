<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST PARSING BAHAN MAKANAN ===\n\n";

$parser = app(App\Services\SbmParserService::class);
$scanner = app(App\Services\SbmScannerService::class);

// Get scan report
$scanResult = $scanner->scanAll();

// Find bahan_makanan
$fileInfo = null;
foreach ($scanResult['files'] as $f) {
    if ($f['category'] === 'bahan_makanan') {
        $fileInfo = $f;
        break;
    }
}

if (!$fileInfo) {
    echo "ERROR: File not found\n";
    exit(1);
}

echo "File found: " . $fileInfo['filename'] . "\n";
echo "Has sections: " . ($fileInfo['sheets'][0]['has_sections'] ? 'Yes' : 'No') . "\n";
echo "Sub-sections: " . count($fileInfo['sheets'][0]['sub_sections']) . "\n\n";

// Parse the file
echo "Parsing...\n";
$result = $parser->parseFile($fileInfo, $scanResult);

echo "\n=== PARSE RESULT ===\n";
echo "Total data: " . count($result['data']) . "\n";
echo "Skipped: " . $result['skipped'] . "\n";
echo "Status: " . ($result['skipped'] ? 'FAILED' : 'SUCCESS') . "\n";

// Check data for section 9.2
echo "\n=== CHECKING SECTION 9.2 DATA ===\n";
$count92 = 0;
foreach ($result['data'] as $row) {
    if (strpos($row['parent_section'] ?? '', '9.2') !== false) {
        $count92++;
    }
}
echo "Rows with parent_section containing '9.2': $count92\n";

// Check skipped rows
echo "\n=== SKIPPED ROWS ===\n";
foreach ($result['skipped_rows'] as $skip) {
    if (isset($skip['data'])) {
        $data = $skip['data'];
        $prov = $data['provinsi'] ?? $data['uraian'] ?? 'N/A';
        echo "Row " . $skip['row_number'] . " ($skip[reason]): prov=$prov\n";
    }
}

// Count by parent_section
echo "\n=== COUNT BY PARENT SECTION ===\n";
$parentCounts = [];
foreach ($result['data'] as $row) {
    $parent = $row['parent_section'] ?? 'NULL';
    if (strpos($parent, '9.') !== false) {
        $sectionNo = substr($parent, 0, 3); // 9.1, 9.2, etc
        $parentCounts[$sectionNo] = ($parentCounts[$sectionNo] ?? 0) + 1;
    }
}
foreach ($parentCounts as $section => $count) {
    echo "$section: $count rows\n";
}
