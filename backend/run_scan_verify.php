<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== RUNNING SCANNER ===\n\n";

$scanner = app(App\Services\SbmScannerService::class);
$scanResult = $scanner->scanAll();

// Save scan report
file_put_contents('storage/sbm_scan_report.json', json_encode($scanResult, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "Scan complete. Checking section labels...\n\n";

// Check specific categories
$targets = ['honorarium_35', 'honorarium_36', 'beasiswa', 'honorarium_narasumber'];

foreach ($targets as $cat) {
    foreach ($scanResult['files'] as $f) {
        if ($f['category'] === $cat) {
            echo "=== $cat ===\n";
            foreach ($f['sheets'][0]['sub_sections'] as $idx => $sub) {
                $label = $sub['label'];
                // Cek apakah masih ada double spaces
                $hasDoubleSpace = strpos($label, '  ') !== false;
                $status = $hasDoubleSpace ? '❌ DOUBLE SPACE' : '✓ OK';
                echo "  [$idx] $status: '$label'\n";
            }
            echo "\n";
            break;
        }
    }
}

echo "=== SCAN REPORT UPDATED ===\n";
echo "File: storage/sbm_scan_report.json\n";
echo "Now you can run: php artisan migrate:fresh --seed\n";
