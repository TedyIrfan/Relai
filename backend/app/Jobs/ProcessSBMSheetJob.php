<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\SbmFile;
use App\Models\SbmSheet;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ProcessSBMSheetJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The file instance.
     *
     * @var \App\Models\SbmFile
     */
    protected $file;

    /**
     * The sheet name.
     *
     * @var string
     */
    protected $sheetName;

    /**
     * Create a new job instance.
     */
    public function __construct(SbmFile $file, string $sheetName)
    {
        $this->file = $file;
        $this->sheetName = $sheetName;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Update sheet status to processing
            $sheet = SbmSheet::where('sbm_file_id', $this->file->id)
                ->where('sheet_name', $this->sheetName)
                ->firstOrFail();

            $sheet->update([
                'status' => 'processing',
                'processed_at' => now()
            ]);

            // Load Excel file
            $filePath = Storage::disk('local')->path($this->file->file_path);
            $spreadsheet = IOFactory::load($filePath);
            $worksheet = $spreadsheet->getSheetByName($this->sheetName);

            if (!$worksheet) {
                throw new \Exception("Sheet '{$this->sheetName}' not found");
            }

            // Create table name
            $tableName = 'sbm_' . Str::slug($this->sheetName, '_');

            // Drop table if exists
            if (Schema::hasTable($tableName)) {
                Schema::dropIfExists($tableName);
            }

            // Get headers from first row
            $headers = [];
            $columnTypes = [];
            foreach ($worksheet->getRowIterator() as $index => $row) {
                if ($index === 1) {
                    foreach ($row->getCellIterator() as $cell) {
                        $header = trim($cell->getValue());
                        if (!empty($header)) {
                            $columnName = Str::slug($header, '_');
                            $headers[] = $columnName;
                            $columnTypes[$columnName] = 'TEXT'; // Default type
                        }
                    }
                    break;
                }
            }

            // Create table
            if (!empty($headers)) {
                Schema::create($tableName, function ($table) use ($headers) {
                    $table->id();
                    foreach ($headers as $header) {
                        $table->text($header)->nullable();
                    }
                    $table->timestamps();
                });

                // Insert data
                $data = [];
                $rowCount = 0;

                foreach ($worksheet->getRowIterator() as $index => $row) {
                    if ($index === 1) continue; // Skip header row

                    $rowData = [];
                    $cellIndex = 0;

                    foreach ($row->getCellIterator() as $cell) {
                        if ($cellIndex < count($headers)) {
                            $value = $cell->getValue();
                            $rowData[$headers[$cellIndex]] = $value !== null ? (string) $value : null;
                            $cellIndex++;
                        }
                    }

                    if (!empty(array_filter($rowData))) {
                        $rowData['created_at'] = now();
                        $rowData['updated_at'] = now();
                        $data[] = $rowData;
                        $rowCount++;

                        // Insert in batches of 100
                        if (count($data) >= 100) {
                            DB::table($tableName)->insert($data);
                            $data = [];
                        }
                    }
                }

                // Insert remaining data
                if (!empty($data)) {
                    DB::table($tableName)->insert($data);
                }

                // Update sheet with success
                $sheet->update([
                    'status' => 'completed',
                    'rows_count' => $rowCount,
                    'table_name' => $tableName,
                    'processed_at' => now()
                ]);
            } else {
                throw new \Exception("No headers found in sheet");
            }

        } catch (\Exception $e) {
            // Update sheet with error
            if (isset($sheet)) {
                $sheet->update([
                    'status' => 'error',
                    'error_message' => $e->getMessage(),
                    'processed_at' => now()
                ]);
            }

            // Re-throw exception for queue handling
            throw $e;
        }
    }

    /**
     * The job failed to process.
     */
    public function failed(\Throwable $exception): void
    {
        // Update sheet with error
        $sheet = SbmSheet::where('sbm_file_id', $this->file->id)
            ->where('sheet_name', $this->sheetName)
            ->first();

        if ($sheet) {
            $sheet->update([
                'status' => 'error',
                'error_message' => $exception->getMessage(),
                'processed_at' => now()
            ]);
        }
    }
}
