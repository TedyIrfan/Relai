<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== SBM_DETAILS TABLE STRUCTURE ===\n\n";

$columns = DB::select("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'sbm_details' ORDER BY ordinal_position");

foreach ($columns as $c) {
    $nullable = $c->is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
    echo "{$c->column_name} - {$c->data_type} - $nullable\n";
}

echo "\n=== SECTION 9.2 PARSED DATA SAMPLE ===\n\n";

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
    foreach ($result['data'] as $row) {
        if (isset($row['parent_section']) && strpos($row['parent_section'], '9.2') !== false) {
            echo "Row data:\n";
            echo "  category: " . ($row['category'] ?? 'NULL') . "\n";
            echo "  sub_category: " . ($row['sub_category'] ?? 'NULL') . "\n";
            echo "  section_label: " . substr($row['section_label'] ?? 'NULL', 0, 50) . "\n";
            echo "  parent_section: " . ($row['parent_section'] ?? 'NULL') . "\n";
            echo "  grouping_label: " . ($row['grouping_label'] ?? 'NULL') . "\n";
            echo "  data: " . json_encode($row['data'], JSON_UNESCAPED_UNICODE) . "\n";
            echo "\n";
            break; // Just show first row
        }
    }

    // Count 9.2 rows
    $count92 = 0;
    foreach ($result['data'] as $row) {
        if (isset($row['parent_section']) && strpos($row['parent_section'], '9.2') !== false) {
            $count92++;
        }
    }
    echo "Total 9.2 rows: $count92\n";
}
