<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECK SCAN REPORT FOR SECTION 9.2 EXCLUDE FLAG ===\n\n";

$report = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);

foreach ($report['files'] as $f) {
    if ($f['category'] === 'bahan_makanan') {
        echo "File: {$f['filename']}\n\n";
        foreach ($f['sheets'][0]['sub_sections'] as $idx => $sub) {
            $label = substr($sub['label'], 0, 60);
            if (strlen($sub['label']) > 60) {
                $label .= '...';
            }
            $exclude = isset($sub['exclude']) && $sub['exclude'] ? 'EXCLUDED!' : 'OK';
            echo "[$idx] $exclude\n";
            echo "     Label: $label\n";
            if (strpos($sub['label'], '9.2') !== false) {
                echo "     *** THIS IS SECTION 9.2 ***\n";
            }
            echo "\n";
        }
        break;
    }
}
