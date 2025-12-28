<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== PARENT SECTION DISTRIBUTION ===\n\n";

// Check which categories have NULL parent_section
$result = DB::select("
    SELECT
        category,
        parent_section,
        COUNT(*) as count
    FROM sbm_details
    GROUP BY category, parent_section
    ORDER BY category, parent_section NULLS LAST
");

echo "Categories with NULL parent_section:\n";
$nullCount = 0;
foreach ($result as $row) {
    if ($row->parent_section === null) {
        echo "  - {$row->category}: {$row->count} rows\n";
        $nullCount++;
    }
}
echo "\nTotal categories with NULL parent_section: $nullCount\n\n";

// Check specific problematic categories
echo "=== H35 DETAIL ===\n";
$h35 = DB::select("SELECT id, section_label, parent_section, grouping_label, data->>'no' as no, data->>'provinsi' as provinsi FROM sbm_details WHERE category = 'honorarium_35' LIMIT 10");
foreach ($h35 as $row) {
    $parent = $row->parent_section ?? 'NULL';
    $grouping = $row->grouping_label ?? 'NULL';
    echo "ID: {$row->id} | section: {$row->section_label} | parent: $parent | grouping: $grouping | no: {$row->no} | prov: {$row->provinsi}\n";
}

echo "\n=== H36 DETAIL ===\n";
$h36 = DB::select("SELECT id, section_label, parent_section, grouping_label, data->>'no' as no, data->>'provinsi' as provinsi FROM sbm_details WHERE category = 'honorarium_36' LIMIT 10");
foreach ($h36 as $row) {
    $parent = $row->parent_section ?? 'NULL';
    $grouping = $row->grouping_label ?? 'NULL';
    echo "ID: {$row->id} | section: {$row->section_label} | parent: $parent | grouping: $grouping | no: {$row->no} | prov: {$row->provinsi}\n";
}

echo "\n=== NO 6 DETAIL ===\n";
$no6 = DB::select("SELECT id, section_label, parent_section, data->>'no' as no, data->>'uraian' as uraian FROM sbm_details WHERE category = 'beasiswa'");
foreach ($no6 as $row) {
    $parent = $row->parent_section ?? 'NULL';
    echo "ID: {$row->id} | section: {$row->section_label} | parent: $parent | no: {$row->no} | uraian: {$row->uraian}\n";
}

echo "\n=== NO 8 DETAIL ===\n";
$no8 = DB::select("SELECT id, section_label, parent_section, data->>'no' as no, data->>'uraian' as uraian FROM sbm_details WHERE category = 'honorarium_narasumber'");
foreach ($no8 as $row) {
    $parent = $row->parent_section ?? 'NULL';
    echo "ID: {$row->id} | section: {$row->section_label} | parent: $parent | no: {$row->no} | uraian: {$row->uraian}\n";
}
