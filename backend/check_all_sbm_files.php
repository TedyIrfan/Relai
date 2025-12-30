<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECK SEMUA 31 FILE SBM ===\n\n";

$scanReport = json_decode(file_get_contents('storage/sbm_scan_report.json'), true);

$totalFiles = count($scanReport['files']);
$totalSubSections = 0;
$categories = [];

echo "📊 SUMMARY:\n";
echo "Total Files: $totalFiles\n";
echo "Status Files: {$scanReport['summary']['success']} success, {$scanReport['summary']['error']} error\n";
echo "Files with Sections: {$scanReport['summary']['with_sections']}\n\n";

echo "📁 LIST FILE DETAIL:\n";
echo str_repeat("-", 100) . "\n";

foreach ($scanReport['files'] as $idx => $f) {
    $number = sprintf('[%02d]', $idx + 1);
    $filename = substr($f['filename'], 0, 50);
    $category = $f['category'];

    $subSectionCount = 0;
    if (!empty($f['sheets'][0]['sub_sections'])) {
        $subSectionCount = count($f['sheets'][0]['sub_sections']);
    }

    $totalSubSections += $subSectionCount;
    $categories[$category] = true;

    echo "$number $filename... (category: $category, sub-sections: $subSectionCount)\n";

    // Show sub-sections if any
    if ($subSectionCount > 0) {
        foreach ($f['sheets'][0]['sub_sections'] as $sidx => $sub) {
            $label = substr($sub['label'], 0, 70);
            $colCount = count($sub['columns']);
            echo "      [$sidx] $label... ($colCount kolom)\n";
        }
    }
    echo "\n";
}

echo str_repeat("=", 100) . "\n";
echo "TOTAL SUB-SECTIONS: $totalSubSections\n";
echo "TOTAL CATEGORIES: " . count($categories) . "\n";

// Check for issues
echo "\n⚠️  CHECKING ISSUES:\n\n";

$issues = [];

// Check for empty sub_sections
foreach ($scanReport['files'] as $f) {
    if (empty($f['sheets'][0]['sub_sections']) && $f['sheets'][0]['has_sections']) {
        $issues[] = "❌ {$f['filename']}: has_sections=true tapi sub_sections kosong";
    }

    // Check for exclude flag
    if (!empty($f['sheets'][0]['sub_sections'])) {
        foreach ($f['sheets'][0]['sub_sections'] as $sub) {
            if (isset($sub['exclude']) && $sub['exclude']) {
                $issues[] = "⚠️  {$f['filename']}: Section '{$sub['label']}' masih di-exclude";
            }
        }
    }
}

if (empty($issues)) {
    echo "✅ Tidak ada issue ditemukan!\n";
} else {
    foreach ($issues as $issue) {
        echo "$issue\n";
    }
}
