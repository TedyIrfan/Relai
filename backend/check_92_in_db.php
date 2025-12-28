<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECK SECTION 9.2 IN DATABASE ===\n\n";

// Check all bahan_makanan rows
$count = DB::table('sbm_details')->where('category', 'bahan_makanan')->count();
echo "Total bahan_makanan rows: $count\n";

// Check for parent_section containing 9.2
$count92 = DB::table('sbm_details')
    ->where('category', 'bahan_makanan')
    ->where('parent_section', 'like', '%9.2%')
    ->count();
echo "Rows with parent_section containing '9.2': $count92\n";

// Get sample rows
echo "\n=== SAMPLE ROWS ===\n";
$rows = DB::table('sbm_details')
    ->where('category', 'bahan_makanan')
    ->limit(5)
    ->get();

foreach ($rows as $row) {
    echo "ID: {$row->id} | parent: " . substr($row->parent_section ?? 'NULL', 0, 50) . "...\n";
}

// Check all unique parent_sections
echo "\n=== ALL UNIQUE PARENT SECTIONS ===\n";
$sections = DB::table('sbm_details')
    ->where('category', 'bahan_makanan')
    ->select(DB::raw('DISTINCT substring(parent_section from 1 for 3) as section_num, COUNT(*) as count'))
    ->groupBy('section_num')
    ->get();

foreach ($sections as $s) {
    echo "Section {$s->section_num}: {$s->count} rows\n";
}
