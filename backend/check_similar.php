<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Cek Honorarium 35 yang punya grouping per provinsi
echo "=== HONORARIUM 35 - DENGAN GROUPING ===\n\n";

$data = DB::table('sbm_details')
    ->where('category', 'honorarium_35')
    ->where('parent_section', 'Sewa Kendaraan Operasional Pejabat')
    ->select('id', 'grouping_label', 'data')
    ->limit(10)
    ->get();

foreach ($data as $d) {
    $json = json_decode($d->data, true);
    echo "ID: " . $d->id . " | Grouping: " . $d->grouping_label . " | Besaran: " . ($json['besaran'] ?? '?') . PHP_EOL;
}

echo "\n=== SECTION 13.1 YANG SUDAH MASUK (HONORARIUM 36) ===\n\n";

// Cek apakah Honorarium 36.1 (Kendaraan Dinas Pejabat) berhasil masuk
$data = DB::table('sbm_details')
    ->where('category', 'honorarium_36')
    ->where('parent_section', 'like', '%Kendaraan Dinas Pejabat%')
    ->select('id', 'parent_section', 'data')
    ->limit(5)
    ->get();

foreach ($data as $d) {
    $json = json_decode($d->data, true);
    echo "ID: " . $d->id . " | Parent: " . $d->parent_section . " | Provinsi: " . ($json['provinsi'] ?? '?') . " | Besaran: " . ($json['besaran'] ?? '?') . PHP_EOL;
}
