<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== H35 DATA (around PEJABAT ESELON) ===\n";
$data = DB::table('sbm_details')
    ->where('category', 'honorarium_35')
    ->whereRaw("(data->>'no' LIKE '35.02%' OR data->>'no' LIKE '35.2.2.%')")
    ->orderBy('id')
    ->get();

foreach ($data as $row) {
    $jsonData = json_decode($row->data, true);
    echo "ID: " . $row->id . " | NO: " . ($jsonData['no'] ?? 'N/A') . " | PROV: " . ($jsonData['provinsi'] ?? 'N/A') . " | grouping: " . ($row->grouping_label ?? 'NULL') . "\n";
}

echo "\n=== H36 DATA (around PEJABAT ESELON) ===\n";
$data = DB::table('sbm_details')
    ->where('category', 'honorarium_36')
    ->whereRaw("(data->>'no' LIKE '36.01%' OR data->>'no' LIKE '36.1.2.%')")
    ->orderBy('id')
    ->limit(10)
    ->get();

foreach ($data as $row) {
    $jsonData = json_decode($row->data, true);
    echo "ID: " . $row->id . " | NO: " . ($jsonData['no'] ?? 'N/A') . " | PROV: " . ($jsonData['provinsi'] ?? 'N/A') . " | grouping: " . ($row->grouping_label ?? 'NULL') . "\n";
}

echo "\n=== NO 6 DATA (check parent_section) ===\n";
$data = DB::table('sbm_details')
    ->where('category', 'beasiswa')
    ->orderBy('id')
    ->get();

foreach ($data as $row) {
    $jsonData = json_decode($row->data, true);
    echo "ID: " . $row->id . " | section: " . $row->section_label . " | parent: " . ($row->parent_section ?? 'NULL') . " | NO: " . ($jsonData['no'] ?? 'N/A') . " | URAIAN: " . ($jsonData['uraian'] ?? 'N/A') . "\n";
}

echo "\n=== NO 8 DATA (check parent_section) ===\n";
$data = DB::table('sbm_details')
    ->where('category', 'honorarium_narasumber')
    ->orderBy('id')
    ->get();

foreach ($data as $row) {
    $jsonData = json_decode($row->data, true);
    echo "ID: " . $row->id . " | section: " . $row->section_label . " | parent: " . ($row->parent_section ?? 'NULL') . " | NO: " . ($jsonData['no'] ?? 'N/A') . " | URAIAN: " . ($jsonData['uraian'] ?? 'N/A') . "\n";
}
