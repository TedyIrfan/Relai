<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\NominatifDetailRow;
use App\Models\NominatifBiayaRow;
use App\Models\NominatifEvidence;
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

        \Log::info('getAuthenticatedUser - Debug', [
            'hasToken' => !empty($token),
            'tokenLength' => $token ? strlen($token) : 0,
            'tokenStart' => $token ? substr($token, 0, 20) . '...' : 'none'
        ]);

        if (!$token) {
            return null;
        }

        // Find the token in the personal_access_tokens table
        $accessToken = PersonalAccessToken::findToken($token);

        \Log::info('getAuthenticatedUser - Token Check', [
            'accessTokenFound' => $accessToken ? true : false,
            'tokenableId' => $accessToken?->tokenable_id,
            'tokenableType' => $accessToken?->tokenable_type
        ]);

        if (!$accessToken) {
            return null;
        }

        // Get the user associated with this token
        $user = $accessToken->tokenable;

        \Log::info('getAuthenticatedUser - Result', [
            'userId' => $user?->id,
            'userEmail' => $user?->email
        ]);

        return $user;
    }

    /**
     * Display biaya data for a detail row.
     */
    public function index($detailRowId)
    {
        $detailRow = NominatifDetailRow::findOrFail($detailRowId);

        // Security check dengan debug logging
        $authenticatedUserId = $this->getAuthenticatedUser(app('request'))?->id;
        $nominatifOwnerId = $detailRow->nominatif->user_id;

        \Log::info('NominatifBiayaRowController::index - Security Check', [
            'detailRowId' => $detailRowId,
            'authenticatedUserId' => $authenticatedUserId,
            'nominatifOwnerId' => $nominatifOwnerId,
            'isAuthorized' => $authenticatedUserId == $nominatifOwnerId,
            'nominatifId' => $detailRow->nominatif_id
        ]);

        if ($nominatifOwnerId !== $authenticatedUserId) {
            \Log::error('NominatifBiayaRowController::index - UNAUTHORIZED', [
                'detailRowId' => $detailRowId,
                'authenticatedUserId' => $authenticatedUserId,
                'nominatifOwnerId' => $nominatifOwnerId,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Cari biaya row yang sudah ada
        $biayaRow = NominatifBiayaRow::where('nominatif_detail_row_id', $detailRow->id)->first();

        // Log untuk debugging
        \Log::info('NominatifBiayaRowController::index', [
            'detailRowId' => $detailRowId,
            'biayaRowFound' => $biayaRow ? true : false,
            'biayaRowId' => $biayaRow?->id,
            'allBiayaRows' => NominatifBiayaRow::where('nominatif_detail_row_id', $detailRow->id)->get()->toArray()
        ]);

        // 🔥 FIXED: Method index SEHARUSNYA TIDAK membuat data baru!
        // Ini READ-ONLY method untuk mengambil data yang sudah ada
        if (!$biayaRow) {
            \Log::warning('⚠️ No biaya row found for EDIT MODE - NOT creating new data!', [
                'detailRowId' => $detailRowId,
                'nominatifId' => $detailRow->nominatif_id
            ]);

            // Default values untuk CREATE MODE - semua field = 0 atau null
            $defaultBiayaData = [
                'nominatif_detail_row_id' => $detailRow->id,
                // Transportasi
                'transport_pesawat_non_pp_pagu' => 0,
                'transport_pesawat_non_pp_aktual' => 0,
                'transport_taksi_pagu' => 0,
                'transport_taksi_aktual' => 0,

                // Penginapan
                'penginapan_jumlah_malam' => 0,
                'penginapan_pagu_perhari' => 0,
                'penginapan_aktual_perhari' => 0,

                // Uang Harian Meeting Fullboard
                'uang_harian_meeting_fullboard_jumlah_hari' => 0,
                'uang_harian_meeting_fullboard_pagu_perhari' => 0,
                'uang_harian_meeting_fullboard_aktual_perhari' => 0,

                // Uang Harian Meeting Fullday
                'uang_harian_meeting_fullday_jumlah_hari' => 0,
                'uang_harian_meeting_fullday_pagu_perhari' => 0,
                'uang_harian_meeting_fullday_aktual_perhari' => 0,

                // Uang Harian Luar Kota
                'uang_harian_luar_kota_jumlah_hari' => 0,
                'uang_harian_luar_kota_pagu_perhari' => 0,
                'uang_harian_luar_kota_aktual_perhari' => 0,

                // Uang Harian Dalam Kota
                'uang_harian_dalam_kota_jumlah_hari' => 0,
                'uang_harian_dalam_kota_pagu_perhari' => 0,
                'uang_harian_dalam_kota_aktual_perhari' => 0,

                // Representasi Luar Kota
                'representasi_luar_kota_jumlah_hari' => 0,
                'representasi_luar_kota_pagu_perhari' => 0,
                'representasi_luar_kota_aktual_perhari' => 0,

                // Representasi Dalam Kota
                'representasi_dalam_kota_jumlah_hari' => 0,
                'representasi_dalam_kota_pagu_perhari' => 0,
                'representasi_dalam_kota_aktual_perhari' => 0,
            ];

            // 🔥 CRITICAL FIX: JANGAN buat data baru di method index!
            // Return empty object instead
            $biayaRow = (object) $defaultBiayaData;
            $biayaRow->id = null; // Explicitly set id to null

            \Log::warning('⚠️ Returning empty structure instead of creating new database record');
        }

        // Debug logging untuk response
        \Log::info('NominatifBiayaRowController::index - returning data', [
            'detailRowId' => $detailRowId,
            'biayaRowId' => $biayaRow?->id,
            'isRealData' => $biayaRow?->id !== null,
            'transport_pesawat_non_pp_pagu' => $biayaRow?->transport_pesawat_non_pp_pagu,
            'transport_taksi_pagu' => $biayaRow?->transport_taksi_pagu,
        ]);

        // Convert to array properly
        $dataToReturn = is_object($biayaRow) && method_exists($biayaRow, 'toArray')
            ? $biayaRow->toArray()
            : (array) $biayaRow;

        return response()->json([
            'success' => true,
            'data' => $dataToReturn
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

        // 🔥 FIXED LOGIC: Cek apakah ada data penginapan yang VALID
        $penginapanJumlahMalam = $request->input('penginapan_jumlah_malam');
        $penginapanPaguPerhari = $request->input('penginapan_pagu_perhari');
        $penginapanAktualPerhari = $request->input('penginapan_aktual_perhari');

        $hasPenginapanData = (
            $penginapanJumlahMalam !== null && $penginapanJumlahMalam !== '' && $penginapanJumlahMalam > 0 ||
            $penginapanPaguPerhari !== null && $penginapanPaguPerhari !== '' && $penginapanPaguPerhari > 0 ||
            $penginapanAktualPerhari !== null && $penginapanAktualPerhari !== '' && $penginapanAktualPerhari > 0
        );

        // 🔥 CUSTOM VALIDATION: Dynamic validation based on penginapan data
        $validationRules = [
            // Biaya row validation rules
            ...NominatifBiayaRow::getValidationRules(),
            // Evidence file validation
            'evidence_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf,bmp,gif|max:10240', // Max 10MB
            'evidence_filename' => 'nullable|string|max:255',
            'evidence_filesize' => 'nullable|integer',
        ];

        // 🔥 DYNAMIC VALIDATION: Override penginapan rules based on data
        if ($hasPenginapanData) {
            // If penginapan data exists, make all penginapan fields required
            $validationRules['penginapan_jumlah_malam'] = 'required|integer|min:1|max:365';
            $validationRules['penginapan_pagu_perhari'] = 'required|numeric|min:0|max:999999999.99';
            $validationRules['penginapan_aktual_perhari'] = 'required|numeric|min:0|max:999999999.99';
        } else {
            // If no penginapan data, make penginapan fields optional (nullable)
            $validationRules['penginapan_jumlah_malam'] = 'nullable|integer|min:0|max:365';
            $validationRules['penginapan_pagu_perhari'] = 'nullable|numeric|min:0|max:999999999.99';
            $validationRules['penginapan_aktual_perhari'] = 'nullable|numeric|min:0|max:999999999.99';
        }

        $request->validate($validationRules);

        DB::beginTransaction();
        try {
            // 🔥 FIXED: Conditional default values untuk penginapan
            $biayaData = $request->all();
            $defaultFields = [
                'transport_pesawat_non_pp_pagu' => 0,
                'transport_pesawat_non_pp_aktual' => 0,
                'transport_taksi_pagu' => 0,
                'transport_taksi_aktual' => 0,
                // Only set penginapan defaults if no penginapan data
                'penginapan_jumlah_malam' => $hasPenginapanData ? ($biayaData['penginapan_jumlah_malam'] ?? 0) : 0,
                'penginapan_pagu_perhari' => $hasPenginapanData ? ($biayaData['penginapan_pagu_perhari'] ?? 0) : 0,
                'penginapan_aktual_perhari' => $hasPenginapanData ? ($biayaData['penginapan_aktual_perhari'] ?? 0) : 0,
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

        // 🔥 FIXED: Removed $conditionalDefaults undefined variable
        // Merge all defaults with request data
        $biayaData = array_merge($defaultFields, $request->all());

            $biayaRow = $detailRow->biayaRow()->create($biayaData);

            // 🔥 NEW: Handle evidence file upload
            $evidenceFile = null;
            if ($request->hasFile('evidence_file')) {
                $file = $request->file('evidence_file');
                $userId = $this->getAuthenticatedUser(app('request'))?->id;
                $nominatifId = $detailRow->nominatif_id;

                // Create unique filename
                $fileName = time() . '_' . $userId . '_' . $nominatifId . '_' . $detailRow->id . '_' . $file->getClientOriginalName();

                // Store file
                $path = $file->storeAs(
                    "evidence/{$userId}/nominatif_{$nominatifId}",
                    $fileName,
                    'public'
                );

                // Create evidence record
                $evidenceFile = NominatifEvidence::create([
                    'nominatif_id' => $nominatifId,
                    'nominatif_detail_row_id' => $detailRow->id, // Link to detail row
                    'evidence_foto_path' => $path,
                    'evidence_foto_name' => $file->getClientOriginalName(),
                    'evidence_foto_size' => $file->getSize(),
                    'evidence_foto_type' => $file->getMimeType(),
                    'keterangan' => $request->evidence_keterangan ?? 'Evidence for ' . $detailRow->nama_lengkap,
                ]);

                \Log::info('📎 Evidence file uploaded and saved:', [
                    'evidence_id' => $evidenceFile->id,
                    'nominatif_id' => $nominatifId,
                    'detail_row_id' => $detailRow->id,
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                ]);
            }

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
                'data' => $biayaRow,
                'evidence' => $evidenceFile // Include evidence info in response
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
     * 🔥 NEW: Store evidence file separately for existing biaya rows
     */
    public function storeEvidence(Request $request, $biayaId)
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
                'message' => 'Cannot upload evidence to submitted nominatif'
            ], 422);
        }

        // Validate evidence file
        $request->validate([
            'evidence_file' => 'required|file|mimes:jpg,jpeg,png,pdf,bmp,gif,webp,svg|max:10240', // Max 10MB
            'keterangan' => 'nullable|string|max:500'
        ]);

        DB::beginTransaction();
        try {
            $file = $request->file('evidence_file');
            $userId = $this->getAuthenticatedUser(app('request'))->id;
            $nominatifId = $biayaRow->detailRow->nominatif_id;
            $detailRowId = $biayaRow->detailRow->id;

            // Create unique filename
            $fileName = time() . '_' . $userId . '_' . $nominatifId . '_' . $detailRowId . '_' . $file->getClientOriginalName();

            // Store file
            $path = $file->storeAs(
                "evidence/{$userId}/nominatif_{$nominatifId}",
                $fileName,
                'public'
            );

            // Create evidence record with proper linking
            $evidence = NominatifEvidence::create([
                'nominatif_id' => $nominatifId,
                'nominatif_detail_row_id' => $detailRowId, // 🔥 FIX: Link to biaya row
                'evidence_foto_path' => $path,
                'evidence_foto_name' => $file->getClientOriginalName(),
                'evidence_foto_size' => $file->getSize(),
                'evidence_foto_type' => $file->getMimeType(),
                'keterangan' => $request->keterangan,
                'user_id' => $userId, // 🔥 NEW: Track who uploaded
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Evidence uploaded successfully',
                'data' => $evidence
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload evidence',
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

        // 🔥 FIXED LOGIC: Conditional Validation untuk penginapan
        // Cek apakah ada data penginapan yang VALID (tidak kosong/tidak null/tidak 0)
        $penginapanJumlahMalam = $request->input('penginapan_jumlah_malam');
        $penginapanPaguPerhari = $request->input('penginapan_pagu_perhari');
        $penginapanAktualPerhari = $request->input('penginapan_aktual_perhari');

        $hasPenginapanData = (
            $penginapanJumlahMalam !== null && $penginapanJumlahMalam !== '' && $penginapanJumlahMalam > 0 ||
            $penginapanPaguPerhari !== null && $penginapanPaguPerhari !== '' && $penginapanPaguPerhari > 0 ||
            $penginapanAktualPerhari !== null && $penginapanAktualPerhari !== '' && $penginapanAktualPerhari > 0
        );

        // Comprehensive validation untuk SEMUA fields yang dikirim frontend
        $request->validate([
            // Transportasi fields (sesuai database yang ada)
            'transport_pesawat_non_pp_pagu' => 'nullable|numeric|min:0',
            'transport_pesawat_non_pp_aktual' => 'nullable|numeric|min:0',
            'transport_taksi_pagu' => 'nullable|numeric|min:0',
            'transport_taksi_aktual' => 'nullable|numeric|min:0',

            // Penginapan fields (sesuai database) - 🔥 FIXED: Proper conditional validation!
            'penginapan_jumlah_malam' => $hasPenginapanData ? 'required|integer|min:1|max:365' : 'nullable|integer|min:0|max:365',
            'penginapan_pagu_perhari' => $hasPenginapanData ? 'required|numeric|min:0|max:999999999.99' : 'nullable|numeric|min:0|max:999999999.99',
            'penginapan_aktual_perhari' => $hasPenginapanData ? 'required|numeric|min:0|max:999999999.99' : 'nullable|numeric|min:0|max:999999999.99',

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

            // Evidence file validation (NEW)
            'evidence_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf,bmp,gif|max:10240', // Max 10MB
            'evidence_filename' => 'nullable|string|max:255',
            'evidence_filesize' => 'nullable|integer',
            'evidence_keterangan' => 'nullable|string|max:500',
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

            // 🔥 NEW: Handle evidence file upload for update
            $evidenceFile = null;
            if ($request->hasFile('evidence_file')) {
                $file = $request->file('evidence_file');
                $userId = $this->getAuthenticatedUser(app('request'))?->id;
                $nominatifId = $biayaRow->detailRow->nominatif_id;
                $detailRowId = $biayaRow->detailRow->id;

                // Delete existing evidence for this detail row (optional - remove if multiple evidence per row is allowed)
                NominatifEvidence::where('nominatif_detail_row_id', $detailRowId)->delete();

                // Create unique filename
                $fileName = time() . '_' . $userId . '_' . $nominatifId . '_' . $detailRowId . '_' . $file->getClientOriginalName();

                // Store file
                $path = $file->storeAs(
                    "evidence/{$userId}/nominatif_{$nominatifId}",
                    $fileName,
                    'public'
                );

                // Create evidence record
                $evidenceFile = NominatifEvidence::create([
                    'nominatif_id' => $nominatifId,
                    'nominatif_detail_row_id' => $detailRowId,
                    'evidence_foto_path' => $path,
                    'evidence_foto_name' => $file->getClientOriginalName(),
                    'evidence_foto_size' => $file->getSize(),
                    'evidence_foto_type' => $file->getMimeType(),
                    'keterangan' => $request->evidence_keterangan ?? 'Evidence for ' . $biayaRow->detailRow->nama_lengkap,
                ]);

                \Log::info('📎 Evidence file updated and saved:', [
                    'evidence_id' => $evidenceFile->id,
                    'nominatif_id' => $nominatifId,
                    'detail_row_id' => $detailRowId,
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                ]);
            }

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
                'data' => $biayaRow,
                'evidence' => $evidenceFile // Include evidence info in response
            ]);

              } catch (\Exception $e) {
            DB::rollBack();

            // 🔍 Enhanced Debug Logging
            \Log::error('❌ UPDATE BIAYA ROW ERROR', [
                'biayaId' => $biayaId,
                'request_data' => $request->all(),
                'request_headers' => $request->headers->all(),
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'error_trace' => $e->getTraceAsString(),
                'detail_row_id' => $biayaRow->detailRow->id ?? 'unknown',
                'nominatif_id' => $biayaRow->detailRow->nominatif_id ?? 'unknown',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update biaya row',
                'error' => $e->getMessage(),
                'debug_info' => [
                    'biaya_id' => $biayaId,
                    'detail_row_id' => $biayaRow->detailRow->id ?? null,
                    'error_details' => $e->getMessage()
                ]
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
        // 🚀 FIX: Prevent race condition with cache-based debouncer
        $cacheKey = "nominatif_totals_updating_{$nominatifId}";

        // Check if already updating
        if (Cache::has($cacheKey)) {
            \Log::info("⏱️ UPDATE SKIPPED - Already updating nominatif {$nominatifId}");
            return;
        }

        // Lock for 500ms to prevent duplicate updates
        Cache::put($cacheKey, true, now()->addMilliseconds(500));

        // ⚡ Add small delay to ensure all database updates are committed
        usleep(100000); // 100ms delay

        $nominatif = DB::table('nominatifs_new')->where('id', $nominatifId)->first();

        // Debug: Cek semua detail rows untuk nominatif ini
        $detailRows = DB::table('nominatif_detail_rows')
            ->where('nominatif_id', $nominatifId)
            ->get();

        \Log::info("🔍 DEBUG UPDATE TOTALS - Nominatif ID: {$nominatifId}", [
            'detail_rows_count' => $detailRows->count(),
            'detail_rows' => $detailRows->toArray()
        ]);

        // Debug: Cek semua biaya rows untuk detail rows ini
        $biayaRows = DB::table('nominatif_biaya_rows')
            ->whereIn('nominatif_detail_row_id', $detailRows->pluck('id'))
            ->get();

        \Log::info("💰 DEBUG BIAYA ROWS", [
            'biaya_rows_count' => $biayaRows->count(),
            'biaya_rows' => $biayaRows->toArray()
        ]);

        // Debug: Cek join query step by step
        $joinQuery = DB::table('nominatif_detail_rows as dr')
            ->join('nominatif_biaya_rows as br', 'dr.id', '=', 'br.nominatif_detail_row_id')
            ->where('dr.nominatif_id', $nominatifId)
            ->select('dr.id as detail_id', 'dr.person_name', 'br.id as biaya_id', 'br.total_pagu_row', 'br.total_aktual_row')
            ->get();

        \Log::info("🔗 DEBUG JOIN QUERY RESULT", [
            'join_results_count' => $joinQuery->count(),
            'join_results' => $joinQuery->toArray()
        ]);

        $totalPagu = DB::table('nominatif_detail_rows as dr')
            ->join('nominatif_biaya_rows as br', 'dr.id', '=', 'br.nominatif_detail_row_id')
            ->where('dr.nominatif_id', $nominatifId)
            ->sum(DB::raw('COALESCE(br.total_pagu_row, 0)'));

        $totalAktual = DB::table('nominatif_detail_rows as dr')
            ->join('nominatif_biaya_rows as br', 'dr.id', '=', 'br.nominatif_detail_row_id')
            ->where('dr.nominatif_id', $nominatifId)
            ->sum(DB::raw('COALESCE(br.total_aktual_row, 0)'));

        \Log::info("📊 DEBUG FINAL TOTALS", [
            'calculated_total_pagu' => $totalPagu,
            'calculated_total_aktual' => $totalAktual
        ]);

        // Get old aktual for budget calculation
        $oldAktual = $nominatif->total_aktual_trip ?? 0;

        DB::table('nominatifs_new')
            ->where('id', $nominatifId)
            ->update([
                'total_pagu' => $totalPagu,
                'total_biaya_aktual' => $totalAktual,
                'total_pagu_trip' => $totalPagu,
                'total_aktual_trip' => $totalAktual,
                'total_anggaran_berjalan_trip' => $totalPagu - $totalAktual,
            ]);

        // 🎯 FIX: Update RKA budget when biaya rows are updated
        $this->updateRKABudget($nominatifId, $totalAktual, $oldAktual);
    }

    /**
     * Update RKA budget when nominatif biaya rows are updated
     */
    private function updateRKABudget($nominatifId, $newAktual, $oldAktual)
    {
        // 🎯 FIX: Get the LATEST totals from database, not from stale nominatif object
        $totalPagu = DB::table('nominatif_detail_rows as dr')
            ->join('nominatif_biaya_rows as br', 'dr.id', '=', 'br.nominatif_detail_row_id')
            ->where('dr.nominatif_id', $nominatifId)
            ->sum('br.total_pagu_row');

        // Get nominatif with RKA detail
        $nominatif = DB::table('nominatifs_new as nn')
            ->join('rka_details as rd', 'nn.rka_detail_id', '=', 'rd.id')
            ->where('nn.id', $nominatifId)
            ->select('nn.*', 'rd.code_rka', 'rd.anggaran_layanan', 'rd.anggaran_sp2d')
            ->first();

        if ($nominatif) {
            // 🎯 NOMINATIF LOGIC:
            // Anggaran Berjalan = Total PAGU yang diinput user (real-time calculation)
            // Anggaran Layanan Used = Total AKTUAL yang dipakai user (real-time calculation)
            DB::table('rka_details')
                ->where('id', $nominatif->rka_detail_id)
                ->update([
                    'anggaran_berjalan' => $newAktual ? $totalPagu : 0,     // Total pagu yang diinput (real-time)
                    'anggaran_layanan_used' => $newAktual,                 // Total aktual yang dipakai
                ]);

            \Log::info('RKA Budget updated - From Biaya Row (FIXED)', [
                'nominatif_id' => $nominatifId,
                'rka_code' => $nominatif->code_rka,
                'real_time_total_pagu' => $totalPagu,
                'total_aktual_trip' => $newAktual,
                'rka_anggaran_berjalan_set' => $newAktual ? $totalPagu : 0,
                'rka_anggaran_layanan_used_set' => $newAktual,
                'rka_anggaran_sp2d' => $nominatif->anggaran_sp2d,
                'rka_anggaran_tersisa' => ($nominatif->anggaran_layanan ?? 0) - $totalPagu - ($nominatif->anggaran_sp2d ?? 0),
            ]);
        }
    }

    /**
     * 🔥 NEW: Simplified update method that allows all fields to be nullable
     */
    public function updateSimplified(Request $request, $biayaId)
    {
        // 🔥 DEBUG: Log semua request yang masuk
        \Log::info('🔥 updateSimplified() called with:', [
            'biayaId' => $biayaId,
            'request_all' => $request->all(),
            'request_keys' => array_keys($request->all()),
            'has_penginapan_jumlah_malam' => $request->has('penginapan_jumlah_malam'),
            'has_penginapan_pagu_perhari' => $request->has('penginapan_pagu_perhari'),
            'has_penginapan_aktual_perhari' => $request->has('penginapan_aktual_perhari'),
            'input_penginapan_jumlah_malam' => $request->input('penginapan_jumlah_malam'),
            'input_penginapan_pagu_perhari' => $request->input('penginapan_pagu_perhari'),
            'input_penginapan_aktual_perhari' => $request->input('penginapan_aktual_perhari'),
        ]);

        $biayaRow = NominatifBiayaRow::findOrFail($biayaId);

        // Security check
        if ($biayaRow->detailRow->nominatif->user_id !== $this->getAuthenticatedUser($request)?->id) {
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

        \Log::info('🔥 SIMPLIFIED UPDATE REQUEST', [
            'biayaId' => $biayaId,
            'request_data' => $request->all(),
            'current_biaya' => $biayaRow->toArray()
        ]);

        // 🔥 SIMPLE VALIDATION: Allow ALL fields to be nullable
        $request->validate([
            'transport_pesawat_non_pp_pagu' => 'nullable|numeric|min:0',
            'transport_pesawat_non_pp_aktual' => 'nullable|numeric|min:0',
            'transport_taksi_pagu' => 'nullable|numeric|min:0',
            'transport_taksi_aktual' => 'nullable|numeric|min:0',
            'penginapan_jumlah_malam' => 'nullable|integer|min:0',
            'penginapan_pagu_perhari' => 'nullable|numeric|min:0',
            'penginapan_aktual_perhari' => 'nullable|numeric|min:0',
            'uang_harian_meeting_fullboard_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_meeting_fullboard_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_meeting_fullboard_aktual_perhari' => 'nullable|numeric|min:0',
            'uang_harian_meeting_fullday_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_meeting_fullday_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_meeting_fullday_aktual_perhari' => 'nullable|numeric|min:0',
            'uang_harian_luar_kota_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_luar_kota_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_luar_kota_aktual_perhari' => 'nullable|numeric|min:0',
            'uang_harian_dalam_kota_jumlah_hari' => 'nullable|integer|min:0',
            'uang_harian_dalam_kota_pagu_perhari' => 'nullable|numeric|min:0',
            'uang_harian_dalam_kota_aktual_perhari' => 'nullable|numeric|min:0',
            'representasi_luar_kota_jumlah_hari' => 'nullable|integer|min:0',
            'representasi_luar_kota_pagu_perhari' => 'nullable|numeric|min:0',
            'representasi_luar_kota_aktual_perhari' => 'nullable|numeric|min:0',
            'representasi_dalam_kota_jumlah_hari' => 'nullable|integer|min:0',
            'representasi_dalam_kota_pagu_perhari' => 'nullable|numeric|min:0',
            'representasi_dalam_kota_aktual_perhari' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // 🔥 SMART UPDATE: Only update fields that are actually sent
            $updateData = [];

            // Transportasi fields - update only if sent
            if ($request->has('transport_pesawat_non_pp_pagu')) {
                $updateData['transport_pesawat_non_pp_pagu'] = (float) $request->input('transport_pesawat_non_pp_pagu');
            }
            if ($request->has('transport_pesawat_non_pp_aktual')) {
                $updateData['transport_pesawat_non_pp_aktual'] = (float) $request->input('transport_pesawat_non_pp_aktual');
            }
            if ($request->has('transport_taksi_pagu')) {
                $updateData['transport_taksi_pagu'] = (float) $request->input('transport_taksi_pagu');
            }
            if ($request->has('transport_taksi_aktual')) {
                $updateData['transport_taksi_aktual'] = (float) $request->input('transport_taksi_aktual');
            }

            // Penginapan fields - update only if sent
            if ($request->has('penginapan_jumlah_malam')) {
                $updateData['penginapan_jumlah_malam'] = (int) $request->input('penginapan_jumlah_malam');
            }
            if ($request->has('penginapan_pagu_perhari')) {
                $updateData['penginapan_pagu_perhari'] = (float) $request->input('penginapan_pagu_perhari');
            }
            if ($request->has('penginapan_aktual_perhari')) {
                $updateData['penginapan_aktual_perhari'] = (float) $request->input('penginapan_aktual_perhari');
            }

            // Uang Harian Meeting Fullboard
            if ($request->has('uang_harian_meeting_fullboard_jumlah_hari')) {
                $updateData['uang_harian_meeting_fullboard_jumlah_hari'] = (int) $request->input('uang_harian_meeting_fullboard_jumlah_hari');
            }
            if ($request->has('uang_harian_meeting_fullboard_pagu_perhari')) {
                $updateData['uang_harian_meeting_fullboard_pagu_perhari'] = (float) $request->input('uang_harian_meeting_fullboard_pagu_perhari');
            }
            if ($request->has('uang_harian_meeting_fullboard_aktual_perhari')) {
                $updateData['uang_harian_meeting_fullboard_aktual_perhari'] = (float) $request->input('uang_harian_meeting_fullboard_aktual_perhari');
            }

            // Uang Harian Meeting Fullday
            if ($request->has('uang_harian_meeting_fullday_jumlah_hari')) {
                $updateData['uang_harian_meeting_fullday_jumlah_hari'] = (int) $request->input('uang_harian_meeting_fullday_jumlah_hari');
            }
            if ($request->has('uang_harian_meeting_fullday_pagu_perhari')) {
                $updateData['uang_harian_meeting_fullday_pagu_perhari'] = (float) $request->input('uang_harian_meeting_fullday_pagu_perhari');
            }
            if ($request->has('uang_harian_meeting_fullday_aktual_perhari')) {
                $updateData['uang_harian_meeting_fullday_aktual_perhari'] = (float) $request->input('uang_harian_meeting_fullday_aktual_perhari');
            }

            // Uang Harian Luar Kota
            if ($request->has('uang_harian_luar_kota_jumlah_hari')) {
                $updateData['uang_harian_luar_kota_jumlah_hari'] = (int) $request->input('uang_harian_luar_kota_jumlah_hari');
            }
            if ($request->has('uang_harian_luar_kota_pagu_perhari')) {
                $updateData['uang_harian_luar_kota_pagu_perhari'] = (float) $request->input('uang_harian_luar_kota_pagu_perhari');
            }
            if ($request->has('uang_harian_luar_kota_aktual_perhari')) {
                $updateData['uang_harian_luar_kota_aktual_perhari'] = (float) $request->input('uang_harian_luar_kota_aktual_perhari');
            }

            // Uang Harian Dalam Kota
            if ($request->has('uang_harian_dalam_kota_jumlah_hari')) {
                $updateData['uang_harian_dalam_kota_jumlah_hari'] = (int) $request->input('uang_harian_dalam_kota_jumlah_hari');
            }
            if ($request->has('uang_harian_dalam_kota_pagu_perhari')) {
                $updateData['uang_harian_dalam_kota_pagu_perhari'] = (float) $request->input('uang_harian_dalam_kota_pagu_perhari');
            }
            if ($request->has('uang_harian_dalam_kota_aktual_perhari')) {
                $updateData['uang_harian_dalam_kota_aktual_perhari'] = (float) $request->input('uang_harian_dalam_kota_aktual_perhari');
            }

            // Representasi Luar Kota
            if ($request->has('representasi_luar_kota_jumlah_hari')) {
                $updateData['representasi_luar_kota_jumlah_hari'] = (int) $request->input('representasi_luar_kota_jumlah_hari');
            }
            if ($request->has('representasi_luar_kota_pagu_perhari')) {
                $updateData['representasi_luar_kota_pagu_perhari'] = (float) $request->input('representasi_luar_kota_pagu_perhari');
            }
            if ($request->has('representasi_luar_kota_aktual_perhari')) {
                $updateData['representasi_luar_kota_aktual_perhari'] = (float) $request->input('representasi_luar_kota_aktual_perhari');
            }

            // Representasi Dalam Kota
            if ($request->has('representasi_dalam_kota_jumlah_hari')) {
                $updateData['representasi_dalam_kota_jumlah_hari'] = (int) $request->input('representasi_dalam_kota_jumlah_hari');
            }
            if ($request->has('representasi_dalam_kota_pagu_perhari')) {
                $updateData['representasi_dalam_kota_pagu_perhari'] = (float) $request->input('representasi_dalam_kota_pagu_perhari');
            }
            if ($request->has('representasi_dalam_kota_aktual_perhari')) {
                $updateData['representasi_dalam_kota_aktual_perhari'] = (float) $request->input('representasi_dalam_kota_aktual_perhari');
            }

            \Log::info('🔥 UPDATE DATA PREPARED', [
                'updateData' => $updateData,
                'updateCount' => count($updateData)
            ]);

            // Perform update
            $biayaRow->update($updateData);

            // Refresh model to get updated values
            $biayaRow->refresh();

            // 🔥 CRITICAL: Calculate and update ALL totals after simplified update
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

            \Log::info('💾 SIMPLIFIED UPDATE: TOTALS CALCULATED', [
                'biayaId' => $biayaId,
                'totals_update' => $allTotalsUpdate
            ]);

            $biayaRow->update($allTotalsUpdate);

            // Update nominatif totals
            $this->updateNominatifTotals($biayaRow->detailRow->nominatif_id);

            DB::commit();

            \Log::info('✅ BIAYA ROW UPDATED SUCCESSFULLY', [
                'biayaId' => $biayaId,
                'updatedData' => $updateData,
                'result' => $biayaRow->toArray()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Biaya row updated successfully',
                'data' => $biayaRow
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('❌ BIAYA ROW UPDATE FAILED', [
                'biayaId' => $biayaId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update biaya row: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }
}