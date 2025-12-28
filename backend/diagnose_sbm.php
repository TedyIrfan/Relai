<?php

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$parser = app(App\Services\SbmParserService::class);

echo "==========================================" . PHP_EOL;
echo "  SBM DIAGNOSTIC SCAN" . PHP_EOL;
echo "==========================================" . PHP_EOL . PHP_EOL;

$result = $parser->parseAll();

$issues = [];
$warnings = [];
$summary = [];

// Group by category
$categories = [];
foreach ($result['data'] as $row) {
    $cat = $row['category'];
    if (!isset($categories[$cat])) {
        $categories[$cat] = [];
    }
    $categories[$cat][] = $row;
}

echo "Analyzing " . count($result['data']) . " parsed rows across " . count($categories) . " categories..." . PHP_EOL . PHP_EOL;

// Check each category
foreach ($categories as $category => $rows) {
    echo "Checking category: $category (" . count($rows) . " rows)" . PHP_EOL;

    // Check 1: Currency issues for MIXED currency categories
    $mixedCategories = [
        'honorarium_narasumber',
        'tiket_pesawat_luar_negeri',
        'tiket_pesawat_dalam_negeri'
    ];

    if (in_array($category, $mixedCategories)) {
        $currencyCounts = array_count_values(array_column($rows, 'currency'));
        echo "  Currency distribution: " . json_encode($currencyCounts) . PHP_EOL;

        // Check if all rows have same currency (might be wrong for MIXED category)
        if (count($currencyCounts) === 1) {
            $warnings[] = [
                'category' => $category,
                'type' => 'MIXED_CURRENCY_SINGLE',
                'message' => "Category is MIXED but all rows have currency: " . array_key_first($currencyCounts),
                'count' => count($rows)
            ];
        }
    }

    // Check 2: Rows with suspicious grouping_label patterns
    foreach ($rows as $i => $row) {
        $data = json_decode($row['data'], true);

        // Check for "NO" field that looks like version number (8.1, 19.2) but lost the dot
        $no = $data['no'] ?? '';
        if (preg_match('/^\d+$/', $no) && strlen($no) >= 2) {
            // Check if this could be a version number that lost its dot
            // e.g., "81" could be "8.1", "191" could be "19.1"
            if (strlen($no) === 2 && $no[0] !== '1') {
                $warnings[] = [
                    'category' => $category,
                    'type' => 'SUSPICIOUS_NO_FIELD',
                    'message' => "Row $i: 'no' field is '$no' - might be a version number that lost its dot (e.g., 8.1 → 81)",
                    'data' => $row
                ];
            }
        }

        // Check for empty besaran/amount fields
        $besaran = $data['besaran'] ?? '';
        if (empty($besaran) && !empty($data['uraian'])) {
            $warnings[] = [
                'category' => $category,
                'type' => 'EMPTY_BESARAN',
                'message' => "Row $i: Has uraian but empty besaran/amount",
                'uraian' => $data['uraian'] ?? 'N/A'
            ];
        }
    }

    echo "  OK" . PHP_EOL;
}

// Check 3: Analyze skipped rows
echo PHP_EOL . "Analyzing skipped rows..." . PHP_EOL;
foreach ($result['file_stats'] ?? $result['fileStats'] ?? [] as $file) {
    $category = $file['category'];
    $skippedRows = $file['skipped_rows'] ?? [];

    if (count($skippedRows) > 0) {
        echo "  {$file['label']}: {$file['skipped']} skipped" . PHP_EOL;

        // Look for suspicious skip reasons
        foreach ($skippedRows as $skip) {
            $reason = $skip['reason'] ?? '';

            // If section label contains $ or Rp or numbers, it might be data
            if (strpos($reason, 'Section label:') !== false) {
                if (strpos($reason, '$') !== false || stripos($reason, 'Rp') !== false) {
                    $issues[] = [
                        'category' => $category,
                        'type' => 'SECTION_LABEL_WITH_DATA',
                        'message' => "Row {$skip['row_number']}: Skipped as section label but contains currency symbol",
                        'details' => $reason
                    ];
                }
            }

            // If golongan label has many fields, it might be data
            if (strpos($reason, 'Only') !== false && strpos($reason, 'fields filled') !== false) {
                // Extract number of fields
                if (preg_match('/Only (\d+) fields filled/', $reason, $matches)) {
                    $numFields = (int)$matches[1];
                    if ($numFields >= 3) {
                        $warnings[] = [
                            'category' => $category,
                            'type' => 'MANY_FIELDS_SKIPPED',
                            'message' => "Row {$skip['row_number']}: Skipped with $numFields fields - might be valid data",
                            'details' => $reason
                        ];
                    }
                }
            }
        }
    }
}

// Check 4: Category-level validation
echo PHP_EOL . "Category-level validation..." . PHP_EOL;

$expectedMinRows = [
    'honorarium_narasumber' => 4,  // 8.1, a, b, c
    'perwakilan_ri' => 50,  // Many cities
    'transportasi_provinsi' => 30,  // Many provinces
];

foreach ($expectedMinRows as $cat => $minRows) {
    $actualRows = count($categories[$cat] ?? []);
    if ($actualRows < $minRows) {
        $issues[] = [
            'category' => $cat,
            'type' => 'TOO_FEW_ROWS',
            'message' => "Expected at least $minRows rows but got $actualRows"
        ];
    }
}

// Print summary
echo PHP_EOL . "==========================================" . PHP_EOL;
echo "  DIAGNOSTIC SUMMARY" . PHP_EOL;
echo "==========================================" . PHP_EOL . PHP_EOL;

echo "ISSUES FOUND: " . count($issues) . PHP_EOL;
foreach ($issues as $i => $issue) {
    echo PHP_EOL . "[" . ($i + 1) . "] {$issue['category']}" . PHP_EOL;
    echo "    Type: {$issue['type']}" . PHP_EOL;
    echo "    Message: {$issue['message']}" . PHP_EOL;
    if (isset($issue['details'])) {
        echo "    Details: {$issue['details']}" . PHP_EOL;
    }
}

echo PHP_EOL . "WARNINGS: " . count($warnings) . PHP_EOL;
foreach ($warnings as $i => $warning) {
    echo PHP_EOL . "[" . ($i + 1) . "] {$warning['category']}" . PHP_EOL;
    echo "    Type: {$warning['type']}" . PHP_EOL;
    echo "    Message: {$warning['message']}" . PHP_EOL;
}

echo PHP_EOL . "==========================================" . PHP_EOL;
if (count($issues) === 0 && count($warnings) === 0) {
    echo "  ✅ NO ISSUES FOUND - All SBM files look good!" . PHP_EOL;
} else {
    echo "  Found " . count($issues) . " issues and " . count($warnings) . " warnings" . PHP_EOL;
}
echo "==========================================" . PHP_EOL;
