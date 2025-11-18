<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\NominatifDetailRow;
use App\Models\NominatifBiayaRow;

class NominatifBiayaRowController extends Controller
{
    /**
     * Display biaya data for a detail row.
     */
    public function index($detailRowId)
    {
        $detailRow = NominatifDetailRow::findOrFail($detailRowId);

        // Security check
        if ($detailRow->nominatif->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $biayaRow = $detailRow->biayaRow;

        if (!$biayaRow) {
            // Create biaya row if it doesn't exist
            $biayaRow = $detailRow->biayaRow()->create([]);
        }

        return response()->json([
            'success' => true,
            'data' => $biayaRow
        ]);
    }

    /**
     * Store a newly created biaya row in storage.
     */
    public function store(Request $request, $detailRowId)
    {
        $detailRow = NominatifDetailRow::findOrFail($detailRowId);

        // Security check
        if ($detailRow->nominatif->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if nominatif is still editable
        if ($detailRow->nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit biaya in submitted nominatif'
            ], 422);
        }

        $request->validate(NominatifBiayaRow::getValidationRules());

        DB::beginTransaction();
        try {
            $biayaRow = $detailRow->biayaRow()->create($request->all());

            // Update nominatif totals
            $this->updateNominatifTotals($detailRow->nominatif_id);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Biaya row created successfully',
                'data' => $biayaRow
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create biaya row',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified biaya row.
     */
    public function show($biayaId)
    {
        $biayaRow = NominatifBiayaRow::findOrFail($biayaId);

        // Security check
        if ($biayaRow->detailRow->nominatif->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $biayaRow
        ]);
    }

    /**
     * Update the specified biaya row in storage.
     */
    public function update(Request $request, $biayaId)
    {
        $biayaRow = NominatifBiayaRow::findOrFail($biayaId);

        // Security check
        if ($biayaRow->detailRow->nominatif->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if nominatif is still editable
        if ($biayaRow->detailRow->nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit biaya in submitted nominatif'
            ], 422);
        }

        $request->validate([
            // Transportasi fields (sesuai database)
            'transportasi_taksi_pergi_pagu' => 'nullable|numeric|min:0',
            'transportasi_taksi_pergi_aktual' => 'nullable|numeric|min:0',
            'transportasi_pergi_pagu' => 'nullable|numeric|min:0',
            'transportasi_pergi_aktual' => 'nullable|numeric|min:0',
            'transportasi_taksi_pulang_pagu' => 'nullable|numeric|min:0',
            'transportasi_taksi_pulang_aktual' => 'nullable|numeric|min:0',
            'transportasi_pulang_pagu' => 'nullable|numeric|min:0',
            'transportasi_pulang_aktual' => 'nullable|numeric|min:0',

            // Penginapan fields (sesuai database)
            'penginapan_pagu' => 'nullable|numeric|min:0',
            'penginapan_aktual' => 'nullable|numeric|min:0',

            // Uang Harian Meeting Fullboard (sesuai database)
            'uang_harian_meeting_fullboard_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_meeting_fullboard_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_meeting_fullboard_aktual_perhari' => 'nullable|numeric|min:0',

            // Uang Harian Luar Kota (sesuai database)
            'uang_harian_luar_kota_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_luar_kota_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_luar_kota_aktual_perhari' => 'nullable|numeric|min:0',

            // Uang Harian Dalam Kota (sesuai database)
            'uang_harian_dalam_kota_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_dalam_kota_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_dalam_kota_aktual_perhari' => 'nullable|numeric|min:0',

            // Representasi Luar Kota (sesuai database)
            'representasi_luar_kota_jumlah_hari' => 'nullable|integer|min:0',
            'representasi_luar_kota_pagu_perhari' => 'nullable|numeric|min:0',
            'representasi_luar_kota_aktual_perhari' => 'nullable|numeric|min:0',

            // Representasi Dalam Kota (sesuai database)
            'representasi_dalam_kota_jumlah_hari' => 'nullable|integer|min:0',
            'representasi_dalam_kota_pagu_perhari' => 'nullable|numeric|min:0',
            'representasi_dalam_kota_aktual_perhari' => 'nullable|numeric|min:0',

            // Uang Harian Meeting Fullboard (sesuai database)
            'uang_harian_meeting_fullboard_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_meeting_fullboard_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_meeting_fullboard_aktual_perhari' => 'nullable|numeric|min:0',

            // Uang Harian Meeting Fullday (sesuai database)
            'uang_harian_meeting_fullday_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_meeting_fullday_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_meeting_fullday_aktual_perhari' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $biayaRow->update($request->all());

            // Refresh model to get updated values
            $biayaRow->refresh();

            // Calculate and update totals manually (sesuai database fields)
            $totalPagu =
                $biayaRow->transportasi_taksi_pergi_pagu +
                $biayaRow->transportasi_pergi_pagu +
                $biayaRow->transportasi_taksi_pulang_pagu +
                $biayaRow->transportasi_pulang_pagu +
                $biayaRow->penginapan_pagu +
                // Uang Harian Meeting Fullboard (jumlah_hari × pagu_perhari)
                ($biayaRow->uang_harian_meeting_fullboard_jumlah_hari * $biayaRow->uang_harian_meeting_fullboard_pagu_perhari) +
                // Uang Harian Luar Kota (jumlah_hari × pagu_perhari)
                ($biayaRow->uang_harian_luar_kota_jumlah_hari * $biayaRow->uang_harian_luar_kota_pagu_perhari) +
                // Uang Harian Dalam Kota (jumlah_hari × pagu_perhari)
                ($biayaRow->uang_harian_dalam_kota_jumlah_hari * $biayaRow->uang_harian_dalam_kota_pagu_perhari) +
                // Uang Harian Meeting Fullboard (jumlah_hari × pagu_perhari)
                ($biayaRow->uang_harian_meeting_fullboard_jumlah_hari * $biayaRow->uang_harian_meeting_fullboard_pagu_perhari) +
                // Uang Harian Meeting Fullday (jumlah_hari × pagu_perhari)
                ($biayaRow->uang_harian_meeting_fullday_jumlah_hari * $biayaRow->uang_harian_meeting_fullday_pagu_perhari) +
                // Representasi Luar Kota (jumlah_hari × pagu_perhari)
                ($biayaRow->representasi_luar_kota_jumlah_hari * $biayaRow->representasi_luar_kota_pagu_perhari) +
                // Representasi Dalam Kota (jumlah_hari × pagu_perhari)
                ($biayaRow->representasi_dalam_kota_jumlah_hari * $biayaRow->representasi_dalam_kota_pagu_perhari);

            $totalAktual =
                $biayaRow->transportasi_taksi_pergi_aktual +
                $biayaRow->transportasi_pergi_aktual +
                $biayaRow->transportasi_taksi_pulang_aktual +
                $biayaRow->transportasi_pulang_aktual +
                $biayaRow->penginapan_aktual +
                // Uang Harian Meeting Fullboard (jumlah_hari × aktual_perhari)
                ($biayaRow->uang_harian_meeting_fullboard_jumlah_hari * $biayaRow->uang_harian_meeting_fullboard_aktual_perhari) +
                // Uang Harian Luar Kota (jumlah_hari × aktual_perhari)
                ($biayaRow->uang_harian_luar_kota_jumlah_hari * $biayaRow->uang_harian_luar_kota_aktual_perhari) +
                // Uang Harian Dalam Kota (jumlah_hari × aktual_perhari)
                ($biayaRow->uang_harian_dalam_kota_jumlah_hari * $biayaRow->uang_harian_dalam_kota_aktual_perhari) +
                // Uang Harian Meeting Fullboard (jumlah_hari × aktual_perhari)
                ($biayaRow->uang_harian_meeting_fullboard_jumlah_hari * $biayaRow->uang_harian_meeting_fullboard_aktual_perhari) +
                // Uang Harian Meeting Fullday (jumlah_hari × aktual_perhari)
                ($biayaRow->uang_harian_meeting_fullday_jumlah_hari * $biayaRow->uang_harian_meeting_fullday_aktual_perhari) +
                // Representasi Luar Kota (jumlah_hari × aktual_perhari)
                ($biayaRow->representasi_luar_kota_jumlah_hari * $biayaRow->representasi_luar_kota_aktual_perhari) +
                // Representasi Dalam Kota (jumlah_hari × aktual_perhari)
                ($biayaRow->representasi_dalam_kota_jumlah_hari * $biayaRow->representasi_dalam_kota_aktual_perhari);

            $biayaRow->update([
                'total_pagu_row' => $totalPagu,
                'total_aktual_row' => $totalAktual,
            ]);

            // Update nominatif totals
            $this->updateNominatifTotals($biayaRow->detailRow->nominatif_id);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Biaya row updated successfully',
                'data' => $biayaRow
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update biaya row',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified biaya row from storage.
     */
    public function destroy($biayaId)
    {
        $biayaRow = NominatifBiayaRow::findOrFail($biayaId);

        // Security check
        if ($biayaRow->detailRow->nominatif->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if nominatif is still editable
        if ($biayaRow->detailRow->nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete biaya in submitted nominatif'
            ], 422);
        }

        $nominatifId = $biayaRow->detailRow->nominatif_id;

        DB::beginTransaction();
        try {
            $biayaRow->delete();

            // Update nominatif totals
            $this->updateNominatifTotals($nominatifId);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Biaya row deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete biaya row',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate biaya row data
     */
    public function validate(Request $request)
    {
        $request->validate([
            // Transportasi fields (sesuai database)
            'transportasi_taksi_pergi_pagu' => 'nullable|numeric|min:0',
            'transportasi_taksi_pergi_aktual' => 'nullable|numeric|min:0',
            'transportasi_pergi_pagu' => 'nullable|numeric|min:0',
            'transportasi_pergi_aktual' => 'nullable|numeric|min:0',
            'transportasi_taksi_pulang_pagu' => 'nullable|numeric|min:0',
            'transportasi_taksi_pulang_aktual' => 'nullable|numeric|min:0',
            'transportasi_pulang_pagu' => 'nullable|numeric|min:0',
            'transportasi_pulang_aktual' => 'nullable|numeric|min:0',

            // Penginapan fields (sesuai database)
            'penginapan_pagu' => 'nullable|numeric|min:0',
            'penginapan_aktual' => 'nullable|numeric|min:0',

            // Uang Harian Meeting Fullboard (sesuai database)
            'uang_harian_meeting_fullboard_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_meeting_fullboard_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_meeting_fullboard_aktual_perhari' => 'nullable|numeric|min:0',

            // Uang Harian Luar Kota (sesuai database)
            'uang_harian_luar_kota_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_luar_kota_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_luar_kota_aktual_perhari' => 'nullable|numeric|min:0',

            // Uang Harian Dalam Kota (sesuai database)
            'uang_harian_dalam_kota_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_dalam_kota_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_dalam_kota_aktual_perhari' => 'nullable|numeric|min:0',

            // Representasi Luar Kota (sesuai database)
            'representasi_luar_kota_jumlah_hari' => 'nullable|integer|min:0',
            'representasi_luar_kota_pagu_perhari' => 'nullable|numeric|min:0',
            'representasi_luar_kota_aktual_perhari' => 'nullable|numeric|min:0',

            // Representasi Dalam Kota (sesuai database)
            'representasi_dalam_kota_jumlah_hari' => 'nullable|integer|min:0',
            'representasi_dalam_kota_pagu_perhari' => 'nullable|numeric|min:0',
            'representasi_dalam_kota_aktual_perhari' => 'nullable|numeric|min:0',

            // Uang Harian Meeting Fullboard (sesuai database)
            'uang_harian_meeting_fullboard_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_meeting_fullboard_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_meeting_fullboard_aktual_perhari' => 'nullable|numeric|min:0',

            // Uang Harian Meeting Fullday (sesuai database)
            'uang_harian_meeting_fullday_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_meeting_fullday_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_meeting_fullday_aktual_perhari' => 'nullable|numeric|min:0',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Biaya row data is valid'
        ]);
    }

    /**
     * Calculate and update totals for biaya row
     */
    private function calculateAndUpdateTotals($biayaRow)
    {
        // Calculate and update totals manually (sesuai database fields)
        $totalPagu =
            $biayaRow->transportasi_taksi_pergi_pagu +
            $biayaRow->transportasi_pergi_pagu +
            $biayaRow->transportasi_taksi_pulang_pagu +
            $biayaRow->transportasi_pulang_pagu +
            $biayaRow->penginapan_pagu +
            // Uang Harian Fullboard (jumlah_hari × pagu_perhari)
            ($biayaRow->uang_harian_fullboard_jumlah_hari * $biayaRow->uang_harian_fullboard_pagu_perhari) +
            // Uang Harian Luar Kota (jumlah_hari × pagu_perhari)
            ($biayaRow->uang_harian_luar_kota_jumlah_hari * $biayaRow->uang_harian_luar_kota_pagu_perhari) +
            // Uang Harian Dalam Kota (jumlah_hari × pagu_perhari)
            ($biayaRow->uang_harian_dalam_kota_jumlah_hari * $biayaRow->uang_harian_dalam_kota_pagu_perhari) +
            // Uang Harian Meeting Fullboard (jumlah_hari × pagu_perhari)
            ($biayaRow->uang_harian_meeting_fullboard_jumlah_hari * $biayaRow->uang_harian_meeting_fullboard_pagu_perhari) +
            // Uang Harian Meeting Fullday (jumlah_hari × pagu_perhari)
            ($biayaRow->uang_harian_meeting_fullday_jumlah_hari * $biayaRow->uang_harian_meeting_fullday_pagu_perhari) +
            // Representasi Luar Kota (jumlah_hari × pagu_perhari)
            ($biayaRow->representasi_luar_kota_jumlah_hari * $biayaRow->representasi_luar_kota_pagu_perhari) +
            // Representasi Dalam Kota (jumlah_hari × pagu_perhari)
            ($biayaRow->representasi_dalam_kota_jumlah_hari * $biayaRow->representasi_dalam_kota_pagu_perhari);

        $totalAktual =
            $biayaRow->transportasi_taksi_pergi_aktual +
            $biayaRow->transportasi_pergi_aktual +
            $biayaRow->transportasi_taksi_pulang_aktual +
            $biayaRow->transportasi_pulang_aktual +
            $biayaRow->penginapan_aktual +
            // Uang Harian Fullboard (jumlah_hari × aktual_perhari)
            ($biayaRow->uang_harian_fullboard_jumlah_hari * $biayaRow->uang_harian_fullboard_aktual_perhari) +
            // Uang Harian Luar Kota (jumlah_hari × aktual_perhari)
            ($biayaRow->uang_harian_luar_kota_jumlah_hari * $biayaRow->uang_harian_luar_kota_aktual_perhari) +
            // Uang Harian Dalam Kota (jumlah_hari × aktual_perhari)
            ($biayaRow->uang_harian_dalam_kota_jumlah_hari * $biayaRow->uang_harian_dalam_kota_aktual_perhari) +
            // Uang Harian Meeting Fullboard (jumlah_hari × aktual_perhari)
            ($biayaRow->uang_harian_meeting_fullboard_jumlah_hari * $biayaRow->uang_harian_meeting_fullboard_aktual_perhari) +
            // Uang Harian Meeting Fullday (jumlah_hari × aktual_perhari)
            ($biayaRow->uang_harian_meeting_fullday_jumlah_hari * $biayaRow->uang_harian_meeting_fullday_aktual_perhari) +
            // Representasi Luar Kota (jumlah_hari × aktual_perhari)
            ($biayaRow->representasi_luar_kota_jumlah_hari * $biayaRow->representasi_luar_kota_aktual_perhari) +
            // Representasi Dalam Kota (jumlah_hari × aktual_perhari)
            ($biayaRow->representasi_dalam_kota_jumlah_hari * $biayaRow->representasi_dalam_kota_aktual_perhari);

        $biayaRow->update([
            'total_pagu_row' => $totalPagu,
            'total_aktual_row' => $totalAktual,
        ]);
    }

    /**
     * Update nominatif totals
     */
    private function updateNominatifTotals($nominatifId)
    {
        $nominatif = DB::table('nominatifs_new')->where('id', $nominatifId)->first();

        $totalPagu = DB::table('nominatif_detail_rows as dr')
            ->join('nominatif_biaya_rows as br', 'dr.id', '=', 'br.nominatif_detail_row_id')
            ->where('dr.nominatif_id', $nominatifId)
            ->sum('br.total_pagu_row');

        $totalAktual = DB::table('nominatif_detail_rows as dr')
            ->join('nominatif_biaya_rows as br', 'dr.id', '=', 'br.nominatif_detail_row_id')
            ->where('dr.nominatif_id', $nominatifId)
            ->sum('br.total_aktual_row');

        DB::table('nominatifs_new')
            ->where('id', $nominatifId)
            ->update([
                'total_pagu' => $totalPagu,
                'total_biaya_aktual' => $totalAktual,
            ]);
    }
}