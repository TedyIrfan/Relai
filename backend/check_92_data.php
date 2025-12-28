<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECK SECTION 9.2 PARSED DATA ===\n\n";

$parser = app(App\Services\SbmParserService::class);
$scanner = app(App\Services\SbmScannerService::class);

$scanResult = $scanner->scanAll();

// Find bahan_makanan
$fileInfo = null;
foreach ($scanResult['files'] as $f) {
    if ($f['category'] === 'bahan_makanan') {
        $fileInfo = $f;
        break;
    }
}

if ($fileInfo) {
    $result = $parser->parseFile($fileInfo, $scanResult);

    // Find rows with parent_section 9.2
    $count92 = 0;
    foreach ($result['data'] as $idx => $row) {
        if (isset($row['parent_section']) && strpos($row['parent_section'], '9.2') !== false) {
            $count92++;
            if ($count92 <= 3) {  // Show first 3 rows
                echo "=== Row $idx (9.2) ===\n";
                echo "  category: " . var_export($row['category'] ?? 'NULL', true) . "\n";
                echo "  sub_category: " . var_export($row['sub_category'] ?? 'NULL', true) . "\n";
                echo "  section_label: " . substr(var_export($row['section_label'] ?? 'NULL', true), 0, 80) . "\n";
                echo "  parent_section: " . var_export($row['parent_section'] ?? 'NULL', true) . "\n";
                echo "  grouping_label: " . var_export($row['grouping_label'] ?? 'NULL', true) . "\n";
                echo "  currency: " . var_export($row['currency'] ?? 'NULL', true) . "\n";
                echo "  data: " . substr(json_encode($row['data'], JSON_UNESCAPED_UNICODE), 0, 200) . "\n";
                echo "\n";
            }
        }
    }
    echo "Total 9.2 rows: $count92\n";
}
