<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== SECTION 13 - PEMELIHARAAN KENDARAAN ===\n\n";

$data = DB::table('sbm_details')->where('category', 'pemeliharaan_kendaraan')->get();

echo "Total rows: " . $data->count() . "\n\n";

foreach ($data as $d) {
    echo "ID: " . $d->id . "\n";
    echo "  sub_category: " . ($d->sub_category ?? 'null') . "\n";
    echo "  parent_section: " . ($d->parent_section ?? 'null') . "\n";
    echo "  grouping_label: " . ($d->grouping_label ?? 'null') . "\n";
    echo "  data: " . substr($d->data, 0, 100) . "...\n\n";
}

// Summary by sub_category
echo "=== SUMMARY BY SUB_CATEGORY ===\n";
$summary = DB::table('sbm_details')
    ->where('category', 'pemeliharaan_kendaraan')
    ->select('sub_category', DB::raw('COUNT(*) as total'))
    ->groupBy('sub_category')
    ->get();

foreach ($summary as $s) {
    echo $s->sub_category . ": " . $s->total . " rows\n";
}
