<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECK PARSED DATA FIELDS ===\n\n";

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

    // Get all unique keys from parsed data
    $allKeys = [];
    foreach ($result['data'] as $row) {
        foreach (array_keys($row) as $key) {
            $allKeys[$key] = true;
        }
    }

    echo "Parsed data has these fields:\n";
    foreach (array_keys($allKeys) as $key) {
        echo "  - $key\n";
    }

    echo "\n=== TABLE COLUMNS ===\n";
    $columns = DB::select("SELECT column_name FROM information_schema.columns WHERE table_name = 'sbm_details' ORDER BY ordinal_position");
    foreach ($columns as $c) {
        echo "  - {$c->column_name}\n";
    }

    echo "\n=== EXTRA FIELDS IN PARSED DATA (NOT IN TABLE) ===\n";
    $tableColumns = array_map(fn($c) => $c->column_name, $columns);
    $extraFields = array_diff(array_keys($allKeys), $tableColumns);
    foreach ($extraFields as $field) {
        echo "  - $field\n";
    }

    echo "\n=== SECTION 9.2 FIRST ROW RAW VALUES ===\n";
    foreach ($result['data'] as $idx => $row) {
        if (isset($row['parent_section']) && strpos($row['parent_section'], '9.2') !== false) {
            echo "Row $idx:\n";
            foreach ($row as $key => $value) {
                $displayValue = is_null($value) ? 'NULL (null)' :
                               (is_string($value) ? "'$value'" : json_encode($value));
                echo "  [$key] => $displayValue (" . gettype($value) . ")\n";
            }
            break;
        }
    }
}
