<?php
$scan = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);

foreach ($scan['files'] as $f) {
    if ($f['category'] === 'pemeliharaan_kendaraan') {
        echo "File: " . $f['filename'] . PHP_EOL;
        echo "Has sub-sections: Yes" . PHP_EOL . PHP_EOL;
        if (!empty($f['sheets'][0]['sub_sections'])) {
            foreach ($f['sheets'][0]['sub_sections'] as $idx => $sub) {
                $rowCount = $sub['data_end_row'] - $sub['data_start_row'] + 1;
                echo "[$idx] " . $sub['label'] . PHP_EOL;
                echo "  Header row: " . $sub['header_row'] . PHP_EOL;
                echo "  Data: row " . $sub['data_start_row'] . " to " . $sub['data_end_row'] . PHP_EOL;
                echo "  Row count: " . $rowCount . PHP_EOL;
                echo "  Columns: " . implode(', ', $sub['columns']) . PHP_EOL;
                echo PHP_EOL;
            }
        }
        break;
    }
}
