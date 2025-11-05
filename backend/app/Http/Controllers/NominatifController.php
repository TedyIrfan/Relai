<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Nominatif;
use App\Models\RkaDetail;
use App\Models\TransportasiNominatif;
use App\Models\TambahanOrangNominatif;

class NominatifController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Nominatif::with(['rkaDetail', 'user'])
            ->byUser(Auth::id());

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $nominatifs = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $nominatifs,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'rka_detail_id' => 'required|exists:rka_details,id',
            'deskripsi_perjalanan_dinas' => 'required|string',
            'jumlah_hari' => 'required|integer|min:1',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'rute_perjalanan' => 'array',
            'transport_data' => 'array',  // ← Updated validation
            'penginapan' => 'array',
            'uang_harian' => 'array',
            'uang_representasi' => 'array',
            'tambahan_orang' => 'array',
        ]);

        try {
            DB::beginTransaction();

            // DEBUG: Log yang diterima backend
            \Log::info('🔍 Nominatif Store DEBUG:');
            \Log::info('  - validated:', $validated);
            \Log::info('  - transport_data:', $validated['transport_data'] ?? 'NOT_SET');

            // Get RKA Detail and check availability
            $rkaDetail = RkaDetail::findOrFail($validated['rka_detail_id']);

            // Calculate total pagu from request data
            $totalPagu = $this->calculateTotalPagu($validated);

            // Check if anggaran available
            if ($totalPagu > $rkaDetail->anggaran_layanan_available) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anggaran tidak mencukupi. Tersedia: ' .
                               number_format($rkaDetail->anggaran_layanan_available, 0, ',', '.'),
                ], 400);
            }

            // Create nominatif
            $nominatif = Nominatif::create([
                'rka_detail_id' => $validated['rka_detail_id'],
                'user_id' => Auth::id(),
                'deskripsi_perjalanan_dinas' => $validated['deskripsi_perjalanan_dinas'],
                'jumlah_hari' => $validated['jumlah_hari'],
                'tanggal_mulai' => $validated['tanggal_mulai'],
                'tanggal_selesai' => $validated['tanggal_selesai'],
                'status' => 'draft',
                'is_editable' => true,
                'rute_perjalanan' => $validated['rute_perjalanan'] ?? [],
                'transportasi_per_hari' => $validated['transport_data'] ?? [],
                'penginapan' => $validated['penginapan'] ?? [],
                'uang_harian' => $validated['uang_harian'] ?? [],
                'uang_representasi' => $validated['uang_representasi'] ?? [],
            ]);

            // DEBUG: Log transport data section
            \Log::info('🔍 Transport Data Section DEBUG:');
            \Log::info('  - isset(transportasi_data): ' . (isset($validated['transportasi_data']) ? 'YES' : 'NO'));
            \Log::info('  - isset(transport_data): ' . (isset($validated['transport_data']) ? 'YES' : 'NO'));
            \Log::info('  - validated keys:', array_keys($validated));

            // Save transportasi data ke table terpisah
            $transportField = isset($validated['transport_data']) ? 'transport_data' : 'transportasi_data';
            if (isset($validated[$transportField]) && is_array($validated[$transportField])) {
                \Log::info('📝 Transport data found, count: ' . count($validated[$transportField]));
                \Log::info('📝 Transport data content:', $validated[$transportField]);

                foreach ($validated[$transportField] as $index => $transport) {
                    \Log::info("🚗 Creating transport record #{$index}: ", $transport);

                    $transportRecord = TransportasiNominatif::create([
                        'nominatif_id' => $nominatif->id,
                        'hari' => $transport['hari'],
                        'arah' => $transport['arah'], // 'pergi' atau 'pulang'
                        'jenis_transportasi' => $transport['jenis_transportasi'] ?? null,
                        'pagu' => $transport['pagu'] ?? 0,
                        'biaya_aktual' => $transport['biaya_aktual'] ?? 0,
                        'anggaran_realisasi' => ($transport['pagu'] ?? 0) - ($transport['biaya_aktual'] ?? 0),
                        'keterangan' => $transport['keterangan'] ?? null,
                    ]);

                    \Log::info("✅ Transport record created with ID: {$transportRecord->id}");
                }
            } else {
                \Log::info('❌ No transport data found to save');
            }

            // Save tambahan orang data
            if (isset($validated['tambahan_orang']) && is_array($validated['tambahan_orang'])) {
                \Log::info('👥 Tambahan orang found, count: ' . count($validated['tambahan_orang']));

                foreach ($validated['tambahan_orang'] as $index => $orang) {
                    \Log::info("👤 Creating tambahan orang record #{$index}: ", $orang);

                    $tambahanOrangRecord = TambahanOrangNominatif::create([
                        'nominatif_id' => $nominatif->id,
                        'nama_peserta' => $orang['nama_peserta'],
                        'jabatan_peserta' => $orang['jabatan_peserta'],
                        'pagu' => $orang['pagu'] ?? 0,
                        'aktual' => $orang['aktual'] ?? 0,
                        // Detail Perjalanan fields
                        'jumlah_hari' => $orang['jumlah_hari'] ?? 0,
                        'tanggal_mulai' => $orang['tanggal_mulai'] ?? null,
                        'tanggal_selesai' => $orang['tanggal_selesai'] ?? null,
                        'rute_perjalanan' => $orang['rute_perjalanan'] ?? [],
                        // Transportasi fields
                        'transportasi_per_hari' => $orang['transportasi_per_hari'] ?? [],
                        // Penginapan fields
                        'menginap' => $orang['menginap'] ?? false,
                        'jumlah_malam' => $orang['jumlah_malam'] ?? 1,
                        'pagu_per_malam' => $orang['pagu_per_malam'] ?? 0,
                        'biaya_aktual_per_malam' => $orang['biaya_aktual_per_malam'] ?? 0,
                        'penginapan_total' => $orang['penginapan_total'] ?? 0,
                        'penginapan_anggaran_realisasi' => $orang['penginapan_anggaran_realisasi'] ?? 0,
                        // Uang Harian fields
                        'uang_harian_jumlah_hari' => $orang['uang_harian_jumlah_hari'] ?? 0,
                        'uang_harian_pagu_per_hari' => $orang['uang_harian_pagu_per_hari'] ?? 0,
                        'uang_harian_total' => $orang['uang_harian_total'] ?? 0,
                        // Uang Representasi fields
                        'uang_representasi_jumlah_hari' => $orang['uang_representasi_jumlah_hari'] ?? 0,
                        'uang_representasi_pagu_per_hari' => $orang['uang_representasi_pagu_per_hari'] ?? 0,
                        'uang_representasi_total' => $orang['uang_representasi_total'] ?? 0,
                    ]);

                    \Log::info("✅ Tambahan orang record created with ID: {$tambahanOrangRecord->id}");
                }
            } else {
                \Log::info('ℹ️ No tambahan orang data found');
            }

            // Calculate totals from the actual form data AFTER saving all related data
            $nominatif->calculateTotals();

            // 🔄 SYNC TO MASTER RKA - Add anggaran berjalan
            \Log::info('🔄 SYNC TO MASTER RKA:');
            \Log::info('  - RKA Detail ID: ' . $rkaDetail->id);
            \Log::info('  - Total Pagu: ' . $totalPagu);
            \Log::info('  - Before - RKA anggaran_berjalan: ' . $rkaDetail->anggaran_berjalan);
            \Log::info('  - Before - RKA anggaran_sp2d: ' . $rkaDetail->anggaran_sp2d);

            // Add to anggaran berjalan in Master RKA
            $rkaDetail->addAnggaranBerjalan($totalPagu);

            \Log::info('✅ AFTER SYNC TO MASTER RKA:');
            \Log::info('  - After - RKA anggaran_berjalan: ' . $rkaDetail->fresh()->anggaran_berjalan);
            \Log::info('  - After - RKA anggaran_sp2d: ' . $rkaDetail->fresh()->anggaran_sp2d);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Nominatif berhasil dibuat',
                'data' => $nominatif->load(['rkaDetail', 'user']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat nominatif: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $nominatif = Nominatif::with(['rkaDetail', 'user', 'transportasi', 'tambahanOrang'])
            ->byUser(Auth::id())
            ->findOrFail($id);

        // Group transportasi by hari and type for frontend compatibility
        $transportasiByHari = [];
        foreach ($nominatif->transportasi as $transport) {
            $day = $transport->hari;

            if (!isset($transportasiByHari[$day])) {
                $transportasiByHari[$day] = [
                    'hari' => $day,
                    'jenisBerangkat' => '',
                    'paguTransportasiBerangkat' => 0,
                    'biayaAktualTransportasiBerangkat' => 0,
                    'paguTaksiBerangkat' => 0,
                    'biayaAktualTaksiBerangkat' => 0,
                    'jenisPulang' => '',
                    'paguTransportasiPulang' => 0,
                    'biayaAktualTransportasiPulang' => 0,
                    'paguTaksiPulang' => 0,
                    'biayaAktualTaksiPulang' => 0,
                    'totalHari' => 0,
                    'anggaranRealisasiBerangkat' => 0,
                    'anggaranRealisasiPulang' => 0,
                ];
            }

            if ($transport->arah === 'pergi') {
                if (strtolower($transport->jenis_transportasi) === 'taksi') {
                    $transportasiByHari[$day]['paguTaksiBerangkat'] = (float)($transport->pagu ?? 0);
                    $transportasiByHari[$day]['biayaAktualTaksiBerangkat'] = (float)($transport->biaya_aktual ?? 0);
                } else {
                    $transportasiByHari[$day]['jenisBerangkat'] = $transport->jenis_transportasi ?? '';
                    $transportasiByHari[$day]['paguTransportasiBerangkat'] = (float)($transport->pagu ?? 0);
                    $transportasiByHari[$day]['biayaAktualTransportasiBerangkat'] = (float)($transport->biaya_aktual ?? 0);
                }

                $anggaranRealisasiBerangkat = ($transportasiByHari[$day]['paguTransportasiBerangkat'] + $transportasiByHari[$day]['paguTaksiBerangkat']) -
                    ($transportasiByHari[$day]['biayaAktualTransportasiBerangkat'] + $transportasiByHari[$day]['biayaAktualTaksiBerangkat']);
                $transportasiByHari[$day]['anggaranRealisasiBerangkat'] = $anggaranRealisasiBerangkat;

            } elseif ($transport->arah === 'pulang') {
                if (strtolower($transport->jenis_transportasi) === 'taksi') {
                    $transportasiByHari[$day]['paguTaksiPulang'] = (float)($transport->pagu ?? 0);
                    $transportasiByHari[$day]['biayaAktualTaksiPulang'] = (float)($transport->biaya_aktual ?? 0);
                } else {
                    $transportasiByHari[$day]['jenisPulang'] = $transport->jenis_transportasi ?? '';
                    $transportasiByHari[$day]['paguTransportasiPulang'] = (float)($transport->pagu ?? 0);
                    $transportasiByHari[$day]['biayaAktualTransportasiPulang'] = (float)($transport->biaya_aktual ?? 0);
                }

                $anggaranRealisasiPulang = ($transportasiByHari[$day]['paguTransportasiPulang'] + $transportasiByHari[$day]['paguTaksiPulang']) -
                    ($transportasiByHari[$day]['biayaAktualTransportasiPulang'] + $transportasiByHari[$day]['biayaAktualTaksiPulang']);
                $transportasiByHari[$day]['anggaranRealisasiPulang'] = $anggaranRealisasiPulang;
            }

            $transportasiByHari[$day]['totalHari'] =
                $transportasiByHari[$day]['anggaranRealisasiBerangkat'] +
                $transportasiByHari[$day]['anggaranRealisasiPulang'];
        }

        // Convert to array for JSON response
        $nominatif->transportasi_per_hari = array_values($transportasiByHari);

        // Debug: Log tambahan orang data
        \Log::info('🔍 DEBUG show() - tambahanOrang count: ' . $nominatif->tambahanOrang->count());
        if ($nominatif->tambahanOrang->count() > 0) {
            foreach ($nominatif->tambahanOrang as $index => $orang) {
                \Log::info("👤 Tambahan Orang #{$index}: " . json_encode($orang));
            }
        }

        // Ensure tambahan orang is included in response
        $response = $nominatif->toArray();
        $response['tambahan_orang'] = $nominatif->tambahanOrang->toArray();

        return response()->json([
            'success' => true,
            'data' => $response,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $nominatif = Nominatif::byUser(Auth::id())->findOrFail($id);

        if (!$nominatif->canEdit()) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak dapat diedit',
            ], 403);
        }

        $validated = $request->validate([
            'deskripsi_perjalanan_dinas' => 'sometimes|string',
            'rute_perjalanan' => 'sometimes|array',
            'transport_data' => 'sometimes|array',
            'transportasi_per_hari' => 'sometimes|array', // for compatibility
            'penginapan' => 'sometimes|array',
            'uang_harian' => 'sometimes|array',
            'uang_representasi' => 'sometimes|array',
            'tambahan_orang' => 'sometimes|array',
        ]);

        try {
            DB::beginTransaction();

            // Calculate differences
            $oldTotalPagu = $nominatif->total_pagu;
            $newTotalPagu = $this->calculateTotalPagu(array_merge($nominatif->toArray(), $validated));
            $difference = $newTotalPagu - $oldTotalPagu;

            // Check RKA availability for additional pagu
            if ($difference > 0) {
                $rkaDetail = $nominatif->rkaDetail;
                if ($difference > $rkaDetail->anggaran_layanan_available) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Anggaran tambahan tidak mencukupup. Dibutuhkan: ' .
                                   number_format($difference, 0, ',', '.'),
                    ], 400);
                }

                // Update RKA with additional amount
                $rkaDetail->updateAnggaranUsed($difference);
            } elseif ($difference < 0) {
                // Return some anggaran to RKA
                $rkaDetail = $nominatif->rkaDetail;
                $rkaDetail->updateAnggaranUsed($difference); // negative amount will reduce used
            }

            // 🔄 SYNC TO MASTER RKA - Adjust anggaran berjalan
            \Log::info('🔄 UPDATE SYNC TO MASTER RKA:');
            \Log::info('  - RKA Detail ID: ' . $rkaDetail->id);
            \Log::info('  - Old Total Pagu: ' . $oldTotalPagu);
            \Log::info('  - New Total Pagu: ' . $newTotalPagu);
            \Log::info('  - Difference: ' . $difference);
            \Log::info('  - Before - RKA anggaran_berjalan: ' . $rkaDetail->anggaran_berjalan);

            // Sync the change to Master RKA
            if ($difference > 0) {
                // Add additional amount to anggaran berjalan
                $rkaDetail->addAnggaranBerjalan($difference);
            } elseif ($difference < 0) {
                // Reduce anggaran berjalan
                $rkaDetail->reduceAnggaranBerjalan(abs($difference));
            }

            \Log::info('✅ AFTER UPDATE SYNC TO MASTER RKA:');
            \Log::info('  - After - RKA anggaran_berjalan: ' . $rkaDetail->fresh()->anggaran_berjalan);

            // Update nominatif
            $nominatif->update($validated);

            // Update transportasi data if provided
            $transportField = isset($validated['transport_data']) ? 'transport_data' : 'transportasi_per_hari';
            if (isset($validated[$transportField]) && is_array($validated[$transportField])) {
                // Delete existing transport records
                $nominatif->transportasi()->delete();

                // Create new transport records
                foreach ($validated[$transportField] as $transport) {
                    TransportasiNominatif::create([
                        'nominatif_id' => $nominatif->id,
                        'hari' => $transport['hari'],
                        'arah' => $transport['arah'],
                        'jenis_transportasi' => $transport['jenis_transportasi'] ?? null,
                        'pagu' => $transport['pagu'] ?? 0,
                        'biaya_aktual' => $transport['biaya_aktual'] ?? 0,
                        'anggaran_realisasi' => ($transport['pagu'] ?? 0) - ($transport['biaya_aktual'] ?? 0),
                        'keterangan' => $transport['keterangan'] ?? null,
                    ]);
                }
            }

            // Update tambahan orang data if provided
            if (isset($validated['tambahan_orang']) && is_array($validated['tambahan_orang'])) {
                \Log::info('👥 Updating tambahan orang, count: ' . count($validated['tambahan_orang']));

                // Delete existing tambahan orang records
                $nominatif->tambahanOrang()->delete();

                // Create new tambahan orang records
                foreach ($validated['tambahan_orang'] as $index => $orang) {
                    \Log::info("👤 Creating tambahan orang record #{$index}: ", $orang);

                    $tambahanOrangRecord = TambahanOrangNominatif::create([
                        'nominatif_id' => $nominatif->id,
                        'nama_peserta' => $orang['nama_peserta'],
                        'jabatan_peserta' => $orang['jabatan_peserta'],
                        'pagu' => $orang['pagu'] ?? 0,
                        'aktual' => $orang['aktual'] ?? 0,
                        // Detail Perjalanan fields
                        'jumlah_hari' => $orang['jumlah_hari'] ?? 0,
                        'tanggal_mulai' => $orang['tanggal_mulai'] ?? null,
                        'tanggal_selesai' => $orang['tanggal_selesai'] ?? null,
                        'rute_perjalanan' => $orang['rute_perjalanan'] ?? [],
                        // Transportasi fields
                        'transportasi_per_hari' => $orang['transportasi_per_hari'] ?? [],
                        // Penginapan fields
                        'menginap' => $orang['menginap'] ?? false,
                        'jumlah_malam' => $orang['jumlah_malam'] ?? 1,
                        'pagu_per_malam' => $orang['pagu_per_malam'] ?? 0,
                        'biaya_aktual_per_malam' => $orang['biaya_aktual_per_malam'] ?? 0,
                        'penginapan_total' => $orang['penginapan_total'] ?? 0,
                        'penginapan_anggaran_realisasi' => $orang['penginapan_anggaran_realisasi'] ?? 0,
                        // Uang Harian fields
                        'uang_harian_jumlah_hari' => $orang['uang_harian_jumlah_hari'] ?? 0,
                        'uang_harian_pagu_per_hari' => $orang['uang_harian_pagu_per_hari'] ?? 0,
                        'uang_harian_total' => $orang['uang_harian_total'] ?? 0,
                        // Uang Representasi fields
                        'uang_representasi_jumlah_hari' => $orang['uang_representasi_jumlah_hari'] ?? 0,
                        'uang_representasi_pagu_per_hari' => $orang['uang_representasi_pagu_per_hari'] ?? 0,
                        'uang_representasi_total' => $orang['uang_representasi_total'] ?? 0,
                    ]);

                    \Log::info("✅ Tambahan orang record created with ID: {$tambahanOrangRecord->id}");
                }
            } else {
                \Log::info('ℹ️ No tambahan orang data found in update');
            }

            $nominatif->calculateTotals();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Nominatif berhasil diupdate',
                'data' => $nominatif->load(['rkaDetail', 'user']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal update nominatif: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Submit nominatif (change status to submitted)
     */
    public function submit(string $id)
    {
        $nominatif = Nominatif::byUser(Auth::id())->findOrFail($id);

        if (!$nominatif->canEdit()) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak dapat disubmit',
            ], 403);
        }

        try {
            DB::beginTransaction();

            // 🔄 SUBMIT NOMINATIF - Master RKA Budget Movement Logic
            $rkaDetail = $nominatif->rkaDetail;
            $totalPagu = $nominatif->total_pagu;  // 700k
            $anggaranBerjalan = $nominatif->anggaran_berjalan;  // 400k

            \Log::info('🔄 SUBMIT NOMINATIF - Master RKA Budget Movement:');
            \Log::info('  - Nominatif ID: ' . $nominatif->id);
            \Log::info('  - Total Pagu: ' . number_format($totalPagu, 0, ',', '.'));
            \Log::info('  - Anggaran Berjalan: ' . number_format($anggaranBerjalan, 0, ',', '.'));
            \Log::info('  - RKA Detail ID: ' . $rkaDetail->id);
            \Log::info('  - Before - RKA anggaran_berjalan: ' . number_format($rkaDetail->anggaran_berjalan, 0, ',', '.'));
            \Log::info('  - Before - RKA anggaran_sp2d: ' . number_format($rkaDetail->anggaran_sp2d, 0, ',', '.'));

            // 1. Kurangi total pagu dari anggaran berjalan (700k hilang)
            $rkaDetail->reduceAnggaranBerjalan($totalPagu);
            \Log::info('  - After reduce total pagu - RKA anggaran_berjalan: ' . number_format($rkaDetail->fresh()->anggaran_berjalan, 0, ',', '.'));

            // 2. Tambah anggaran berjalan ke SP2D (400k pindah)
            $rkaDetail->anggaran_sp2d += $anggaranBerjalan;
            $rkaDetail->save();
            \Log::info('  - After add to SP2D - RKA anggaran_sp2d: ' . number_format($rkaDetail->fresh()->anggaran_sp2d, 0, ',', '.'));
            \Log::info('  - Final RKA anggaran_tersisa: ' . number_format($rkaDetail->fresh()->anggaran_tersisa, 0, ',', '.'));

            // Submit nominatif (move anggaran_berjalan to anggaran_sp2d in nominatif itself)
            $nominatif->submit();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Nominatif berhasil disubmit',
                'data' => $nominatif->load(['rkaDetail', 'user']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal submit nominatif: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $nominatif = Nominatif::byUser(Auth::id())->findOrFail($id);

        if ($nominatif->status === 'submitted') {
            return response()->json([
                'success' => false,
                'message' => 'Data yang sudah disubmit tidak dapat dihapus',
            ], 403);
        }

        try {
            DB::beginTransaction();

            // 🔄 SYNC TO MASTER RKA - Remove anggaran berjalan
            $rkaDetail = $nominatif->rkaDetail;
            \Log::info('🔄 DELETE SYNC TO MASTER RKA:');
            \Log::info('  - RKA Detail ID: ' . $rkaDetail->id);
            \Log::info('  - Nominatif Total Pagu: ' . $nominatif->total_pagu);
            \Log::info('  - Before - RKA anggaran_berjalan: ' . $rkaDetail->anggaran_berjalan);

            // Remove from anggaran berjalan in Master RKA
            $rkaDetail->reduceAnggaranBerjalan($nominatif->total_pagu);

            \Log::info('✅ AFTER DELETE SYNC TO MASTER RKA:');
            \Log::info('  - After - RKA anggaran_berjalan: ' . $rkaDetail->fresh()->anggaran_berjalan);

            // Return anggaran to RKA (legacy logic - keep for compatibility)
            $rkaDetail->updateAnggaranUsed(-$nominatif->total_pagu);

            // Delete nominatif
            $nominatif->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Nominatif berhasil dihapus',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus nominatif: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate total pagu from request data
     */
    private function calculateTotalPagu($data)
    {
        $total = 0;

        // Transportasi - handle both old and new format
        $transportField = isset($data['transport_data']) ? 'transport_data' : 'transportasi_per_hari';
        if (isset($data[$transportField])) {
            foreach ($data[$transportField] as $transport) {
                // New format: transport_data with individual records
                if ($transportField === 'transport_data') {
                    $total += $transport['pagu'] ?? 0;
                } else {
                    // Old format: transportasi_per_hari with grouped data
                    $total += ($transport['paguTransportasiBerangkat'] ?? 0) + ($transport['paguTaksiBerangkat'] ?? 0) +
                             ($transport['paguTransportasiPulang'] ?? 0) + ($transport['paguTaksiPulang'] ?? 0);
                }
            }
        }

        // Penginapan
        if (isset($data['penginapan']) && $data['penginapan']['menginap']) {
            $total += ($data['penginapan']['jumlahMalam'] ?? 1) * ($data['penginapan']['paguPerMalam'] ?? 0);
        }

        // Uang harian
        if (isset($data['uang_harian'])) {
            $total += ($data['uang_harian']['jumlahHari'] ?? 1) * ($data['uang_harian']['paguPerHari'] ?? 0);
        }

        // Uang representasi
        if (isset($data['uang_representasi'])) {
            $total += ($data['uang_representasi']['jumlahHari'] ?? 1) * ($data['uang_representasi']['paguPerHari'] ?? 0);
        }

        // Tambahan orang
        if (isset($data['tambahan_orang']) && is_array($data['tambahan_orang'])) {
            foreach ($data['tambahan_orang'] as $orang) {
                $total += $orang['pagu'] ?? 0;
            }
        }

        \Log::info('💰 calculateTotalPagu DEBUG:');
        \Log::info('  - Transport field: ' . $transportField);
        \Log::info('  - Transport data count: ' . (isset($data[$transportField]) ? count($data[$transportField]) : 0));
        \Log::info('  - Penginapan: ' . ($data['penginapan']['menginap'] ?? false));
        \Log::info('  - Uang harian total: ' . (($data['uang_harian']['jumlahHari'] ?? 1) * ($data['uang_harian']['paguPerHari'] ?? 0)));
        \Log::info('  - Uang representasi total: ' . (($data['uang_representasi']['jumlahHari'] ?? 1) * ($data['uang_representasi']['paguPerHari'] ?? 0)));
        \Log::info('  - FINAL TOTAL PAGU: ' . $total);

        return $total;
    }

    /**
     * Delete all tambahan orang for a nominatif
     */
    public function deleteTambahanOrang(string $id)
    {
        try {
            DB::beginTransaction();

            $nominatif = Nominatif::byUser(Auth::id())->findOrFail($id);

            if ($nominatif->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya bisa menghapus tambahan orang pada status draft',
                ], 400);
            }

            // Calculate total pagu from tambahan orang to return to RKA
            $totalPaguTambahanOrang = $nominatif->tambahanOrang()->sum('pagu');

            // Delete all tambahan orang
            $deletedCount = $nominatif->tambahanOrang()->delete();

            // Return budget to RKA
            if ($totalPaguTambahanOrang > 0) {
                $rkaDetail = $nominatif->rkaDetail;
                $rkaDetail->reduceAnggaranBerjalan($totalPaguTambahanOrang);
            }

            // Recalculate nominatif totals
            $nominatif->calculateTotals();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Berhasil menghapus {$deletedCount} tambahan orang",
                'deleted_count' => $deletedCount,
                'budget_returned' => $totalPaguTambahanOrang,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus tambahan orang: ' . $e->getMessage(),
            ], 500);
        }
    }
}
