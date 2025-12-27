<?php

/**
 * SBM Files Scanner
 *
 * This script scans all Excel files in storage/imports/Master_SBM/
 * and generates a detailed report of their structure.
 *
 * Usage: php scan_sbm.php
 */

require __DIR__ . '/vendor/autoload.php';

// Autoload the service if not in Laravel context
if (!class_exists('App\Services\SbmScannerService')) {
    require_once __DIR__ . '/app/Services/SbmScannerService.php';
}

use App\Services\SbmScannerService;

echo "\n";
echo "==========================================\n";
echo "  SBM FILES SCANNER\n";
echo "==========================================\n";
echo "\n";

echo "Starting scan...\n";
echo "Path: storage/imports/Master_SBM/\n";
echo "\n";

try {
    $scanner = new SbmScannerService();

    echo "Scanning files...\n";
    echo "\n";

    $result = $scanner->scanAll();

    // Display progress
    $successCount = 0;
    $errorCount = 0;

    foreach ($result['files'] as $file) {
        if ($file['status'] === 'success') {
            $num = $successCount + 1;
            echo "  [" . $num . "] OK " . $file['filename'] . "\n";
            $successCount++;
        } else {
            $num = $errorCount + 1;
            echo "  [" . $num . "] ERROR " . $file['filename'] . "\n";
            echo "      Error: " . $file['error'] . "\n";
            $errorCount++;
        }
    }

    echo "\n";
    echo "==========================================\n";
    echo "  SCAN COMPLETE\n";
    echo "==========================================\n";
    echo "\n";

    echo "Summary:\n";
    echo "  Total Files Scanned: " . $result['total_files'] . "\n";
    echo "  Success: " . $result['summary']['success'] . "\n";
    echo "  Error: " . $result['summary']['error'] . "\n";
    echo "  Files with Multiple Sheets: " . $result['summary']['with_multiple_sheets'] . "\n";
    echo "  Files with Sections: " . $result['summary']['with_sections'] . "\n";
    echo "\n";

    // Save reports
    echo "Saving reports...\n";
    $scanner->saveReports($result);

    echo "  ✅ storage/sbm_scan_report.json\n";
    echo "  ✅ storage/sbm_scan_report.md\n";
    echo "\n";

    echo "==========================================\n";
    echo "  DONE!\n";
    echo "==========================================\n";
    echo "\n";

    echo "Next steps:\n";
    echo "  1. Review the reports:\n";
    echo "     - cat storage/sbm_scan_report.md\n";
    echo "     - Or open in VS Code/Editor\n";
    echo "  2. Validate against MasterSBM.md\n";
    echo "  3. Check sample data matches Excel files\n";
    echo "\n";

} catch (\Exception $e) {
    echo "\n";
    echo "==========================================\n";
    echo "  ERROR!\n";
    echo "==========================================\n";
    echo "\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
    echo "\n";
    exit(1);
}
