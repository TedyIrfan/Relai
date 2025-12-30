<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== BANDINGKAN SCAN REPORT DENGAN MasterSBM.md ===\n\n";

$scanReport = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);
// MasterSBM.md ada di root project (di atas folder backend)
$mdPath = dirname(__DIR__) . '/MasterSBM.md';
if (!file_exists($mdPath)) {
    // Try alternate path
    $mdPath = '/var/www/html/MasterSBM.md';
}
$mdContent = file_get_contents($mdPath);

// Parse MasterSBM.md untuk extract kolom
$mdColumns = [];
$currentSection = null;
$currentFile = null;
$lines = explode("\n", $mdContent);

for ($i = 0; $i < count($lines); $i++) {
    $line = trim($lines[$i]);

    // Detect section header - lebih fleksibel
    if (preg_match('/^##\s+(.+)$/', $line, $m)) {
        $currentSection = trim($m[1]);
        $currentFile = $currentSection;
        continue;
    }
    if (preg_match('/^###\s+(.+)$/', $line, $m)) {
        $currentSection = trim($m[1]);
        continue;
    }

    // Detect column list - lebih fleksibel
    if (preg_match('/^\*\*Kolom:\*\*$/', $line) || preg_match('/^\*\*Kolom\s+\*\*:/', $line)) {
        // Next lines are columns until ---, ##, or end
        $cols = [];
        $i++;
        while ($i < count($lines)) {
            $colLine = trim($lines[$i]);
            // Stop at section headers or separators
            if (preg_match('/^---$/', $colLine) || preg_match('/^##+/', $colLine)) {
                break;
            }
            if (preg_match('/^-\s+(.+)$/', $colLine, $m)) {
                $col = trim($m[1]);
                if ($col && $col !== '**Kolom:**') {
                    $cols[] = $col;
                }
            }
            $i++;
        }
        if ($currentSection && $cols) {
            $mdColumns[$currentSection] = $cols;
        }
    }
}

echo "MasterSBM.md: " . count($mdColumns) . " sections ditemukan\n\n";

// Compare with scan report
$missingInMD = [];
$mismatchColumns = [];

