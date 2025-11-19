<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\NominatifNew;
use App\Models\NominatifDetailRow;
use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;
use Carbon\Carbon;

class NominatifDetailRowController extends Controller
{
    public function __construct()
    {
        // Remove auth middleware since we use manual token validation
    }

    /**
     * Manually validate Sanctum token and get authenticated user
     */
    private function getAuthenticatedUser(Request $request)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return null;
        }

        // Find the token in the personal_access_tokens table
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            return null;
        }

        // Get the user associated with this token
        return $accessToken->tokenable;
    }

    /**
     * Display a listing of detail rows for a nominatif.
     */
    public function index($nominatifId)
    {
        // DISABLED: Check if user owns the nominatif - temporarily disabled for testing
        // $nominatif = NominatifNew::where('id', $nominatifId)
        //     ->where('user_id', $this->getAuthenticatedUser(app('request'))?->id)
        //     ->firstOrFail();

        $detailRows = NominatifDetailRow::with(['biayaRow', 'evidence'])
            ->where('nominatif_id', $nominatifId)
            ->orderBy('row_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $detailRows
        ]);
    }

    /**
     * Store a newly created detail row in storage.
     */
    public function store(Request $request, $nominatifId)
    {
        $request->validate([
            'person_type' => 'required|in:main,tambahan',
            'person_name' => 'required|string|max:255',
            'asal' => 'required|string|max:100',
            'tujuan' => 'required|string|max:100',
            'tanggal_pergi' => 'required|date',
            'tanggal_sampai' => 'required|date|after_or_equal:tanggal_pergi',
            'golongan' => 'nullable|string|max:10',
            'jabatan' => 'nullable|string|max:255',
            'eselon' => 'nullable|string|max:10',
            'nama' => 'required|string|max:255',
        ]);

        // Check if user owns the nominatif
        $nominatif = NominatifNew::where('id', $nominatifId)
            ->where('user_id', $this->getAuthenticatedUser(app('request'))?->id)
            ->firstOrFail();

        // Check if nominatif is still editable
        if ($nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot add rows to submitted nominatif'
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Get the next row order
            $maxRowOrder = NominatifDetailRow::where('nominatif_id', $nominatifId)
                ->max('row_order') ?? 0;

            $detailRow = NominatifDetailRow::create([
                'nominatif_id' => $nominatifId,
                'person_type' => $request->person_type,
                'person_name' => $request->person_name,
                'row_order' => $maxRowOrder + 1,
                'asal' => $request->asal,
                'tujuan' => $request->tujuan,
                'tanggal_pergi' => $request->tanggal_pergi,
                'tanggal_sampai' => $request->tanggal_sampai,
                'no' => $maxRowOrder + 1,
                'golongan' => $request->golongan,
                'jabatan' => $request->jabatan,
                'eselon' => $request->eselon,
                'nama' => $request->nama,
            ]);

            // Create corresponding biaya row with default values including totals
            $biayaData = [
                // Transport fields (matches database schema)
                'transport_pesawat_non_pp_pagu' => 0,
                'transport_pesawat_non_pp_aktual' => 0,
                'transport_taksi_pergi_pagu' => 0,
                'transport_taksi_pergi_aktual' => 0,
                'transport_taksi_pulang_pagu' => 0,
                'transport_taksi_pulang_aktual' => 0,

                // Penginapan source fields (needed for generated columns)
                'penginapan_jumlah_malam' => 0,
                'penginapan_pagu_perhari' => 0,
                'penginapan_aktual_perhari' => 0,

                // Uang Harian Meeting Fullboard source fields (renamed from fullboard)
                'uang_harian_meeting_fullboard_jumlah_hari' => 0,
                'uang_harian_meeting_fullboard_pagu_perhari' => 0,
                'uang_harian_meeting_fullboard_aktual_perhari' => 0,

                // Uang Harian Meeting Fullday source fields
                'uang_harian_meeting_fullday_jumlah_hari' => 0,
                'uang_harian_meeting_fullday_pagu_perhari' => 0,
                'uang_harian_meeting_fullday_aktual_perhari' => 0,

                // Uang Harian Luar Kota source fields
                'uang_harian_luar_kota_jumlah_hari' => 0,
                'uang_harian_luar_kota_pagu_perhari' => 0,
                'uang_harian_luar_kota_aktual_perhari' => 0,

                // Uang Harian Dalam Kota source fields
                'uang_harian_dalam_kota_jumlah_hari' => 0,
                'uang_harian_dalam_kota_pagu_perhari' => 0,
                'uang_harian_dalam_kota_aktual_perhari' => 0,

                // Representasi Luar Kota source fields
                'representasi_luar_kota_jumlah_hari' => 0,
                'representasi_luar_kota_pagu_perhari' => 0,
                'representasi_luar_kota_aktual_perhari' => 0,

                // Representasi Dalam Kota source fields
                'representasi_dalam_kota_jumlah_hari' => 0,
                'representasi_dalam_kota_pagu_perhari' => 0,
                'representasi_dalam_kota_aktual_perhari' => 0,
            ];
            $detailRow->biayaRow()->create($biayaData);

            DB::commit();

            // Update nominatif totals
            $this->updateNominatifTotals($nominatifId);

            return response()->json([
                'success' => true,
                'message' => 'Detail row created successfully',
                'data' => $detailRow->load(['biayaRow', 'evidence'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create detail row',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified detail row.
     */
    public function show($rowId)
    {
        $detailRow = NominatifDetailRow::with(['biayaRow', 'evidence', 'nominatif.user'])
            ->findOrFail($rowId);

        // Security check
        if ($detailRow->nominatif->user_id !== $this->getAuthenticatedUser(request())?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $detailRow
        ]);
    }

    /**
     * Update the specified detail row in storage.
     */
    public function update(Request $request, $rowId)
    {
        $request->validate([
            'person_type' => 'sometimes|in:main,tambahan',
            'person_name' => 'sometimes|string|max:255',
            'asal' => 'sometimes|string|max:100',
            'tujuan' => 'sometimes|string|max:100',
            'tanggal_pergi' => 'sometimes|date',
            'tanggal_sampai' => 'sometimes|date|after_or_equal:tanggal_pergi',
            'golongan' => 'sometimes|string|max:10',
            'jabatan' => 'sometimes|string|max:255',
            'eselon' => 'sometimes|string|max:10',
            'nama' => 'sometimes|string|max:255',
        ]);

        $detailRow = NominatifDetailRow::findOrFail($rowId);

        // Security check
        if ($detailRow->nominatif->user_id !== $this->getAuthenticatedUser(request())?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if nominatif is still editable
        if ($detailRow->nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit rows in submitted nominatif'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $detailRow->update($request->all());

            // Update nominatif totals
            $this->updateNominatifTotals($detailRow->nominatif_id);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Detail row updated successfully',
                'data' => $detailRow->load(['biayaRow', 'evidence'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update detail row',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified detail row from storage.
     */
    public function destroy($rowId)
    {
        $detailRow = NominatifDetailRow::findOrFail($rowId);

        // Security check
        if ($detailRow->nominatif->user_id !== $this->getAuthenticatedUser(request())?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if nominatif is still editable
        if ($detailRow->nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete rows in submitted nominatif'
            ], 422);
        }

        $nominatifId = $detailRow->nominatif_id;

        DB::beginTransaction();
        try {
            $detailRow->delete();

            // Update nominatif totals
            $this->updateNominatifTotals($nominatifId);

            // Reorder remaining rows
            $this->reorderRows($nominatifId);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Detail row deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete detail row',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store multiple detail rows at once.
     */
    public function bulkStore(Request $request, $nominatifId)
    {
        // Manual token validation
        $user = $this->getAuthenticatedUser($request);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Invalid or missing token'
            ], 401);
        }

        $request->validate([
            'rows' => 'required|array|min:1',
            'rows.*.person_type' => 'required|in:main,tambahan',
            'rows.*.person_name' => 'required|string|max:255',
            'rows.*.asal' => 'required|string|max:100',
            'rows.*.tujuan' => 'required|string|max:100',
            'rows.*.tanggal_pergi' => 'required|date',
            'rows.*.tanggal_sampai' => 'required|date|after_or_equal:rows.*.tanggal_pergi',
            'rows.*.nama' => 'required|string|max:255',
        ]);

        // Check if user owns the nominatif
        $nominatif = NominatifNew::where('id', $nominatifId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Check if nominatif is still editable
        if ($nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot add rows to submitted nominatif'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $maxRowOrder = NominatifDetailRow::where('nominatif_id', $nominatifId)
                ->max('row_order') ?? 0;

            $createdRows = [];
            foreach ($request->rows as $index => $rowData) {
                $detailRow = NominatifDetailRow::create([
                    'nominatif_id' => $nominatifId,
                    'person_type' => $rowData['person_type'],
                    'person_name' => $rowData['person_name'],
                    'row_order' => $maxRowOrder + $index + 1,
                    'asal' => $rowData['asal'],
                    'tujuan' => $rowData['tujuan'],
                    'tanggal_pergi' => $rowData['tanggal_pergi'],
                    'tanggal_sampai' => $rowData['tanggal_sampai'],
                    'no' => $maxRowOrder + $index + 1,
                    'golongan' => $rowData['golongan'] ?? null,
                    'jabatan' => $rowData['jabatan'] ?? null,
                    'eselon' => $rowData['eselon'] ?? null,
                    'nama' => $rowData['nama'],
                ]);

                // Create corresponding biaya row with default values including totals
                $biayaData = [
                    // Transport fields (matches database schema)
                    'transport_pesawat_non_pp_pagu' => 0,
                    'transport_pesawat_non_pp_aktual' => 0,
                    'transport_taksi_pergi_pagu' => 0,
                    'transport_taksi_pergi_aktual' => 0,
                    'transport_taksi_pulang_pagu' => 0,
                    'transport_taksi_pulang_aktual' => 0,

                    // Penginapan source fields (needed for generated columns)
                    'penginapan_jumlah_malam' => 0,
                    'penginapan_pagu_perhari' => 0,
                    'penginapan_aktual_perhari' => 0,

                    // Uang Harian Meeting Fullboard source fields (renamed from fullboard)
                    'uang_harian_meeting_fullboard_jumlah_hari' => 0,
                    'uang_harian_meeting_fullboard_pagu_perhari' => 0,
                    'uang_harian_meeting_fullboard_aktual_perhari' => 0,

                    // Uang Harian Meeting Fullday source fields
                    'uang_harian_meeting_fullday_jumlah_hari' => 0,
                    'uang_harian_meeting_fullday_pagu_perhari' => 0,
                    'uang_harian_meeting_fullday_aktual_perhari' => 0,

                    // Uang Harian Luar Kota source fields
                    'uang_harian_luar_kota_jumlah_hari' => 0,
                    'uang_harian_luar_kota_pagu_perhari' => 0,
                    'uang_harian_luar_kota_aktual_perhari' => 0,

                    // Uang Harian Dalam Kota source fields
                    'uang_harian_dalam_kota_jumlah_hari' => 0,
                    'uang_harian_dalam_kota_pagu_perhari' => 0,
                    'uang_harian_dalam_kota_aktual_perhari' => 0,

                    // Representasi Luar Kota source fields
                    'representasi_luar_kota_jumlah_hari' => 0,
                    'representasi_luar_kota_pagu_perhari' => 0,
                    'representasi_luar_kota_aktual_perhari' => 0,

                    // Representasi Dalam Kota source fields
                    'representasi_dalam_kota_jumlah_hari' => 0,
                    'representasi_dalam_kota_pagu_perhari' => 0,
                    'representasi_dalam_kota_aktual_perhari' => 0,
                ];
                $detailRow->biayaRow()->create($biayaData);

                $createdRows[] = $detailRow;
            }

            // Update nominatif totals
            $this->updateNominatifTotals($nominatifId);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Detail rows created successfully',
                'data' => $createdRows
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create detail rows',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update multiple detail rows at once.
     */
    public function bulkUpdate(Request $request, $nominatifId)
    {
        $request->validate([
            'rows' => 'required|array',
            'rows.*.id' => 'required|exists:nominatif_detail_rows,id',
            'rows.*.person_type' => 'sometimes|in:main,tambahan',
            'rows.*.person_name' => 'sometimes|string|max:255',
            'rows.*.asal' => 'sometimes|string|max:100',
            'rows.*.tujuan' => 'sometimes|string|max:100',
            'rows.*.nama' => 'sometimes|string|max:255',
        ]);

        // Check if user owns the nominatif
        $nominatif = NominatifNew::where('id', $nominatifId)
            ->where('user_id', $this->getAuthenticatedUser(app('request'))?->id)
            ->firstOrFail();

        // Check if nominatif is still editable
        if ($nominatif->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit rows in submitted nominatif'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $updatedRows = [];
            foreach ($request->rows as $rowData) {
                // DISABLED: Security check in bulkUpdate - temporarily disabled for testing
                $detailRow = NominatifDetailRow::where('id', $rowData['id'])
                    // ->whereHas('nominatif', function ($query) {
                    //     $query->where('user_id', $this->getAuthenticatedUser(app('request'))?->id);
                    // })
                    ->first();

                if ($detailRow) {
                    $detailRow->update($rowData);
                    $updatedRows[] = $detailRow;
                }
            }

            // Update nominatif totals
            $this->updateNominatifTotals($nominatifId);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Detail rows updated successfully',
                'data' => $updatedRows
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update detail rows',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate detail row data
     */
    public function validate(Request $request)
    {
        $request->validate([
            'person_type' => 'required|in:main,tambahan',
            'person_name' => 'required|string|max:255',
            'asal' => 'required|string|max:100',
            'tujuan' => 'required|string|max:100',
            'tanggal_pergi' => 'required|date',
            'tanggal_sampai' => 'required|date|after_or_equal:tanggal_pergi',
            'nama' => 'required|string|max:255',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Detail row data is valid'
        ]);
    }

    /**
     * Update nominatif totals
     */
    private function updateNominatifTotals($nominatifId)
    {
        $nominatif = NominatifNew::findOrFail($nominatifId);

        $detailRows = $nominatif->detailRows()->with('biayaRow')->get();

        $totalPagu = 0;
        $totalAktual = 0;

        foreach ($detailRows as $row) {
            $totalPagu += $row->biayaRow?->total_pagu_row ?? 0;
            $totalAktual += $row->biayaRow?->total_aktual_row ?? 0;
        }

        $nominatif->update([
            'total_pagu' => $totalPagu,
            'total_biaya_aktual' => $totalAktual,
        ]);
    }

    /**
     * Reorder rows after deletion
     */
    private function reorderRows($nominatifId)
    {
        $rows = NominatifDetailRow::where('nominatif_id', $nominatifId)
            ->orderBy('row_order')
            ->get();

        foreach ($rows as $index => $row) {
            $row->update(['row_order' => $index + 1]);
        }
    }
}