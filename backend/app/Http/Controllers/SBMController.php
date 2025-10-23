<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\SbmFile;
use App\Models\SbmSheet;
use App\Models\SbmSheetData;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;

class SBMController extends Controller
{
    /**
     * Get all SBM files
     */
    public function index()
    {
        try {
            $files = SbmFile::withCount('sheets')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'files' => $files->map(function ($file) {
                    return [
                        'id' => $file->id,
                        'file_name' => $file->file_name,
                        'total_sheets' => $file->sheets_count,
                        'total_rows' => $file->total_rows,
                        'uploaded_by' => $file->uploaded_by,
                        'upload_date' => $file->upload_date->format('Y-m-d'),
                        'status' => $file->status
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error loading SBM files: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import Excel file with multi-sheet support
     */
    public function import(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'excel_file' => 'required|mimes:xlsx,xls,csv|max:10240' // Max 10MB
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation Error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('excel_file');
            $fileName = $file->getClientOriginalName();
            $storedFileName = 'sbm_' . time() . '_' . $fileName;

            // Store file temporarily
            $filePath = $file->storeAs('temp', $storedFileName, 'local');

            // Read Excel file (mock implementation for now)
            $sheetsData = $this->parseExcelFile($filePath);

            // Create SBM File record
            $sbmFile = SbmFile::create([
                'file_name' => 'SBM_' . date('Y') . '_Complete',
                'original_filename' => $fileName,
                'total_sheets' => count($sheetsData),
                'total_rows' => array_sum(array_column($sheetsData, 'total_rows')),
                'uploaded_by' => 'Admin', // Can get from auth user
                'upload_date' => now()->toDateString(),
                'status' => 'active',
                'description' => 'Imported on ' . now()->format('Y-m-d H:i:s')
            ]);

            // Create dedicated database tables for each sheet
            $totalRows = 0;
            foreach ($sheetsData as $index => $sheet) {
                $tableName = $this->createTableNameFromSheetName($sheet['name']);

                // Create dynamic table for this sheet
                $this->createDynamicTable($tableName, $sheet['columns']);

                // Insert data into the dynamic table
                $this->insertDataIntoDynamicTable($tableName, $sheet['sample_data']);

                // Create Sheet record for reference
                $sbmSheet = SbmSheet::create([
                    'sbm_file_id' => $sbmFile->id,
                    'name' => $sheet['name'],
                    'sheet_index' => $index + 1,
                    'headers' => json_encode([
                        'table_name' => $tableName,
                        'columns' => $sheet['columns']
                    ])
                ]);

                $totalRows += count($sheet['sample_data']);
            }

            // Clean up temp file
            Storage::disk('local')->delete($filePath);

            return response()->json([
                'success' => true,
                'message' => 'File SBM berhasil diimport!',
                'file_id' => $sbmFile->id,
                'file_name' => $sbmFile->file_name,
                'total_sheets' => $sbmFile->total_sheets,
                'total_rows' => $sbmFile->total_rows,
                'sheets' => $sbmFile->sheets->map(function($sheet) {
                    return [
                        'id' => $sheet->id,
                        'name' => $sheet->name,
                        'sheet_index' => $sheet->sheet_index,
                        'rows' => $sheet->data->count()
                    ];
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sheets for a specific file
     */
    public function getSheets($fileId)
    {
        try {
            $sheets = SbmSheet::where('sbm_file_id', $fileId)
                ->orderBy('sheet_index')
                ->get();

            return response()->json([
                'success' => true,
                'sheets' => $sheets->map(function ($sheet) {
                    return [
                        'id' => $sheet->id,
                        'name' => $sheet->name,
                        'sheet_name' => $sheet->name, // untuk backward compatibility
                        'sheet_index' => $sheet->sheet_index,
                        'sheet_order' => $sheet->sheet_index, // untuk frontend
                        'total_rows' => $sheet->data->count(),
                        'headers' => $sheet->headers
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error loading sheets: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get data for a specific sheet
     */
    public function getSheetData($sheetId)
    {
        try {
            $sheet = SbmSheet::findOrFail($sheetId);
            $headers = json_decode($sheet->headers, true);

            // Check if this sheet has a dynamic table
            if (isset($headers['table_name'])) {
                // Get data from dynamic table
                $response = $this->getDynamicTableData($headers['table_name']);

                if ($response->getData()->success) {
                    return response()->json([
                        'success' => true,
                        'data' => $response->getData()->data,
                        'sheet_info' => [
                            'id' => $sheet->id,
                            'name' => $sheet->name,
                            'sheet_index' => $sheet->sheet_index,
                            'headers' => $headers['columns'],
                            'table_name' => $headers['table_name']
                        ]
                    ]);
                }
            }

            // Fallback to old method (for backwards compatibility)
            $data = SbmSheetData::where('sbm_sheet_id', $sheetId)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $data->map(function ($row) {
                    return [
                        'id' => $row->id,
                        'row_data' => $row->row_data
                    ];
                }),
                'sheet_info' => [
                    'id' => $sheet->id,
                    'name' => $sheet->name,
                    'sheet_index' => $sheet->sheet_index,
                    'headers' => $sheet->headers
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error loading sheet data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Real Excel parsing function using PhpSpreadsheet
     * Improved to handle complex Excel structures
     */
    private function parseExcelFile($filePath)
    {
        try {
            $fullPath = Storage::disk('local')->path($filePath);

            // Load the Excel file
            $spreadsheet = IOFactory::load($fullPath);
            $sheets = [];

            // Get all sheet names
            $sheetNames = $spreadsheet->getSheetNames();

            foreach ($sheetNames as $index => $sheetName) {
                $worksheet = $spreadsheet->getSheetByName($sheetName);

                if ($worksheet) {
                    // Get the highest row and column
                    $highestRow = $worksheet->getHighestDataRow();
                    $highestColumn = $worksheet->getHighestDataColumn();

                    // Skip empty sheets
                    if ($highestRow < 5) {
                        continue;
                    }

                    // Smart header detection - find the row that contains actual headers
                    $headerRow = $this->findHeaderRow($worksheet, $highestColumn, $highestRow);

                    // Extract headers
                    $headers = $this->extractHeaders($worksheet, $headerRow, $highestColumn);

                    // Extract data rows
                    $dataRows = $this->extractDataRows($worksheet, $headerRow + 1, $highestRow, $headers, $highestColumn);

                    if (!empty($headers) && !empty($dataRows)) {
                        $sheets[] = [
                            'name' => $sheetName,
                            'total_rows' => count($dataRows),
                            'columns' => $headers,
                            'sample_data' => array_slice($dataRows, 0, 50) // Store first 50 rows as sample
                        ];
                    }
                }
            }

            return $sheets;

        } catch (\Exception $e) {
            // Fallback to mock data if parsing fails
            return [
                [
                    'name' => 'Error Parsing Excel',
                    'total_rows' => 1,
                    'columns' => ['Error', 'Message'],
                    'sample_data' => [
                        ['Error' => 'Parse Error', 'Message' => $e->getMessage()]
                    ]
                ]
            ];
        }
    }

    /**
     * Find the header row in Excel sheet
     */
    private function findHeaderRow($worksheet, $highestColumn, $highestRow)
    {
        // Common header patterns to look for
        $headerPatterns = ['NO', 'NO.', 'NOMOR', 'KODE', 'PROVINSI', 'URAIAN', 'SATUAN'];

        // Search in first 30 rows for headers (increased from 20)
        for ($row = 1; $row <= min(30, $highestRow); $row++) {
            $rowData = $worksheet->rangeToArray('A' . $row . ':' . $highestColumn . $row, NULL, TRUE, FALSE);

            if (!empty($rowData) && !empty($rowData[0])) {
                $rowText = implode(' ', array_filter($rowData[0]));

                // Skip rows that look like section numbers (e.g., "28.1 Uang Harian...")
                if (preg_match('/^\d+\.\d+/', $rowText)) {
                    continue;
                }

                // Check if this row contains common header patterns
                foreach ($headerPatterns as $pattern) {
                    if (stripos($rowText, $pattern) !== false) {
                        return $row;
                    }
                }

                // Also check for numbered column headers like (1), (2), (3)
                if (preg_match('/\(\d+\)/', $rowText)) {
                    return $row;
                }

                // Check for common Indonesian headers
                if (preg_match('/(luar kota|dalam kota|diklat)/i', $rowText)) {
                    return $row;
                }
            }
        }

        // Fallback to row 10 if no headers found (increased from 5)
        return min(10, $highestRow - 1);
    }

    /**
     * Extract headers from Excel sheet
     */
    private function extractHeaders($worksheet, $headerRow, $highestColumn)
    {
        $headers = [];
        $headerData = $worksheet->rangeToArray('A' . $headerRow . ':' . $highestColumn . $headerRow, NULL, TRUE, FALSE);

        if (!empty($headerData) && !empty($headerData[0])) {
            foreach ($headerData[0] as $colIndex => $header) {
                $cleanHeader = trim($header);
                if (!empty($cleanHeader)) {
                    // Clean header names
                    $cleanHeader = preg_replace('/\s+/', ' ', $cleanHeader); // Replace multiple spaces with single space
                    $cleanHeader = preg_replace('/\(\d+\)/', '', $cleanHeader); // Remove (1), (2), etc
                    $cleanHeader = trim($cleanHeader);

                    if (!empty($cleanHeader)) {
                        $headers[] = $cleanHeader;
                    }
                }
            }
        }

        // Validate that we found proper headers
        if (!$this->validateHeaders($headers)) {
            // Try next row if current headers are not valid
            $nextRow = $headerRow + 1;
            if ($nextRow <= $worksheet->getHighestDataRow()) {
                return $this->extractHeaders($worksheet, $nextRow, $highestColumn);
            }
        }

        return $headers;
    }

    /**
     * Validate that headers contain expected columns
     */
    private function validateHeaders($headers)
    {
        if (empty($headers)) {
            return false;
        }

        // Check if we have common header patterns
        $headerText = implode(' ', $headers);
        $commonPatterns = ['no', 'provinsi', 'satuan', 'luar', 'dalam', 'kota', 'rp', 'jumlah'];

        $foundPatterns = 0;
        foreach ($commonPatterns as $pattern) {
            if (stripos($headerText, $pattern) !== false) {
                $foundPatterns++;
            }
        }

        // Need at least 2 common patterns to consider valid headers
        return $foundPatterns >= 2;
    }

    /**
     * Extract data rows from Excel sheet
     */
    private function extractDataRows($worksheet, $startRow, $endRow, $headers, $highestColumn)
    {
        $dataRows = [];
        $maxRows = min($endRow, $startRow + 200); // Limit to 200 rows for performance

        for ($row = $startRow; $row <= $maxRows; $row++) {
            $rowData = $worksheet->rangeToArray('A' . $row . ':' . $highestColumn . $row, NULL, TRUE, FALSE);

            if (!empty($rowData) && !empty($rowData[0])) {
                $rowArray = [];
                $hasData = false;

                // Check if this is a section header row (like "28.2 Uang Representasi...")
                $firstCell = trim($rowData[0][0] ?? '');
                if (preg_match('/^\d+\.\d+/', $firstCell)) {
                    continue; // Skip section headers
                }

                foreach ($headers as $colIndex => $header) {
                    $value = $rowData[0][$colIndex] ?? '';
                    $cleanValue = trim($value);

                    // Clean numeric values (remove currency formatting)
                    if (preg_match('/Rp[\s,.0-9]+/', $cleanValue)) {
                        $cleanValue = preg_replace('/[^\d]/', '', $cleanValue);
                    }

                    // Skip if this looks like a section description
                    if (preg_match('/^\d+\.\d+/', $cleanValue) ||
                        preg_match('/(uang harian|uang representasi|perjalanan dinas)/i', $cleanValue)) {
                        continue 2; // Skip entire row
                    }

                    if (!empty($cleanValue)) {
                        $hasData = true;
                    }

                    $rowArray[$header] = $cleanValue;
                }

                // Skip empty rows or rows with only section numbers
                if ($hasData && $this->isValidDataRow($rowArray)) {
                    $dataRows[] = $rowArray;
                }
            }
        }

        return $dataRows;
    }

    /**
     * Check if row is valid data row (not section header)
     */
    private function isValidDataRow($rowArray)
    {
        foreach ($rowArray as $key => $value) {
            // Skip if value looks like section header
            if (preg_match('/^\d+\.\d+/', $value) ||
                preg_match('/(uang harian|uang representasi|perjalanan dinas|dalam negeri)/i', $value)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get file statistics
     */
    public function getStatistics()
    {
        try {
            $totalFiles = SbmFile::count();
            $activeFiles = SbmFile::where('status', 'active')->count();
            $totalSheets = SbmSheet::count();
            $totalRows = SbmSheetData::count();

            return response()->json([
                'success' => true,
                'statistics' => [
                    'total_files' => $totalFiles,
                    'active_files' => $activeFiles,
                    'total_sheets' => $totalSheets,
                    'total_rows' => $totalRows
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error loading statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a specific sheet and its data
     */
    public function deleteSheet($sheetId)
    {
        try {
            $sheet = SbmSheet::findOrFail($sheetId);

            // Delete all sheet data
            SbmSheetData::where('sbm_sheet_id', $sheetId)->delete();

            // Delete the sheet
            $sheet->delete();

            // Update parent file statistics
            $file = $sheet->file;
            $remainingSheets = SbmSheet::where('sbm_file_id', $file->id)->count();
            $remainingRows = SbmSheetData::whereIn('sbm_sheet_id',
                SbmSheet::where('sbm_file_id', $file->id)->pluck('id')
            )->count();

            $file->update([
                'total_sheets' => $remainingSheets,
                'total_rows' => $remainingRows
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sheet berhasil dihapus!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting sheet: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a file and all its sheets
     */
    public function deleteFile($fileId)
    {
        try {
            $file = SbmFile::findOrFail($fileId);

            // Get all sheet IDs for this file
            $sheetIds = SbmSheet::where('sbm_file_id', $fileId)->pluck('id');

            // Delete all sheet data
            SbmSheetData::whereIn('sbm_sheet_id', $sheetIds)->delete();

            // Delete all sheets
            SbmSheet::where('sbm_file_id', $fileId)->delete();

            // Delete the file
            $file->delete();

            return response()->json([
                'success' => true,
                'message' => 'File dan semua sheet-nya berhasil dihapus!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete files
     */
    public function bulkDeleteFiles(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file_ids' => 'required|array',
                'file_ids.*' => 'integer|exists:sbm_files,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation Error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $fileIds = $request->file_ids;
            $deletedCount = 0;

            foreach ($fileIds as $fileId) {
                $file = SbmFile::find($fileId);
                if ($file) {
                    // Get all sheet IDs for this file
                    $sheetIds = SbmSheet::where('sbm_file_id', $fileId)->pluck('id');

                    // Delete all sheet data
                    SbmSheetData::whereIn('sbm_sheet_id', $sheetIds)->delete();

                    // Delete all sheets
                    SbmSheet::where('sbm_file_id', $fileId)->delete();

                    // Delete the file
                    $file->delete();
                    $deletedCount++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => $deletedCount . ' file berhasil dihapus!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error bulk deleting files: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete sheets
     */
    public function bulkDeleteSheets(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'sheet_ids' => 'required|array',
                'sheet_ids.*' => 'integer|exists:sbm_sheets,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation Error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $sheetIds = $request->sheet_ids;
            $deletedCount = 0;

            foreach ($sheetIds as $sheetId) {
                $sheet = SbmSheet::find($sheetId);
                if ($sheet) {
                    $fileId = $sheet->sbm_file_id;

                    // Delete all sheet data
                    SbmSheetData::where('sbm_sheet_id', $sheetId)->delete();

                    // Delete the sheet
                    $sheet->delete();
                    $deletedCount++;

                    // Update parent file statistics
                    $file = SbmFile::find($fileId);
                    if ($file) {
                        $remainingSheets = SbmSheet::where('sbm_file_id', $fileId)->count();
                        $remainingRows = SbmSheetData::whereIn('sbm_sheet_id',
                            SbmSheet::where('sbm_file_id', $fileId)->pluck('id')
                        )->count();

                        $file->update([
                            'total_sheets' => $remainingSheets,
                            'total_rows' => $remainingRows
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => $deletedCount . ' sheet berhasil dihapus!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error bulk deleting sheets: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create table name from sheet name
     */
    private function createTableNameFromSheetName($sheetName)
    {
        // Clean sheet name to create valid table name
        $tableName = 'sbm_' . strtolower($sheetName);
        $tableName = preg_replace('/[^a-z0-9_]/', '_', $tableName);
        $tableName = preg_replace('/_+/', '_', $tableName);
        $tableName = trim($tableName, '_');
        $tableName = Str::limit($tableName, 50, '');

        // Ensure table name starts with letter
        if (preg_match('/^[0-9]/', $tableName)) {
            $tableName = 'sbm_sheet_' . $tableName;
        }

        return $tableName;
    }

    /**
     * Create dynamic table for sheet data
     */
    private function createDynamicTable($tableName, $columns)
    {
        // Drop table if exists
        Schema::dropIfExists($tableName);

        // Create table with columns from sheet
        Schema::create($tableName, function ($table) use ($columns) {
            $table->id();
            $table->string('import_session')->nullable(); // For tracking imports

            foreach ($columns as $column) {
                $cleanColumn = $this->sanitizeColumnName($column);

                // Determine column type based on column name
                $columnType = $this->determineColumnType($column);

                if ($columnType === 'text') {
                    $table->text($cleanColumn)->nullable();
                } elseif ($columnType === 'decimal') {
                    $table->decimal($cleanColumn, 15, 2)->nullable();
                } elseif ($columnType === 'integer') {
                    $table->integer($cleanColumn)->nullable();
                } else {
                    $table->string($cleanColumn, 500)->nullable();
                }
            }

            $table->timestamps();
        });
    }

    /**
     * Insert data into dynamic table
     */
    private function insertDataIntoDynamicTable($tableName, $dataRows)
    {
        if (empty($dataRows)) {
            return;
        }

        $importSession = 'import_' . time();

        foreach ($dataRows as $row) {
            $insertData = ['import_session' => $importSession];

            foreach ($row as $column => $value) {
                $cleanColumn = $this->sanitizeColumnName($column);

                // Get column type to properly format data
                $columnType = $this->determineColumnType($column);
                $cleanValue = $this->formatDataByType($value, $columnType);

                $insertData[$cleanColumn] = $cleanValue;
            }

            try {
                DB::table($tableName)->insert($insertData);
            } catch (\Exception $e) {
                // Skip rows with data type errors
                continue;
            }
        }
    }

    /**
     * Format data based on column type
     */
    private function formatDataByType($value, $columnType)
    {
        if (empty($value)) {
            return null;
        }

        if ($columnType === 'decimal') {
            // Clean currency values
            $cleanValue = preg_replace('/[^\d]/', '', $value);
            return is_numeric($cleanValue) ? (float) $cleanValue : null;
        }

        if ($columnType === 'integer') {
            // Clean numeric values
            $cleanValue = preg_replace('/[^\d]/', '', $value);
            return is_numeric($cleanValue) ? (int) $cleanValue : null;
        }

        return $value;
    }

    /**
     * Sanitize column name for database
     */
    private function sanitizeColumnName($columnName)
    {
        $cleanName = strtolower($columnName);
        $cleanName = preg_replace('/[^a-z0-9_]/', '_', $cleanName);
        $cleanName = preg_replace('/_+/', '_', $cleanName);
        $cleanName = trim($cleanName, '_');

        // Ensure column name doesn't start with number
        if (preg_match('/^[0-9]/', $cleanName)) {
            $cleanName = 'col_' . $cleanName;
        }

        // Ensure column name is not empty
        if (empty($cleanName)) {
            $cleanName = 'unnamed_column';
        }

        return Str::limit($cleanName, 60, '');
    }

    /**
     * Determine column type based on column name
     */
    private function determineColumnType($columnName)
    {
        $columnLower = strtolower($columnName);

        // Check for numeric/money columns (Indonesian format)
        if (preg_match('/(nilai|rp|jumlah|total|nominal|harga|biaya|value|amount|luar kota|dalam kota|lebih dari)/', $columnLower)) {
            return 'decimal';
        }

        // Check for integer columns
        if (preg_match('/(no|nomor|id|jumlah|tahun|bulan|tanggal|number)/', $columnLower)) {
            return 'integer';
        }

        // Check for text columns
        if (preg_match('/(deskripsi|keterangan|alamat|description|notes|provinsi|uraian)/', $columnLower)) {
            return 'text';
        }

        // Default to string
        return 'string';
    }

    /**
     * Get data from dynamic table
     */
    public function getDynamicTableData($tableName)
    {
        try {
            // Check if table exists
            if (!Schema::hasTable($tableName)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Table does not exist'
                ], 404);
            }

            // Get data from dynamic table
            $data = DB::table($tableName)
                ->orderBy('id')
                ->limit(1000) // Limit to 1000 records for performance
                ->get();

            return response()->json([
                'success' => true,
                'data' => $data,
                'table_name' => $tableName
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get list of all SBM dynamic tables
     */
    public function getDynamicTables()
    {
        try {
            $tables = DB::select("
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name LIKE 'sbm_%'
                AND table_name NOT IN ('sbm_files', 'sbm_sheets', 'sbm_sheet_data')
                ORDER BY table_name
            ");

            return response()->json([
                'success' => true,
                'tables' => $tables
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching tables: ' . $e->getMessage()
            ], 500);
        }
    }
}
