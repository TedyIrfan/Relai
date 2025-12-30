<?php
$scan = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);
foreach ($scan['files'] as $f) {
    if ($f['category'] === 'honorarium_36') {
        echo 'File: ' . $f['filename'] . PHP_EOL;
        echo 'Has sub-sections: ' . (empty($f['sheets'][0]['sub_sections']) ? 'No' : 'Yes') . PHP_EOL;
        if (!empty($f['sheets'][0]['sub_sections'])) {
            foreach ($f['sheets'][0]['sub_sections'] as $idx => $sub) {
                echo '[' . $idx . '] ' . $sub['label'] . PHP_EOL;
                echo '  Cols: ' . implode(', ', $sub['columns']) . PHP_EOL . PHP_EOL;
            }
        }
        break;
    }
}
