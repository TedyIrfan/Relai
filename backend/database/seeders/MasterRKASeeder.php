<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RkaDetail;
use App\Models\KategoriAnggaran;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class MasterRKASeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting Master RKA Seeder from Excel file...');

        // Path ke Excel file di storage/imports/Master_RKA/
        $excelPath = storage_path('imports/Master_RKA/RKA final.xlsx');

        // Cek apakah file ada
        if (!file_exists($excelPath)) {
            $this->command->error('❌ Excel file not found: ' . $excelPath);
            return;
        }

        $this->command->info('📁 Found Excel file: ' . basename($excelPath));

        try {
            // Load Excel file
            $spreadsheet = IOFactory::load($excelPath);
            $worksheet = $spreadsheet->getActiveSheet();
            $data = $worksheet->toArray();

            $totalRows = count($data) - 1; // Exclude header
            $importedCount = 0;
            $errors = [];

            $this->command->info('📊 Processing ' . $totalRows . ' rows of data...');

            // Process each row
            for ($i = 1; $i < count($data); $i++) {
                try {
                    $row = $data[$i];

                    // Skip empty rows
                    if (empty(array_filter($row))) {
                        continue;
                    }

                    // Map 16 columns dari Excel (sama seperti importExcel method)
                    $programDukunganManajemen = trim($row[0] ?? '');
                    $kodeProgram = trim($row[1] ?? '');
                    $layananUmum = trim($row[2] ?? '');
                    $kodeLayanan1 = trim($row[3] ?? '');
                    $kodeLayanan2 = trim($row[4] ?? '');
                    $layananTataUsaha = trim($row[5] ?? '');
                    $kategoriKode = trim($row[6] ?? '');
                    $codeRka = trim($row[7] ?? '');
                    $layanan = trim($row[8] ?? '');
                    $wilayah = trim($row[9] ?? '');
                    $artiKode = trim($row[10] ?? '');
                    $sisaPemakaianAnggaran = trim($row[11] ?? 0);
                    $status = trim($row[12] ?? 'Active');
                    $anggaranPerjalanan = trim($row[13] ?? 0);
                    $anggaranLayanan = trim($row[14] ?? 0);
                    $sbm = trim($row[15] ?? '');

                    // Clean numeric values
                    $anggaranPerjalanan = $this->cleanNumericValue($anggaranPerjalanan);
                    $anggaranLayanan = $this->cleanNumericValue($anggaranLayanan);
                    $sisaPemakaianAnggaran = floatval(str_replace('%', '', $sisaPemakaianAnggaran));

                    // Auto-mapping kategori A/B/C ke KA/KB/KC
                    $kategoriMapping = [
                        'A' => 'KA',
                        'B' => 'KB',
                        'C' => 'KC'
                    ];

                    // Convert A/B/C to KA/KB/KC
                    $mappedKode = isset($kategoriMapping[$kategoriKode]) ? $kategoriMapping[$kategoriKode] : $kategoriKode;

                    // Cari kategori dengan mapped code
                    $kategori = KategoriAnggaran::where('kode', $mappedKode)->first();
                    if (!$kategori) {
                        $errors[] = "Row " . ($i + 1) . ": Kategori '{$kategoriKode}' tidak ditemukan (mapped to '{$mappedKode}')";
                        continue;
                    }

                    // Check duplicate
                    $existing = RkaDetail::where([
                        'code_rka' => $codeRka,
                        'layanan' => $layanan,
                        'kategori_anggaran_id' => $kategori->id
                    ])->first();

                    if ($existing) {
                        // Update existing
                        $existing->update([
                            'program_dukungan_manajemen' => $programDukunganManajemen,
                            'kode_program' => $kodeProgram,
                            'layanan_umum' => $layananUmum,
                            'kode_layanan_1' => $kodeLayanan1,
                            'kode_layanan_2' => $kodeLayanan2,
                            'layanan_tata_usaha' => $layananTataUsaha,
                            'wilayah' => $wilayah,
                            'arti_kode' => $artiKode,
                            'sisa_pemakaian_anggaran' => $sisaPemakaianAnggaran,
                            'status' => $status,
                            'anggaran_perjalanan' => $anggaranPerjalanan,
                            'anggaran_layanan' => $anggaranLayanan,
                            'sbm' => $sbm,
                        ]);

                        $this->command->line("✏️  Updated row " . ($i + 1) . ": {$codeRka} - {$layanan}");
                    } else {
                        // Create new
                        RkaDetail::create([
                            'program_dukungan_manajemen' => $programDukunganManajemen,
                            'kode_program' => $kodeProgram,
                            'layanan_umum' => $layananUmum,
                            'kode_layanan_1' => $kodeLayanan1,
                            'kode_layanan_2' => $kodeLayanan2,
                            'layanan_tata_usaha' => $layananTataUsaha,
                            'kategori_anggaran_id' => $kategori->id,
                            'code_rka' => $codeRka,
                            'layanan' => $layanan,
                            'wilayah' => $wilayah,
                            'arti_kode' => $artiKode,
                            'sisa_pemakaian_anggaran' => $sisaPemakaianAnggaran,
                            'status' => $status,
                            'anggaran_perjalanan' => $anggaranPerjalanan,
                            'anggaran_layanan' => $anggaranLayanan,
                            'sbm' => $sbm,
                        ]);

                        $this->command->line("➕ Created row " . ($i + 1) . ": {$codeRka} - {$layanan}");
                    }

                    $importedCount++;

                    // Progress bar setiap 10 rows
                    if ($importedCount % 10 === 0) {
                        $this->command->info("📈 Processed {$importedCount} records...");
                    }

                } catch (\Exception $e) {
                    $errors[] = "Row " . ($i + 1) . ": " . $e->getMessage();
                    Log::error('Master RKA Seeder Error', [
                        'row' => $i + 1,
                        'error' => $e->getMessage(),
                        'data' => $row ?? []
                    ]);
                }
            }

            // Summary
            $this->command->info('');
            $this->command->info('🎉 Master RKA Seeder completed!');
            $this->command->line("📊 Total records processed: {$importedCount}");
            $this->command->line("📁 Source file: " . basename($excelPath));

            if (!empty($errors)) {
                $this->command->warn('⚠️  Errors found: ' . count($errors));
                foreach (array_slice($errors, 0, 5) as $error) {
                    $this->command->line("   • {$error}");
                }
                if (count($errors) > 5) {
                    $this->command->line("   • ... and " . (count($errors) - 5) . " more errors");
                }
            }

            // Get final count from database
            $totalRka = RkaDetail::count();
            $this->command->info("📈 Total RKA records in database: {$totalRka}");

        } catch (\Exception $e) {
            $this->command->error('❌ Error processing Excel file: ' . $e->getMessage());
            Log::error('Master RKA Seeder Failed', [
                'error' => $e->getMessage(),
                'file' => $excelPath
            ]);
        }
    }

    /**
     * Clean numeric value from Excel formatting
     */
    private function cleanNumericValue($value): float
    {
        // Remove formatting like "Rp", ".", ",", and convert to float
        $cleaned = str_replace(['Rp', '.', ','], ['', '', '.'], $value);
        return floatval($cleaned);
    }
}