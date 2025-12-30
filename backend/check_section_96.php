<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECK SECTION 9.6 DI SCAN REPORT ===\n\n";

$scanReport = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);

foreach ($scanReport['files'] as $f) {
    if ($f['category'] === 'bahan_makanan') {
        echo "File: {$f['filename']}\n\n";
        foreach ($f['sheets'][0]['sub_sections'] as $idx => $sub) {
            $label = $sub['label'];
            echo "[$idx] " . substr($label, 0, 80) . "\n";
            echo "     Columns: " . implode(', ', $sub['columns']) . "\n\n";
        }
        break;
    }
}
