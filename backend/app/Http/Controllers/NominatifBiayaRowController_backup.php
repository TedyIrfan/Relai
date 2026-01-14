<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\NominatifDetailRow;
use App\Models\NominatifBiayaRow;
use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;

class NominatifBiayaRowController extends Controller
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
     * Display biaya data for a detail row.
     */
    public function index($detailRowId)
    {
        $detailRow = NominatifDetailRow::findOrFail($detailRowId);

        // Security check
        if ($detailRow->nominatif->user_id !== $this->getAuthenticatedUser(app('request'))?->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Hanya ambil biaya row yang sudah ada, JANGAN buat data baru
        $biayaRow = NominatifBiayaRow::where('nominatif_detail_row_id', $detailRow->id)->first();

        // Log untuk debugging
        \Log::info('NominatifBiayaRowController::index', [
            'detailRowId' => $detailRowId,
            'biayaRowFound' => $biayaRow ? true : false,
            'biayaRowId' => $biayaRow?->id,
            'allBiayaRows' => NominatifBiayaRow::where('nominatif_detail_row_id', $detailRow->id)->get()->toArray()
        ]);

        // Jika belum ada, kirim response kosong dengan status success
        if (!$biayaRow) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'No biaya row found for this detail row'
            ]);
        }

        // Debug logging untuk response
        \Log::info('NominatifBiayaRowController::index - returning data', [
            'biayaRowObject' => $biayaRow,
            'biayaRowId' => $biayaRow?->id,
            'biayaRowToArray' => $biayaRow?->toArray()
        ]);

        return response()->json([
            'success' => true,
            'data' => $biayaRow->toArray() // Convert to array untuk memastikan id tersedia
        ]);
    }

    /**
     * Store a newly created biaya row in storage.
     */
    public function store(Request $request, $detailRowId)
    {
        $detailRow = NominatifDetailRow::findOrFail($detailRowId);

        // Security check
        if ($detailRow->nominatif->user_id !== $this->getAuthenticatedUser(app('request'))?->id) {
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

        // CEK ANTI-DUPLIKASI: Cek apakah biaya row sudah ada untuk detail row ini
        $existingBiayaRow = NominatifBiayaRow::where('nominatif_detail_row_id', $detailRow->id)->first();
        if ($existingBiayaRow) {
            return response()->json([
                'success' => false,
                'message' => 'Biaya row already exists for this detail row. Use update instead.',
                'data' => $existingBiayaRow
            ], 422);
        }

        $request->validate(NominatifBiayaRow::getValidationRules());

        DB::beginTransaction();
        try {
            // Set default values untuk fields yang tidak diisi
            $biayaData = $request->all();
            $defaultFields = [
                'transport_pesawat_non_pp_pagu' => 0,
                'transport_pesawat_non_pp_aktual' => 0,
                'transport_taksi_pagu' => 0,
                'transport_taksi_aktual' => 0,
                'penginapan_jumlah_malam' => 0,
                'penginapan_pagu_perhari' => 0,
                'penginapan_aktual_perhari' => 0,
                'uang_harian_meeting_fullboard_jumlah_hari' => 0,
                'uang_harian_meeting_fullboard_pagu_perhari' => 0,
                'uang_harian_meeting_fullboard_aktual_perhari' => 0,
                'uang_harian_meeting_fullday_jumlah_hari' => 0,
                'uang_harian_meeting_fullday_pagu_perhari' => 0,
                'uang_harian_meeting_fullday_aktual_perhari' => 0,
                'uang_harian_luar_kota_jumlah_hari' => 0,
                'uang_harian_luar_kota_pagu_perhari' => 0,
                'uang_harian_luar_kota_aktual_perhari' => 0,
                'uang_harian_dalam_kota_jumlah_hari' => 0,
                'uang_harian_dalam_kota_pagu_perhari' => 0,
                'uang_harian_dalam_kota_aktual_perhari' => 0,
                'representasi_luar_kota_jumlah_hari' => 0,
                'representasi_luar_kota_pagu_perhari' => 0,
                'representasi_luar_kota_aktual_perhari' => 0,
                'representasi_dalam_kota_jumlah_hari' => 0,
                'representasi_dalam_kota_pagu_perhari' => 0,
                'representasi_dalam_kota_aktual_perhari' => 0,
            ];

            // Merge request data dengan default values
            $biayaData = array_merge($defaultFields, $biayaData);

            $biayaRow = $detailRow->biayaRow()->create($biayaData);

            // Calculate ALL totals manually (sama seperti di method update)
            \Log::info('🧮 STORE: CALCULATING ALL TOTALS MANUALLY');

            // Individual Category Calculations
            $penginapanTotalPagu = $biayaRow->penginapan_jumlah_malam * $biayaRow->penginapan_pagu_perhari;
            $penginapanTotalAktual = $biayaRow->penginapan_jumlah_malam * $biayaRow->penginapan_aktual_perhari;
            $penginapanAnggaranBerjalan = $penginapanTotalPagu - $penginapanTotalAktual;

            $meetingFullboardTotalPagu = $biayaRow->uang_harian_meeting_fullboard_jumlah_hari * $biayaRow->uang_harian_meeting_fullboard_pagu_perhari;
            $meetingFullboardTotalAktual = $biayaRow->uang_harian_meeting_fullboard_jumlah_hari * $biayaRow->uang_harian_meeting_fullboard_aktual_perhari;
            $meetingFullboardAnggaranBerjalan = $meetingFullboardTotalPagu - $meetingFullboardTotalAktual;

            $meetingFulldayTotalPagu = $biayaRow->uang_harian_meeting_fullday_jumlah_hari * $biayaRow->uang_harian_meeting_fullday_pagu_perhari;
            $meetingFulldayTotalAktual = $biayaRow->uang_harian_meeting_fullday_jumlah_hari * $biayaRow->uang_harian_meeting_fullday_aktual_perhari;
            $meetingFulldayAnggaranBerjalan = $meetingFulldayTotalPagu - $meetingFulldayTotalAktual;

            $luarKotaTotalPagu = $biayaRow->uang_harian_luar_kota_jumlah_hari * $biayaRow->uang_harian_luar_kota_pagu_perhari;
            $luarKotaTotalAktual = $biayaRow->uang_harian_luar_kota_jumlah_hari * $biayaRow->uang_harian_luar_kota_aktual_perhari;
            $luarKotaAnggaranBerjalan = $luarKotaTotalPagu - $luarKotaTotalAktual;

            $dalamKotaTotalPagu = $biayaRow->uang_harian_dalam_kota_jumlah_hari * $biayaRow->uang_harian_dalam_kota_pagu_perhari;
            $dalamKotaTotalAktual = $biayaRow->uang_harian_dalam_kota_jumlah_hari * $biayaRow->uang_harian_dalam_kota_aktual_perhari;
            $dalamKotaAnggaranBerjalan = $dalamKotaTotalPagu - $dalamKotaTotalAktual;

            $representasiLuarKotaTotalPagu = $biayaRow->representasi_luar_kota_jumlah_hari * $biayaRow->representasi_luar_kota_pagu_perhari;
            $representasiLuarKotaTotalAktual = $biayaRow->representasi_luar_kota_jumlah_hari * $biayaRow->representasi_luar_kota_aktual_perhari;
            $representasiLuarKotaAnggaranBerjalan = $representasiLuarKotaTotalPagu - $representasiLuarKotaTotalAktual;

            $representasiDalamKotaTotalPagu = $biayaRow->representasi_dalam_kota_jumlah_hari * $biayaRow->representasi_dalam_kota_pagu_perhari;
            $representasiDalamKotaTotalAktual = $biayaRow->representasi_dalam_kota_jumlah_hari * $biayaRow->representasi_dalam_kota_aktual_perhari;
            $representasiDalamKotaAnggaranBerjalan = $representasiDalamKotaTotalPagu - $representasiDalamKotaTotalAktual;

            // Grand Totals
            $totalPagu =
                $biayaRow->transport_pesawat_non_pp_pagu +
                $biayaRow->transport_taksi_pagu +
                $penginapanTotalPagu +
                $meetingFullboardTotalPagu +
                $meetingFulldayTotalPagu +
                $luarKotaTotalPagu +
                $dalamKotaTotalPagu +
                $representasiLuarKotaTotalPagu +
                $representasiDalamKotaTotalPagu;

            $totalAktual =
                $biayaRow->transport_pesawat_non_pp_aktual +
                $biayaRow->transport_taksi_aktual +
                $penginapanTotalAktual +
                $meetingFullboardTotalAktual +
                $meetingFulldayTotalAktual +
                $luarKotaTotalAktual +
                $dalamKotaTotalAktual +
                $representasiLuarKotaTotalAktual +
                $representasiDalamKotaTotalAktual;

            $totalAnggaranBerjalan = $totalPagu - $totalAktual;

            // Update ALL calculated fields
            $allTotalsUpdate = [
                // Penginapan totals
                'penginapan_total_pagu' => $penginapanTotalPagu,
                'penginapan_total_aktual' => $penginapanTotalAktual,
                'penginapan_anggaran_berjalan' => $penginapanAnggaranBerjalan,

                // Meeting Fullboard totals
                'uang_harian_meeting_fullboard_total_pagu' => $meetingFullboardTotalPagu,
                'uang_harian_meeting_fullboard_total_aktual' => $meetingFullboardTotalAktual,
                'uang_harian_meeting_fullboard_anggaran_berjalan' => $meetingFullboardAnggaranBerjalan,

                // Meeting Fullday totals
                'uang_harian_meeting_fullday_total_pagu' => $meetingFulldayTotalPagu,
                'uang_harian_meeting_fullday_total_aktual' => $meetingFulldayTotalAktual,
                'uang_harian_meeting_fullday_anggaran_berjalan' => $meetingFulldayAnggaranBerjalan,

                // Luar Kota totals
                'uang_harian_luar_kota_total_pagu' => $luarKotaTotalPagu,
                'uang_harian_luar_kota_total_aktual' => $luarKotaTotalAktual,
                'uang_harian_luar_kota_anggaran_berjalan' => $luarKotaAnggaranBerjalan,

                // Dalam Kota totals
                'uang_harian_dalam_kota_total_pagu' => $dalamKotaTotalPagu,
                'uang_harian_dalam_kota_total_aktual' => $dalamKotaTotalAktual,
                'uang_harian_dalam_kota_anggaran_berjalan' => $dalamKotaAnggaranBerjalan,

                // Representasi Luar Kota totals
                'representasi_luar_kota_total_pagu' => $representasiLuarKotaTotalPagu,
                'representasi_luar_kota_total_aktual' => $representasiLuarKotaTotalAktual,
                'representasi_luar_kota_anggaran_berjalan' => $representasiLuarKotaAnggaranBerjalan,

                // Representasi Dalam Kota totals
                'representasi_dalam_kota_total_pagu' => $representasiDalamKotaTotalPagu,
                'representasi_dalam_kota_total_aktual' => $representasiDalamKotaTotalAktual,
                'representasi_dalam_kota_anggaran_berjalan' => $representasiDalamKotaAnggaranBerjalan,

                // Grand totals
                'total_pagu_row' => $totalPagu,
                'total_aktual_row' => $totalAktual,
                'total_anggaran_berjalan_row' => $totalAnggaranBerjalan,
            ];

            \Log::info('💾 STORE: ALL TOTALS UPDATE DATA', [
                'totals_update' => $allTotalsUpdate,
                'penginapan_calculations' => [
                    'jumlah_malam' => $biayaRow->penginapan_jumlah_malam,
                    'pagu_perhari' => $biayaRow->penginapan_pagu_perhari,
                    'aktual_perhari' => $biayaRow->penginapan_aktual_perhari,
                    'total_pagu' => $penginapanTotalPagu,
                    'total_aktual' => $penginapanTotalAktual,
                    'anggaran_berjalan' => $penginapanAnggaranBerjalan,
                ]
            ]);

            $biayaRow->update($allTotalsUpdate);

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
        if ($biayaRow->detailRow->nominatif->user_id !== $this->getAuthenticatedUser(app('request'))?->id) {
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
        if ($biayaRow->detailRow->nominatif->user_id !== $this->getAuthenticatedUser(app('request'))?->id) {
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

        \Log::info('🔄 UPDATE REQUEST RECEIVED', [
                'biayaId' => $biayaId,
                'request_all' => $request->all(),
                'request_keys' => array_keys($request->all())
            ]);

        // Comprehensive validation untuk SEMUA fields yang dikirim frontend
        $request->validate([
            // Transportasi fields (sesuai database yang ada)
            'transport_pesawat_non_pp_pagu' => 'nullable|numeric|min:0',
            'transport_pesawat_non_pp_aktual' => 'nullable|numeric|min:0',
            'transport_taksi_pagu' => 'nullable|numeric|min:0',
            'transport_taksi_aktual' => 'nullable|numeric|min:0',

            // Penginapan fields (sesuai database) - FIX: Tambah missing fields!
            'penginapan_jumlah_malam' => 'nullable|integer|min:0',
            'penginapan_pagu_perhari' => 'nullable|numeric|min:0',
            'penginapan_aktual_perhari' => 'nullable|numeric|min:0',

            // Uang Harian Meeting Fullboard (sesuai database)
            'uang_harian_meeting_fullboard_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_meeting_fullboard_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_meeting_fullboard_aktual_perhari' => 'nullable|numeric|min:0',

            // Uang Harian Meeting Fullday (sesuai database) - FIX: Add missing validation!
            'uang_harian_meeting_fullday_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_meeting_fullday_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_meeting_fullday_aktual_perhari' => 'nullable|numeric|min:0',

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
        ]);

        DB::beginTransaction();
        try {
            // Log data before update
            \Log::info('📊 BEFORE UPDATE', [
                'biayaRow_current' => $biayaRow->toArray(),
                'request_data' => $request->all()
            ]);

            // FIX: Update only allowed fields instead of all()
            $allowedFields = [
                'transport_pesawat_non_pp_pagu', 'transport_pesawat_non_pp_aktual',
                'transport_taksi_pagu', 'transport_taksi_aktual',
                'penginapan_jumlah_malam', 'penginapan_pagu_perhari', 'penginapan_aktual_perhari',
                'uang_harian_meeting_fullboard_jumlah_hari', 'uang_harian_meeting_fullboard_pagu_perhari', 'uang_harian_meeting_fullboard_aktual_perhari',
                'uang_harian_meeting_fullday_jumlah_hari', 'uang_harian_meeting_fullday_pagu_perhari', 'uang_harian_meeting_fullday_aktual_perhari',
                'uang_harian_luar_kota_jumlah_hari', 'uang_harian_luar_kota_pagu_perhari', 'uang_harian_luar_kota_aktual_perhari',
                'uang_harian_dalam_kota_jumlah_hari', 'uang_harian_dalam_kota_pagu_perhari', 'uang_harian_dalam_kota_aktual_perhari',
                'representasi_luar_kota_jumlah_hari', 'representasi_luar_kota_pagu_perhari', 'representasi_luar_kota_aktual_perhari',
                'representasi_dalam_kota_jumlah_hari', 'representasi_dalam_kota_pagu_perhari', 'representasi_dalam_kota_aktual_perhari',
            ];

            $updateData = [];
            foreach ($allowedFields as $field) {
                if ($request->has($field)) {
                    $updateData[$field] = $request->input($field);
                }
            }

            \Log::info('💾 UPDATE DATA PREPARED', [
                'updateData' => $updateData
            ]);

            $biayaRow->update($updateData);

            // Refresh model to get updated values
            $biayaRow->refresh();

            // Calculate ALL totals manually (sesuai database fields)
            \Log::info('🧮 CALCULATING ALL TOTALS MANUALLY');

            // Individual Category Calculations
            $penginapanTotalPagu = $biayaRow->penginapan_jumlah_malam * $biayaRow->penginapan_pagu_perhari;
            $penginapanTotalAktual = $biayaRow->penginapan_jumlah_malam * $biayaRow->penginapan_aktual_perhari;
            $penginapanAnggaranBerjalan = $penginapanTotalPagu - $penginapanTotalAktual;

            $meetingFullboardTotalPagu = $biayaRow->uang_harian_meeting_fullboard_jumlah_hari * $biayaRow->uang_harian_meeting_fullboard_pagu_perhari;
            $meetingFullboardTotalAktual = $biayaRow->uang_harian_meeting_fullboard_jumlah_hari * $biayaRow->uang_harian_meeting_fullboard_aktual_perhari;
            $meetingFullboardAnggaranBerjalan = $meetingFullboardTotalPagu - $meetingFullboardTotalAktual;

            $meetingFulldayTotalPagu = $biayaRow->uang_harian_meeting_fullday_jumlah_hari * $biayaRow->uang_harian_meeting_fullday_pagu_perhari;
            $meetingFulldayTotalAktual = $biayaRow->uang_harian_meeting_fullday_jumlah_hari * $biayaRow->uang_harian_meeting_fullday_aktual_perhari;
            $meetingFulldayAnggaranBerjalan = $meetingFulldayTotalPagu - $meetingFulldayTotalAktual;

            $luarKotaTotalPagu = $biayaRow->uang_harian_luar_kota_jumlah_hari * $biayaRow->uang_harian_luar_kota_pagu_perhari;
            $luarKotaTotalAktual = $biayaRow->uang_harian_luar_kota_jumlah_hari * $biayaRow->uang_harian_luar_kota_aktual_perhari;
            $luarKotaAnggaranBerjalan = $luarKotaTotalPagu - $luarKotaTotalAktual;

            $dalamKotaTotalPagu = $biayaRow->uang_harian_dalam_kota_jumlah_hari * $biayaRow->uang_harian_dalam_kota_pagu_perhari;
            $dalamKotaTotalAktual = $biayaRow->uang_harian_dalam_kota_jumlah_hari * $biayaRow->uang_harian_dalam_kota_aktual_perhari;
            $dalamKotaAnggaranBerjalan = $dalamKotaTotalPagu - $dalamKotaTotalAktual;

            $representasiLuarKotaTotalPagu = $biayaRow->representasi_luar_kota_jumlah_hari * $biayaRow->representasi_luar_kota_pagu_perhari;
            $representasiLuarKotaTotalAktual = $biayaRow->representasi_luar_kota_jumlah_hari * $biayaRow->representasi_luar_kota_aktual_perhari;
            $representasiLuarKotaAnggaranBerjalan = $representasiLuarKotaTotalPagu - $representasiLuarKotaTotalAktual;

            $representasiDalamKotaTotalPagu = $biayaRow->representasi_dalam_kota_jumlah_hari * $biayaRow->representasi_dalam_kota_pagu_perhari;
            $representasiDalamKotaTotalAktual = $biayaRow->representasi_dalam_kota_jumlah_hari * $biayaRow->representasi_dalam_kota_aktual_perhari;
            $representasiDalamKotaAnggaranBerjalan = $representasiDalamKotaTotalPagu - $representasiDalamKotaTotalAktual;

            // Grand Totals
            $totalPagu =
                $biayaRow->transport_pesawat_non_pp_pagu +
                $biayaRow->transport_taksi_pagu +
                $penginapanTotalPagu +
                $meetingFullboardTotalPagu +
                $meetingFulldayTotalPagu +
                $luarKotaTotalPagu +
                $dalamKotaTotalPagu +
                $representasiLuarKotaTotalPagu +
                $representasiDalamKotaTotalPagu;

            $totalAktual =
                $biayaRow->transport_pesawat_non_pp_aktual +
                $biayaRow->transport_taksi_aktual +
                $penginapanTotalAktual +
                $meetingFullboardTotalAktual +
                $meetingFulldayTotalAktual +
                $luarKotaTotalAktual +
                $dalamKotaTotalAktual +
                $representasiLuarKotaTotalAktual +
                $representasiDalamKotaTotalAktual;

            $totalAnggaranBerjalan = $totalPagu - $totalAktual;

            // Update ALL calculated fields
            $allTotalsUpdate = [
                // Penginapan totals
                'penginapan_total_pagu' => $penginapanTotalPagu,
                'penginapan_total_aktual' => $penginapanTotalAktual,
                'penginapan_anggaran_berjalan' => $penginapanAnggaranBerjalan,

                // Meeting Fullboard totals
                'uang_harian_meeting_fullboard_total_pagu' => $meetingFullboardTotalPagu,
                'uang_harian_meeting_fullboard_total_aktual' => $meetingFullboardTotalAktual,
                'uang_harian_meeting_fullboard_anggaran_berjalan' => $meetingFullboardAnggaranBerjalan,

                // Meeting Fullday totals
                'uang_harian_meeting_fullday_total_pagu' => $meetingFulldayTotalPagu,
                'uang_harian_meeting_fullday_total_aktual' => $meetingFulldayTotalAktual,
                'uang_harian_meeting_fullday_anggaran_berjalan' => $meetingFulldayAnggaranBerjalan,

                // Luar Kota totals
                'uang_harian_luar_kota_total_pagu' => $luarKotaTotalPagu,
                'uang_harian_luar_kota_total_aktual' => $luarKotaTotalAktual,
                'uang_harian_luar_kota_anggaran_berjalan' => $luarKotaAnggaranBerjalan,

                // Dalam Kota totals
                'uang_harian_dalam_kota_total_pagu' => $dalamKotaTotalPagu,
                'uang_harian_dalam_kota_total_aktual' => $dalamKotaTotalAktual,
                'uang_harian_dalam_kota_anggaran_berjalan' => $dalamKotaAnggaranBerjalan,

                // Representasi Luar Kota totals
                'representasi_luar_kota_total_pagu' => $representasiLuarKotaTotalPagu,
                'representasi_luar_kota_total_aktual' => $representasiLuarKotaTotalAktual,
                'representasi_luar_kota_anggaran_berjalan' => $representasiLuarKotaAnggaranBerjalan,

                // Representasi Dalam Kota totals
                'representasi_dalam_kota_total_pagu' => $representasiDalamKotaTotalPagu,
                'representasi_dalam_kota_total_aktual' => $representasiDalamKotaTotalAktual,
                'representasi_dalam_kota_anggaran_berjalan' => $representasiDalamKotaAnggaranBerjalan,

                // Grand totals
                'total_pagu_row' => $totalPagu,
                'total_aktual_row' => $totalAktual,
                'total_anggaran_berjalan_row' => $totalAnggaranBerjalan,
            ];

            \Log::info('💾 ALL TOTALS UPDATE DATA', [
                'totals_update' => $allTotalsUpdate,
                'penginapan_calculations' => [
                    'jumlah_malam' => $biayaRow->penginapan_jumlah_malam,
                    'pagu_perhari' => $biayaRow->penginapan_pagu_perhari,
                    'aktual_perhari' => $biayaRow->penginapan_aktual_perhari,
                    'total_pagu' => $penginapanTotalPagu,
                    'total_aktual' => $penginapanTotalAktual,
                    'anggaran_berjalan' => $penginapanAnggaranBerjalan,
                ]
            ]);

            $biayaRow->update($allTotalsUpdate);

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
        if ($biayaRow->detailRow->nominatif->user_id !== $this->getAuthenticatedUser(app('request'))?->id) {
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
            // Transportasi fields (sesuai database yang ada)
            'transport_pesawat_non_pp_pagu' => 'nullable|numeric|min:0',
            'transport_pesawat_non_pp_aktual' => 'nullable|numeric|min:0',
            'transport_taksi_pagu' => 'nullable|numeric|min:0',
            'transport_taksi_aktual' => 'nullable|numeric|min:0',

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
            $biayaRow->transport_pesawat_non_pp_pagu +
            $biayaRow->transport_taksi_pagu +
            // Penginapan: jumlah_malam × pagu_perhari
            ($biayaRow->penginapan_jumlah_malam * $biayaRow->penginapan_pagu_perhari) +
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
            $biayaRow->transport_pesawat_non_pp_aktual +
            $biayaRow->transport_taksi_aktual +
            // Penginapan: jumlah_malam × aktual_perhari
            ($biayaRow->penginapan_jumlah_malam * $biayaRow->penginapan_aktual_perhari) +
            // Uang Harian Meeting Fullboard (jumlah_hari × aktual_perhari)
            ($biayaRow->uang_harian_meeting_fullboard_jumlah_hari * $biayaRow->uang_harian_meeting_fullboard_aktual_perhari) +
            // Uang Harian Luar Kota (jumlah_hari × aktual_perhari)
            ($biayaRow->uang_harian_luar_kota_jumlah_hari * $biayaRow->uang_harian_luar_kota_aktual_perhari) +
            // Uang Harian Dalam Kota (jumlah_hari × aktual_perhari)
            ($biayaRow->uang_harian_dalam_kota_jumlah_hari * $biayaRow->uang_harian_dalam_kota_aktual_perhari) +
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