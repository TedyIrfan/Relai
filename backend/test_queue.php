<?php

require 'vendor/autoload.php';

use App\Models\SbmFile;
use App\Models\SbmSheet;
use App\Jobs\ProcessSBMSheetJob;

// Mock file data
$fileData = [
    'file_name' => 'SBM_2025_Test',
    'original_filename' => 'test.xlsx',
    'file_path' => 'temp/test_sbm_12345_test.xlsx',
    'total_sheets' => 2,
    'total_rows' => 0,
    'uploaded_by' => 'Admin',
    'upload_date' => now()->toDateString(),
    'status' => 'active',
    'description' => 'Test upload'
];

echo "Creating SbmFile...\n";

try {
    $sbmFile = SbmFile::create($fileData);
    echo "SbmFile created: ID = " . $sbmFile->id . "\n";

    // Test sheet creation
    $sheetNames = ['Data uang harian', 'Data uang transport'];

    foreach ($sheetNames as $index => $sheetName) {
        echo "Creating sheet: $sheetName\n";

        $sheet = SbmSheet::create([
            'sbm_file_id' => $sbmFile->id,
            'sheet_name' => $sheetName,
            'sheet_index' => $index + 1,
            'status' => 'pending',
            'rows_count' => 0
        ]);

        echo "Sheet created: ID = " . $sheet->id . "\n";
    }

    echo "All sheets created successfully!\n";
    echo "Checking created sheets...\n";

    $sheets = SbmSheet::where('sbm_file_id', $sbmFile->id)->get();
    foreach ($sheets as $sheet) {
        echo "Sheet: " . $sheet->sheet_name . " | Status: " . ($sheet->status ?? 'NULL') . "\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "File: " . $e->getFile() . "\n";
}