foreach ($scanReport['files'] as $f) {
    $filename = $f['filename'];
    $category = $f['category'];

    if (empty($f['sheets'][0]['sub_sections'])) {
        // No sub-sections, use main columns
        $scanCols = $f['sheets'][0]['columns'] ?? [];
        // Find matching section in MD - try multiple strategies
        $found = false;
        foreach ($mdColumns as $mdSection => $mdCols) {
            $normalizedMD = preg_replace('/\s+/', ' ', trim($mdSection));
            $normalizedFile = preg_replace('/\s+/', ' ', trim(str_replace('.xlsx', '', $filename)));

            // Strategy 1: Exact match
            if ($normalizedMD === $normalizedFile) {
                $found = true;
            }
            // Strategy 2: MD contains file name
            elseif (stripos($normalizedMD, $normalizedFile) !== false) {
                $found = true;
            }
            // Strategy 3: File contains partial MD
            elseif (stripos($normalizedFile, substr($normalizedMD, 0, 30)) !== false) {
                $found = true;
            }

            if ($found) {
                // Compare columns
                $normalizedScanCols = array_map(fn($c) => preg_replace('/\s+/', ' ', trim($c)), $scanCols);
                $normalizedMDCols = array_map(fn($c) => preg_replace('/\s+/', ' ', trim($c)), $mdCols);

                $diffScan = array_diff($normalizedScanCols, $normalizedMDCols);
                $diffMD = array_diff($normalizedMDCols, $normalizedScanCols);

                if (!empty($diffScan) || !empty($diffMD)) {
                    $mismatchColumns[] = [
                        'file' => $filename,
                        'section' => $mdSection,
                        'scan_cols' => $normalizedScanCols,
                        'md_cols' => $normalizedMDCols,
                        'diff_scan' => $diffScan,
                        'diff_md' => $diffMD,
                    ];
                }
                break;
            }
        }
    } else {
        // Has sub-sections
        foreach ($f['sheets'][0]['sub_sections'] as $subIndex => $sub) {
            $subLabel = $sub['label'];
            $scanCols = $sub['columns'] ?? [];

            // Find matching section in MD - improved matching
            $found = false;
            $matchedMDSection = null;
            $bestMatchScore = 0;
            $bestMatchSection = null;

            // Build category context from filename
            $categoryContext = '';
            if (preg_match('/Honorarium\s+(\d+)/', $filename, $m)) {
                $honNum = $m[1];
                $categoryContext = "Honorarium $honNum";
            } elseif (preg_match('/^(\d+)\.\s/', $filename, $m)) {
                $mainNum = $m[1];
                $categoryContext = "$mainNum";
            }

            foreach ($mdColumns as $mdSection => $mdCols) {
                $normalizedMD = preg_replace('/\s+/', ' ', trim($mdSection));
                $normalizedSub = preg_replace('/\s+/', ' ', $subLabel);

                // Strip "Honorarium XX" prefix for comparison
                $mdForCompare = $normalizedMD;
                if (preg_match('/^Honorarium\s+\d+\.\d+\s+(.+)$/', $normalizedMD, $m)) {
                    $mdForCompare = $m[1];
                }
                if (preg_match('/^Honorarium\s+\d+\s+(.+)$/', $normalizedMD, $m)) {
                    $mdForCompare = $m[1];
                }

                // Calculate match score
                $currentScore = 0;

                // Strategy 1: Exact match
                if ($mdForCompare === $normalizedSub) {
                    $currentScore = 100;
                }
                // Strategy 2: MD contains scan label exactly (full label match)
                elseif (strpos($mdForCompare, $normalizedSub) !== false && strlen($normalizedSub) > 10) {
                    // Full containment - high score
                    $currentScore = 90;
                }
                // Strategy 3: Scan contains MD (partial match)
                elseif (strpos($normalizedSub, $mdForCompare) !== false && strlen($mdForCompare) > 10) {
                    $currentScore = 80;
                }
                // Strategy 4: Category-aware matching for Honorarium sections
                elseif ($categoryContext && strpos($normalizedMD, $categoryContext . '.') !== false) {
                    // Check if text portion matches reasonably
                    similar_text($normalizedSub, $mdForCompare, $percent);
                    $currentScore = $percent * 0.5;
                }
                // Strategy 5: Similarity for long labels
                elseif (strlen($normalizedMD) > 40 && strlen($normalizedSub) > 40) {
                    similar_text($normalizedSub, $mdForCompare, $percent);
                    if ($percent > 70) {
                        $currentScore = $percent * 0.6;
                    }
                }

                // Check category match (additional bonus)
                if ($categoryContext && strpos($normalizedMD, $categoryContext) !== false) {
                    $currentScore += 10;
                }

                // Track best match
                if ($currentScore > $bestMatchScore) {
                    $bestMatchScore = $currentScore;
                    $bestMatchSection = $mdSection;
                }

                // Accept exact matches immediately
                if ($currentScore >= 100) {
                    $found = true;
                    $matchedMDSection = $mdSection;
                    break;
                }
            }

            // Use best match if score is high enough and no exact match found
            if (!$found && $bestMatchScore >= 80) {
                $found = true;
                $matchedMDSection = $bestMatchSection;
            }

            if ($found && $matchedMDSection) {
                // Compare columns
                $normalizedScanCols = array_map(fn($c) => preg_replace('/\s+/', ' ', trim($c)), $scanCols);
                $normalizedMDCols = array_map(fn($c) => preg_replace('/\s+/', ' ', trim($c)), $mdColumns[$matchedMDSection]);

                $diffScan = array_diff($normalizedScanCols, $normalizedMDCols);
                $diffMD = array_diff($normalizedMDCols, $normalizedScanCols);

                if (!empty($diffScan) || !empty($diffMD)) {
                    $mismatchColumns[] = [
                        'file' => $filename,
                        'section' => $matchedMDSection,
                        'scan_label' => $subLabel,
                        'scan_cols' => $normalizedScanCols,
                        'md_cols' => $normalizedMDCols,
                        'diff_scan' => $diffScan,
                        'diff_md' => $diffMD,
                    ];
                }
            } else {
                $missingInMD[] = [
                    'file' => $filename,
                    'section' => $subLabel,
                    'cols' => $scanCols,
                ];
            }
        }
    }
}

// Output results
echo str_repeat("=", 80) . "\n";
echo "HASIL PERBANDINGAN:\n";
echo str_repeat("=", 80) . "\n\n";

if (empty($missingInMD) && empty($mismatchColumns)) {
    echo "✅ SEMUA KOLOM SAMA! Tidak ada perbedaan antara scan report dan MasterSBM.md\n\n";
} else {
    if (!empty($missingInMD)) {
        echo "❌ SECTION YANG HANYA ADA DI SCAN REPORT (PERLU DITAMBAH KE MasterSBM.md):\n\n";
        foreach ($missingInMD as $idx => $m) {
            echo "[" . ($idx + 1) . "] {$m['file']}\n";
            echo "    Section: " . substr($m['section'], 0, 70) . "\n";
            echo "    Kolom: " . implode(', ', $m['cols']) . "\n\n";
        }
    }

    if (!empty($mismatchColumns)) {
        echo "⚠️  PERBEDAAN KOLOM:\n\n";
        foreach ($mismatchColumns as $idx => $m) {
            echo "[" . ($idx + 1) . "] {$m['file']}\n";
            echo "    Section: " . substr($m['section'], 0, 60) . "\n";
            if (isset($m['scan_label'])) {
                echo "    Scan Label: " . substr($m['scan_label'], 0, 60) . "\n";
            }
            if (!empty($m['diff_scan'])) {
                echo "    Di scan tapi TIDAK di MD: " . implode(', ', $m['diff_scan']) . "\n";
            }
            if (!empty($m['diff_md'])) {
                echo "    Di MD tapi TIDAK di scan: " . implode(', ', $m['diff_md']) . "\n";
            }
            echo "\n";
        }
    }

    echo "\n";
}

echo str_repeat("=", 80) . "\n";
echo "Total Missing in MD: " . count($missingInMD) . "\n";
echo "Total Mismatches: " . count($mismatchColumns) . "\n";
