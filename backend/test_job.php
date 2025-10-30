<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

use App\Models\SbmFile;
use App\Models\SbmSheet;

try {
    echo "Testing database connection...\n";

    // Test connection
    $files = SbmFile::all();
    echo "Found " . $files->count() . " files\n";

    $sheets = SbmSheet::all();
    echo "Found " . $sheets->count() . " sheets\n";

    if ($sheets->count() > 0) {
        foreach ($sheets as $sheet) {
            echo "Sheet: " . $sheet->sheet_name . " | Status: " . ($sheet->status ?? 'NULL') . " | Error: " . ($sheet->error_message ?? 'NULL') . "\n";
        }
    } else {
        echo "No sheets found in database\n";
    }

    echo "Test completed successfully!\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "File: " . $e->getFile() . "\n";
}