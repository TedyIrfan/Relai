<?php

namespace App\Http\Controllers;

use App\Models\PenginapanTambahanOrang;
use App\Models\TambahanOrangNominatif;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class PenginapanTambahanOrangController extends Controller
{
    /**
     * Get all penginapan records for a specific tambahan orang.
     */
    public function getByTambahanOrang($tambahanOrangId): JsonResponse
    {
        try {
            // Validate that tambahan orang exists
            $tambahanOrang = TambahanOrangNominatif::findOrFail($tambahanOrangId);

            $penginapan = $tambahanOrang->penginapanTambahanOrang()
                ->orderBy('malam')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $penginapan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data penginapan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created penginapan record in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'tambahan_orang_nominatif_id' => 'required|exists:tambahan_orang_nominatifs,id',
                'malam' => 'required|integer|min:1',
                'lokasi_penginapan' => 'nullable|string|max:100',
                'nama_hotel' => 'nullable|string|max:255',
                'keterangan' => 'nullable|string',
                'tipe_kamar' => 'nullable|string|max:50',
                'nomor_kamar' => 'nullable|string|max:20',
                'kapasitas' => 'integer|min:1|max:10',
                'pagu' => 'numeric|min:0',
                'biaya_aktual' => 'numeric|min:0',
                'dipesan' => 'boolean',
                'tanggal_checkin' => 'nullable|date',
                'tanggal_checkout' => 'nullable|date|after_or_equal:tanggal_checkin',
                'kode_booking' => 'nullable|string|max:50',
            ], [
                'tambahan_orang_nominatif_id.required' => 'ID tambahan orang wajib diisi',
                'tambahan_orang_nominatif_id.exists' => 'Tambahan orang tidak ditemukan',
                'malam.required' => 'Malam ke-berapa wajib diisi',
                'malam.integer' => 'Malam harus berupa angka',
                'malam.min' => 'Malam harus dimulai dari 1',
                'kapasitas.min' => 'Kapasitas minimal 1 orang',
                'kapasitas.max' => 'Kapasitas maksimal 10 orang',
                'pagu.min' => 'Pagu tidak boleh negatif',
                'biaya_aktual.min' => 'Biaya aktual tidak boleh negatif',
                'tanggal_checkout.after_or_equal' => 'Tanggal checkout harus setelah atau sama dengan checkin',
            ]);

            // Check for unique constraint
            $exists = PenginapanTambahanOrang::where('tambahan_orang_nominatif_id', $validated['tambahan_orang_nominatif_id'])
                ->where('malam', $validated['malam'])
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data penginapan untuk malam ke-' . $validated['malam'] . ' sudah ada'
                ], 422);
            }

            // Set default values
            $validated['kapasitas'] = $validated['kapasitas'] ?? 1;
            $validated['pagu'] = $validated['pagu'] ?? 0;
            $validated['biaya_aktual'] = $validated['biaya_aktual'] ?? 0;
            $validated['dipesan'] = $validated['dipesan'] ?? true;

            $penginapan = PenginapanTambahanOrang::create($validated);

            // Update totals in parent record
            $this->updateParentTotals($validated['tambahan_orang_nominatif_id']);

            return response()->json([
                'success' => true,
                'data' => $penginapan->load('tambahanOrang'),
                'message' => 'Data penginapan berhasil disimpan'
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data penginapan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified penginapan record.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $penginapan = PenginapanTambahanOrang::with('tambahanOrang')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $penginapan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data penginapan tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Update the specified penginapan record in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $penginapan = PenginapanTambahanOrang::findOrFail($id);

            $validated = $request->validate([
                'malam' => 'sometimes|required|integer|min:1',
                'lokasi_penginapan' => 'nullable|string|max:100',
                'nama_hotel' => 'nullable|string|max:255',
                'keterangan' => 'nullable|string',
                'tipe_kamar' => 'nullable|string|max:50',
                'nomor_kamar' => 'nullable|string|max:20',
                'kapasitas' => 'sometimes|integer|min:1|max:10',
                'pagu' => 'sometimes|numeric|min:0',
                'biaya_aktual' => 'sometimes|numeric|min:0',
                'dipesan' => 'sometimes|boolean',
                'tanggal_checkin' => 'nullable|date',
                'tanggal_checkout' => 'nullable|date|after_or_equal:tanggal_checkin',
                'kode_booking' => 'nullable|string|max:50',
            ]);

            // Check for unique constraint if malam is being updated
            if (isset($validated['malam']) && $validated['malam'] != $penginapan->malam) {
                $exists = PenginapanTambahanOrang::where('tambahan_orang_nominatif_id', $penginapan->tambahan_orang_nominatif_id)
                    ->where('malam', $validated['malam'])
                    ->exists();

                if ($exists) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Data penginapan untuk malam ke-' . $validated['malam'] . ' sudah ada'
                    ], 422);
                }
            }

            $penginapan->update($validated);

            // Update totals in parent record
            $this->updateParentTotals($penginapan->tambahan_orang_nominatif_id);

            return response()->json([
                'success' => true,
                'data' => $penginapan->load('tambahanOrang'),
                'message' => 'Data penginapan berhasil diupdate'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate data penginapan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified penginapan record from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $penginapan = PenginapanTambahanOrang::findOrFail($id);
            $tambahanOrangId = $penginapan->tambahan_orang_nominatif_id;

            $penginapan->delete();

            // Update totals in parent record
            $this->updateParentTotals($tambahanOrangId);

            return response()->json([
                'success' => true,
                'message' => 'Data penginapan berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data penginapan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update total calculations in parent TambahanOrangNominatif record.
     */
    private function updateParentTotals(int $tambahanOrangId): void
    {
        try {
            $tambahanOrang = TambahanOrangNominatif::findOrFail($tambahanOrangId);
            $tambahanOrang->calculateTotals();
        } catch (\Exception $e) {
            // Log error but don't fail the main operation
            \Log::error('Failed to update parent totals: ' . $e->getMessage());
        }
    }
}
