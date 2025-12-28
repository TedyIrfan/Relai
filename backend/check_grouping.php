<?php
$json = file_get_contents('storage/sbm_scan_report.json');
$report = json_decode($json, true);

foreach ($report['files'] as $file) {
    if ($file['category'] === 'honorarium_35' || $file['category'] === 'honorarium_36') {
        echo "=== " . $file['category'] . " ===\n";
        foreach ($file['sheets'] as $sheet) {
            if (!empty($sheet['sub_sections'])) {
                foreach ($sheet['sub_sections'] as $idx => $sub) {
                    echo "\nSub-section " . ($idx+1) . ": " . $sub['label'] . "\n";
                    echo "Data rows: " . $sub['data_start_row'] . " to " . $sub['data_end_row'] . "\n";
                    echo "Sample data (first 8 rows):\n";
                    foreach (array_slice($sub['sample_data'], 0, 8) as $i => $sample) {
                        $no = $sample['NO'] ?? 'N/A';
                        $prov = $sample['PROVINSI'] ?? $sample['URAIAN'] ?? 'N/A';
                        echo "  " . ($i+1) . ". NO=" . $no . " | PROVINSI/URAIAN=" . $prov . "\n";
                    }
                }
            }
        }
        echo "\n---\n\n";
    }
}
