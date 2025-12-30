<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$scanReport = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);

// Find section 13 file
$fileInfo = null;
foreach ($scanReport['files'] as $f) {
    if ($f['category'] === 'pemeliharaan_kendaraan') {
        $fileInfo = $f;
        break;
    }
}

echo "=== CHECK SECTION 13.1 WITH NEW MAPPING ===\n\n";

// Check mapping
$mapping = app('App\Services\SbmMappingService');
$structure = $mapping->getStructure('pemeliharaan_kendaraan');

echo "13.1 has_grouping: " . ($structure['sub_categories']['13.1']['has_grouping'] ?? 'NOT SET') . PHP_EOL;
echo "13.1 grouping_field: " . ($structure['sub_categories']['13.1']['grouping_field'] ?? 'NOT SET') . PHP_EOL . PHP_EOL;

// Get first sub-section (13.1)
$sub13_1 = $fileInfo['sheets'][0]['sub_sections'][0];
echo "Scanner info:\n";
echo "  Label: " . $sub13_1['label'] . PHP_EOL;
echo "  Rows: " . $sub13_1['data_start_row'] . " to " . $sub13_1['data_end_row'] . PHP_EOL . PHP_EOL;

// Parse manual untuk 13.1
$parser = app('App\Services\SbmParserService');

// Mock fileInfo cuma untuk 13.1
$mockFileInfo = $fileInfo;
$mockFileInfo['sheets'][0]['sub_sections'] = [$sub13_1];

echo "Parsing section 13.1...\n";
$result = $parser->parseFile($mockFileInfo);

echo "\n=== RESULTS ===\n";
echo "Imported: " . count($result['data']) . " rows\n";
echo "Skipped: " . $result['skipped'] . " rows\n\n";

if ($result['skipped'] > 0 && $result['skipped'] < 50) {
    echo "Skipped rows:\n";
    foreach ($result['skipped_rows'] as $skip) {
        echo "  Row " . $skip['row_number'] . ": " . $skip['reason'] . PHP_EOL;
    }
}

if (count($result['data']) > 0) {
    echo "\n=== IMPORTED DATA ===\n";
    foreach ($result['data'] as $row) {
        $data = json_decode($row['data'], true);
        echo "no: " . ($data['no'] ?? '?') . " | grouping: " . $row['grouping_label'] . " | prov: " . ($data['provinsi'] ?? '?') . " | satuan: " . ($data['satuan'] ?? '?') . " | besaran: " . ($data['besaran'] ?? '?') . PHP_EOL;
    }
}
