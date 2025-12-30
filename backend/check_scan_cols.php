<?php
$scan = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);

// Check section 11
echo "=== Section 11 (keperluan_perkantoran) ===\n";
foreach ($scan['files'] as $f) {
    if ($f['category'] === 'keperluan_perkantoran') {
        echo "Columns: " . implode(', ', $f['sheets'][0]['columns']) . "\n";
        echo "Count: " . count($f['sheets'][0]['columns']) . "\n\n";
        break;
    }
}

// Check section 19
echo "=== Section 19 (perwakilan_ri) ===\n";
foreach ($scan['files'] as $f) {
    if ($f['category'] === 'perwakilan_ri') {
        echo "Has sub-sections: " . (empty($f['sheets'][0]['sub_sections']) ? 'No' : 'Yes') . "\n";
        if (!empty($f['sheets'][0]['sub_sections'])) {
            foreach ($f['sheets'][0]['sub_sections'] as $idx => $sub) {
                echo "[$idx] " . $sub['label'] . "\n";
                echo "  Columns (" . count($sub['columns']) . "): " . implode(', ', $sub['columns']) . "\n\n";
            }
        }
        break;
    }
}

// Check Honorarium 31
echo "=== Honorarium 31 ===\n";
foreach ($scan['files'] as $f) {
    if ($f['category'] === 'honorarium_31') {
        echo "Has sub-sections: " . (empty($f['sheets'][0]['sub_sections']) ? 'No' : 'Yes') . "\n";
        if (!empty($f['sheets'][0]['sub_sections'])) {
            foreach ($f['sheets'][0]['sub_sections'] as $idx => $sub) {
                echo "[$idx] " . $sub['label'] . "\n";
                echo "  Columns (" . count($sub['columns']) . "): " . implode(', ', $sub['columns']) . "\n\n";
            }
        }
        break;
    }
}

// Check Honorarium 36.1
echo "=== Honorarium 36.1 ===\n";
foreach ($scan['files'] as $f) {
    if ($f['category'] === 'honorarium_36') {
        if (!empty($f['sheets'][0]['sub_sections'])) {
            foreach ($f['sheets'][0]['sub_sections'] as $idx => $sub) {
                if ($idx === 0) {
                    echo "[$idx] " . $sub['label'] . "\n";
                    echo "  Columns (" . count($sub['columns']) . "): " . implode(', ', $sub['columns']) . "\n\n";
                }
            }
        }
        break;
    }
}
