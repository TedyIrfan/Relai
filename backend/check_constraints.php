<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECK CONSTRAINTS ON sbm_details ===\n\n";

// Check for CHECK constraints
$checks = DB::select("SELECT conname, pg_get_constraintdef(oid) as definition FROM pg_constraint WHERE conrelid = 'sbm_details'::regclass AND contype = 'c'");

if (empty($checks)) {
    echo "No CHECK constraints found.\n";
} else {
    foreach ($checks as $c) {
        echo "Constraint: {$c->conname}\n";
        echo "Definition: {$c->definition}\n\n";
    }
}

// Check for all constraint types
echo "=== ALL CONSTRAINTS ===\n";
$all = DB::select("SELECT conname, contype, pg_get_constraintdef(oid) as definition FROM pg_constraint WHERE conrelid = 'sbm_details'::regclass ORDER BY contype, conname");

$types = [
    'c' => 'CHECK',
    'f' => 'FOREIGN KEY',
    'p' => 'PRIMARY KEY',
    'u' => 'UNIQUE',
    'x' => 'EXCLUSION'
];

foreach ($all as $c) {
    $typeName = $types[$c->contype] ?? $c->contype;
    echo "{$typeName}: {$c->conname} - {$c->definition}\n";
}
