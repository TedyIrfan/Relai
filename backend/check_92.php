<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECK DATABASE FOR BAHAN MAKANAN ===\n\n";

// Cek semua data bahan_makanan
$data = DB::select("SELECT id, section_label, parent_section, SUBSTRING(data->>'uraian'::text, 1, 50) as uraian FROM sbm_details WHERE category = 'bahan_makanan' ORDER BY id");

echo "Total rows: " . count($data) . "\n\n";
$nullCount = 0;
foreach ($data as $row) {
    $parent = $row->parent_section ?? 'NULL';
    if ($parent === 'NULL') {
        $nullCount++;
    }
    echo "ID: " . $row->id . " | section: " . substr($row->section_label, 0, 40) . "... | parent: " . substr($parent, 0, 50) . "...\n";
}

echo "\nRows with NULL parent_section: $nullCount\n";

echo "\n=== SCAN REPORT SECTION LABELS ===\n";
$report = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);
foreach ($report['files'] as $f) {
    if ($f['category'] === 'bahan_makanan') {
        foreach ($f['sheets'][0]['sub_sections'] as $idx => $sub) {
            echo "[$idx] " . substr($sub['label'], 0, 50) . "...\n";
        }
        break;
    }
}
