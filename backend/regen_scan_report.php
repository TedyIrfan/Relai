<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== REGENERATING SCAN REPORT ===\n\n";

$scanner = app(App\Services\SbmScannerService::class);
$scanResult = $scanner->scanAll();

// Save scan report
file_put_contents('storage/sbm_scan_report.json', json_encode($scanResult, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "Scan complete.\n\n";

// Verify section 9.2 is no longer excluded
echo "=== VERIFYING SECTION 9.2 ===\n";
foreach ($scanResult['files'] as $f) {
    if ($f['category'] === 'bahan_makanan') {
        foreach ($f['sheets'][0]['sub_sections'] as $idx => $sub) {
            if (strpos($sub['label'], 'Operasi Pasukan') !== false) {
                $exclude = isset($sub['exclude']) && $sub['exclude'] ? 'STILL EXCLUDED!' : 'OK - No longer excluded';
                echo "Section [$idx]: $exclude\n";
                echo "Label: " . substr($sub['label'], 0, 50) . "...\n";
            }
        }
        break;
    }
}

echo "\n=== SCAN REPORT UPDATED ===\n";
echo "File: storage/sbm_scan_report.json\n";
echo "\nNow you can run: php artisan migrate:fresh --seed\n";
