<?php

namespace App\Http\Controllers;

use App\Models\RkaDetail;
use App\Models\KategoriAnggaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\IOFactory;

class RKADetailsController extends Controller
{
    public function index(Request $request)
    {
        $query = RkaDetail::with('kategoriAnggaran');

        // Search functionality
        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('layanan', 'LIKE', '%' . $search . '%')
                  ->orWhere('code_rka', 'LIKE', '%' . $search . '%')
                  ->orWhere('wilayah', 'LIKE', '%' . $search . '%')
                  ->orWhere('arti_kode', 'LIKE', '%' . $search . '%');
            });
        }

        // Filter by kategori
        if ($request->kategori) {
            $query->whereHas('kategoriAnggaran', function($q) use ($request) {
                $q->where('kode', $request->kategori);
            });
        }

        $data = $query->get();

        // Format data untuk frontend (ALL 16 FIELDS + BUDGET TRACKING)
        $formattedData = $data->map(function($item) {
            return [
                'id' => $item->id,
                'programDukunganManajemen' => $item->program_dukungan_manajemen,
                'kodeProgram' => $item->kode_program,
                'layananUmum' => $item->layanan_umum,
                'kodeLayanan1' => $item->kode_layanan_1,
                'kodeLayanan2' => $item->kode_layanan_2,
                'layananTataUsaha' => $item->layanan_tata_usaha,
                'kategoriAnggaran' => $item->kategoriAnggaran->kode,
                'codeRka' => $item->code_rka,
                'layanan' => $item->layanan,
                'wilayah' => $item->wilayah,
                'artiKode' => $item->arti_kode,
                'sisaPemakaianAnggaran' => is_numeric($item->sisa_pemakaian_anggaran) ? (int)$item->sisa_pemakaian_anggaran : $item->sisa_pemakaian_anggaran,
                'status' => $item->status,
                'anggaranPerjalanan' => $item->anggaran_perjalanan,
                'anggaranLayanan' => $item->anggaran_layanan,
                'anggaranLayananUsed' => (float)($item->anggaran_layanan_used ?? 0),
                'anggaranLayananAvailable' => $item->anggaran_layanan_available, // This uses accessor
                'sbm' => $item->sbm,
            ];
        });

        return response()->json($formattedData);
    }

    public function importExcel(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'excel_file' => 'required|mimes:xlsx,xls,csv|max:10240', // max 10MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('excel_file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $data = $worksheet->toArray();

            $importedCount = 0;
            $errors = [];

            // Skip header row (assumed first row is header)
            for ($i = 1; $i < count($data); $i++) {
                try {
                    $row = $data[$i];

                    // Skip empty rows
                    if (empty(array_filter($row))) {
                        continue;
                    }

                    // Map columns (Excel 16 columns yang Anda upload) - FIXED VERSION
                    $programDukunganManajemen = trim($row[0] ?? '');
                    $kodeProgram = trim($row[1] ?? '');
                    $layananUmum = trim($row[2] ?? '');
                    $kodeLayanan1 = trim($row[3] ?? '');
                    $kodeLayanan2 = trim($row[4] ?? '');
                    $layananTataUsaha = trim($row[5] ?? '');
                    $kategoriKode = trim($row[6] ?? '');
                    $codeRka = trim($row[7] ?? '');
                    $layanan = trim($row[8] ?? '');
                    $wilayah = trim($row[9] ?? '');          // Column 10: Wilayah
                    $artiKode = trim($row[10] ?? '');        // Column 11: Arti Kode
                    $sisaPemakaianAnggaran = trim($row[11] ?? 0); // Column 12: Sisa Pemakaian Anggaran
                    $status = trim($row[12] ?? 'Active');    // Column 13: Status
                    $anggaranPerjalanan = trim($row[13] ?? 0);   // Column 14: Anggaran Perjalanan
                    $anggaranLayanan = trim($row[14] ?? 0);      // Column 15: Anggaran Layanan
                    $sbm = trim($row[15] ?? '');              // Column 16: SBM

                    // Debug logging untuk troubleshooting
                    \Log::info('Excel Row Data:', [
                        'row_9_wilayah' => $wilayah,
                        'row_9_raw' => $row[9],
                        'row_9_type' => gettype($row[9]),
                        'row_9_length' => strlen($wilayah),
                        'row_10_arti_kode' => $artiKode,
                        'row_11_sisa' => $sisaPemakaianAnggaran,
                        'row_12_status' => $status,
                        'row_13_anggaran' => $anggaranPerjalanan
                    ]);

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

                    // Convert A/B/C to KA/KB/KC, jika sudah KA/KB/KC tetap pakai
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
                    }

                    $importedCount++;

                } catch (\Exception $e) {
                    $errors[] = "Row " . ($i + 1) . ": " . $e->getMessage();
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Data berhasil diimport! {$importedCount} data diproses.",
                'imported_count' => $importedCount,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    private function cleanNumericValue($value)
    {
        // Remove formatting like "Rp", ".", ",", and convert to float
        $cleaned = str_replace(['Rp', '.', ','], ['', '', '.'], $value);
        return floatval($cleaned);
    }

    public function getKategoriList()
    {
        $kategori = KategoriAnggaran::all();
        return response()->json($kategori);
    }
}
