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
            'transportasi_taksi_pergi_pagu' => 'nullable|numeric|min:0',
            'transportasi_taksi_pergi_aktual' => 'nullable|numeric|min:0',
            'transportasi_pergi_pagu' => 'nullable|numeric|min:0',
            'transportasi_pergi_aktual' => 'nullable|numeric|min:0',
            'transportasi_taksi_pulang_pagu' => 'nullable|numeric|min:0',
            'transportasi_taksi_pulang_aktual' => 'nullable|numeric|min:0',
            'transportasi_pulang_pagu' => 'nullable|numeric|min:0',
            'transportasi_pulang_aktual' => 'nullable|numeric|min:0',
            'penginapan_pagu' => 'nullable|numeric|min:0',
            'penginapan_aktual' => 'nullable|numeric|min:0',
            'uang_harian_fullboard_pagu' => 'nullable|numeric|min:0',
            'uang_harian_fullboard_aktual' => 'nullable|numeric|min:0',
            'uang_harian_pagu' => 'nullable|numeric|min:0',
            'uang_harian_aktual' => 'nullable|numeric|min:0',
            'uang_representasi_pagu' => 'nullable|numeric|min:0',
            'uang_representasi_aktual' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $biayaRow->update($request->all());

            // Refresh model to get updated values
            $biayaRow->refresh();

            // Calculate and update totals manually
            $totalPagu =
                $biayaRow->transport_taksi_pergi_pagu +
                $biayaRow->transport_pergi_pagu +
                $biayaRow->transport_taksi_pulang_pagu +
                $biayaRow->transport_pulang_pagu +
                $biayaRow->penginapan_pagu +
                $biayaRow->uang_harian_fullboard_pagu +
                $biayaRow->uang_harian_pagu +
                $biayaRow->uang_representasi_pagu;

            $totalAktual =
                $biayaRow->transport_taksi_pergi_aktual +
                $biayaRow->transport_pergi_aktual +
                $biayaRow->transport_taksi_pulang_aktual +
                $biayaRow->transport_pulang_aktual +
                $biayaRow->penginapan_aktual +
                $biayaRow->uang_harian_fullboard_aktual +
                $biayaRow->uang_harian_aktual +
                $biayaRow->uang_representasi_aktual;

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
            'transportasi_taksi_pergi_pagu' => 'nullable|numeric|min:0',
            'transportasi_taksi_pergi_aktual' => 'nullable|numeric|min:0',
            'transportasi_pergi_pagu' => 'nullable|numeric|min:0',
            'transportasi_pergi_aktual' => 'nullable|numeric|min:0',
            'transportasi_taksi_pulang_pagu' => 'nullable|numeric|min:0',
            'transportasi_taksi_pulang_aktual' => 'nullable|numeric|min:0',
            'transportasi_pulang_pagu' => 'nullable|numeric|min:0',
            'transportasi_pulang_aktual' => 'nullable|numeric|min:0',
            'penginapan_pagu' => 'nullable|numeric|min:0',
            'penginapan_aktual' => 'nullable|numeric|min:0',
            'uang_harian_fullboard_pagu' => 'nullable|numeric|min:0',
            'uang_harian_fullboard_aktual' => 'nullable|numeric|min:0',
            'uang_harian_pagu' => 'nullable|numeric|min:0',
            'uang_harian_aktual' => 'nullable|numeric|min:0',
            'uang_representasi_pagu' => 'nullable|numeric|min:0',
            'uang_representasi_aktual' => 'nullable|numeric|min:0',
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
        $totalPagu =
            $biayaRow->transport_taksi_pergi_pagu +
            $biayaRow->transport_pergi_pagu +
            $biayaRow->transport_taksi_pulang_pagu +
            $biayaRow->transport_pulang_pagu +
            $biayaRow->penginapan_pagu +
            $biayaRow->uang_harian_fullboard_pagu +
            $biayaRow->uang_harian_pagu +
            $biayaRow->uang_representasi_pagu;

        $totalAktual =
            $biayaRow->transport_taksi_pergi_aktual +
            $biayaRow->transport_pergi_aktual +
            $biayaRow->transport_taksi_pulang_aktual +
            $biayaRow->transport_pulang_aktual +
            $biayaRow->penginapan_aktual +
            $biayaRow->uang_harian_fullboard_aktual +
            $biayaRow->uang_harian_aktual +
            $biayaRow->uang_representasi_aktual;

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