<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== PARSING SECTION 13 MANUAL ===\n\n";

$scanReport = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);

// Find section 13 file
$fileInfo = null;
foreach ($scanReport['files'] as $f) {
    if ($f['category'] === 'pemeliharaan_kendaraan') {
        $fileInfo = $f;
        break;
    }
}

if (!$fileInfo) {
    echo "File not found!\n";
    exit(1);
}

echo "File: " . $fileInfo['filename'] . PHP_EOL;
echo "Category: " . $fileInfo['category'] . PHP_EOL . PHP_EOL;

// Parse using SbmParserService
$parser = app('App\Services\SbmParserService');

echo "Parsing...\n";
$result = $parser->parseFile($fileInfo);

echo "\n=== RESULTS ===\n";
echo "Imported: " . count($result['data']) . " rows\n";
echo "Skipped: " . $result['skipped'] . " rows\n";
echo "Skipped rows detail:\n";
foreach (array_slice($result['skipped_rows'], 0, 20) as $skip) {
    echo "  Row " . $skip['row_number'] . ": " . $skip['reason'] . PHP_EOL;
}

echo "\n=== DATA SAMPLE ===\n";
foreach (array_slice($result['data'], 0, 5) as $row) {
    $data = json_decode($row['data'], true);
    echo "parent: " . $row['parent_section'] . " | no: " . ($data['no'] ?? '?') . " | " . json_encode($data) . "\n\n";
}

// Count by parent_section
echo "\n=== BY PARENT SECTION ===\n";
$bySection = [];
foreach ($result['data'] as $row) {
    $ps = $row['parent_section'] ?? 'null';
    $bySection[$ps] = ($bySection[$ps] ?? 0) + 1;
}
foreach ($bySection as $section => $count) {
    echo "$section: $count rows\n";
}
