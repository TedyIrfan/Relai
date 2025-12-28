<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== SBM_DETAILS TABLE STRUCTURE ===\n\n";

$columns = DB::select("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'sbm_details' ORDER BY ordinal_position");

foreach ($columns as $c) {
    $nullable = $c->is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
    echo "{$c->column_name} - {$c->data_type} - $nullable\n";
}
