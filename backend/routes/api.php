<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RKADetailsController;
use App\Http\Controllers\SwaggerController;
use App\Http\Controllers\AnggaranController;
// use App\Http\Controllers\NominatifController; // Disabled (migrated to new 4-table system)
// use App\Http\Controllers\RutePerjalananController; // REMOVED (old system)
// use App\Http\Controllers\DebugController; // REMOVED (old system debug)
// use App\Http\Controllers\PenginapanController; // Controller not available
// use App\Http\Controllers\PenginapanTambahanOrangController; // REMOVED (old system)
use App\Http\Controllers\NominatifNewController;
use App\Http\Controllers\NominatifDetailRowController;
use App\Http\Controllers\NominatifBiayaRowController;
use App\Http\Controllers\NominatifEvidenceController;
use App\Http\Controllers\Api\NonNominatifController;
use App\Http\Controllers\SbmController;

// Test endpoint for Swagger
Route::get('/test', [SwaggerController::class, 'test']);

// Authentication Routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/create-user', [AuthController::class, 'createUser']);

// NEW NOMINATIF SYSTEM (Phase 2) - Separated Tables Architecture (Manual Token Validation)
Route::prefix('nominatifs-new')->group(function () {
    Route::get('/', [NominatifNewController::class, 'index']);
    Route::post('/', [NominatifNewController::class, 'store']);
    Route::get('/{id}', [NominatifNewController::class, 'show']);
    Route::put('/{id}', [NominatifNewController::class, 'update']);
    Route::delete('/{id}', [NominatifNewController::class, 'destroy']);
    Route::post('/{id}/submit', [NominatifNewController::class, 'submit']);
    Route::get('/search', [NominatifNewController::class, 'search']);
    Route::get('/statistics', [NominatifNewController::class, 'statistics']);
});

// Detail Rows (Person + Route Data) - Manual Token Validation
Route::prefix('nominatifs/{nominatifId}/details')->group(function () {
    Route::get('/', [NominatifDetailRowController::class, 'index']);
    Route::post('/', [NominatifDetailRowController::class, 'store']);
    Route::post('/validate', [NominatifDetailRowController::class, 'validateDraftData']);
    Route::post('/execute', [NominatifDetailRowController::class, 'executeDraft']);
    Route::post('/bulk', [NominatifDetailRowController::class, 'bulkStore']);
    Route::put('/bulk', [NominatifDetailRowController::class, 'bulkUpdate']); // Keep for backward compatibility
    Route::get('/{rowId}', [NominatifDetailRowController::class, 'show']);
    Route::put('/{rowId}', [NominatifDetailRowController::class, 'update']);
    Route::delete('/{rowId}', [NominatifDetailRowController::class, 'destroy']);
});

// Biaya Rows (Financial Data) - Manual Token Validation
Route::prefix('nominatifs/details/{detailRowId}/biaya')->group(function () {
    Route::get('/', [NominatifBiayaRowController::class, 'index']);
    Route::post('/', [NominatifBiayaRowController::class, 'store']);
    Route::get('/{biayaId}', [NominatifBiayaRowController::class, 'show']);
    Route::put('/{biayaId}/simplified', [NominatifBiayaRowController::class, 'updateSimplified']); // 🔥 FIXED: Add simplified endpoint
    Route::put('/{biayaId}', [NominatifBiayaRowController::class, 'update']);
    Route::delete('/{biayaId}', [NominatifBiayaRowController::class, 'destroy']);
});

// NON-NOMINATIF SYSTEM - Sanctum Token Validation
Route::middleware('auth:sanctum')->apiResource('non-nominatifs', NonNominatifController::class);
Route::middleware('auth:sanctum')->post('non-nominatifs/{id}/submit', [NonNominatifController::class, 'submit']);

// Evidence (File Upload) - Manual Token Validation
Route::prefix('nominatifs/{nominatifId}/evidence')->group(function () {
    Route::get('/', [NominatifEvidenceController::class, 'index']);
    Route::get('/all', [NominatifEvidenceController::class, 'getAllEvidence']); // With file type info
    // 🔥 DEPRECATED: Removed 'store' route - use specific detail row route below
    // Route::post('/', [NominatifEvidenceController::class, 'store']); // REMOVED
    Route::get('/{evidenceId}', [NominatifEvidenceController::class, 'show']);
    Route::put('/{evidenceId}', [NominatifEvidenceController::class, 'update']);
    Route::delete('/{evidenceId}', [NominatifEvidenceController::class, 'destroy']);
    Route::get('/{evidenceId}/download', [NominatifEvidenceController::class, 'download']);
});

// 🔥 FIXED: Evidence for specific detail row (route yang dipanggil frontend)
Route::prefix('nominatifs/{nominatifId}/details/{detailRowId}/evidence')->group(function () {
    Route::post('/', [NominatifEvidenceController::class, 'storeWithDetailRow']);
});

// User CRUD Routes (Protected)
Route::middleware('auth:sanctum')->group(function () {
    // Authenticated user routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Complete User CRUD Operations
    Route::get('/users', [AuthController::class, 'index']);  // GET all users
    Route::get('/users/{id}', [AuthController::class, 'show']);  // GET single user
    Route::put('/users/{id}', [AuthController::class, 'update']);  // UPDATE user
    Route::delete('/users/{id}', [AuthController::class, 'destroy']);  // DELETE user
    Route::post('/users/bulk-action', [AuthController::class, 'bulkAction']);  // BULK operations

    // Anggaran CRUD Operations
    Route::get('/anggarans', [AnggaranController::class, 'index']);      // GET all anggarans
    Route::get('/anggarans/{id}', [AnggaranController::class, 'show']);    // GET single anggaran
    Route::post('/anggarans', [AnggaranController::class, 'store']);      // CREATE anggaran
    Route::put('/anggarans/{id}', [AnggaranController::class, 'update']);  // UPDATE anggaran
    Route::delete('/anggarans/{id}', [AnggaranController::class, 'destroy']); // DELETE anggaran

    // SBM (Master Standar Biaya Masukan) API Routes
    Route::prefix('sbm')->group(function () {
        // Specific routes first (to avoid conflicts with dynamic routes)
        Route::get('/categories', [SbmController::class, 'categories']);           // Get all categories
        Route::get('/summary', [SbmController::class, 'summary']);                  // Get summary statistics
        Route::get('/filters/options', [SbmController::class, 'filters']);          // Get filter options (all)
        Route::get('/filters/{category}', [SbmController::class, 'filtersByCategory']); // Get filter options by category
        Route::get('/detail/{id}', [SbmController::class, 'detail']);               // Get single record by ID

        // Dynamic routes last (must be at the bottom to avoid catching specific routes)
        Route::get('/{category}', [SbmController::class, 'show']);                  // Get data by category
    });

    // OLD NOMINATIF OPERATIONS - Disabled (migrated to new 4-table system)
    // Route::get('/nominatifs', [NominatifController::class, 'index']);       // GET all nominatifs
    // Route::post('/nominatifs', [NominatifController::class, 'store']);      // CREATE nominatif
    // Route::get('/nominatifs/{id}', [NominatifController::class, 'show']);     // GET single nominatif
    // Route::put('/nominatifs/{id}', [NominatifController::class, 'update']);   // UPDATE nominatif
    // Route::post('/nominatifs/{id}/submit', [NominatifController::class, 'submit']); // SUBMIT nominatif
    // Route::delete('/nominatifs/{id}', [NominatifController::class, 'destroy']); // DELETE nominatif
    // Route::delete('/nominatifs/{id}/tambahan-orang', [NominatifController::class, 'deleteTambahanOrang']); // DELETE all tambahan orang

    // Legacy Penginapan Routes - Disabled (migrated to new 4-table system)
    // Route::get('/nominatifs/{id}/penginapan', [NominatifController::class, 'getPenginapan']); // GET all penginapan for nominatif
    // Route::post('/nominatifs/{id}/penginapan', [NominatifController::class, 'savePenginapan']); // SAVE/UPDATE penginapan
    // Route::put('/nominatifs/penginapan/{penginapanId}', [NominatifController::class, 'updatePenginapan']); // UPDATE specific penginapan
    // Route::delete('/nominatifs/penginapan/{penginapanId}', [NominatifController::class, 'deletePenginapan']); // DELETE penginapan
    // Route::post('/nominatifs/{id}/penginapan/generate', [NominatifController::class, 'generatePenginapanFromRute']); // GENERATE from rute

    // Rute Perjalanan CRUD Operations - REMOVED (old system)
    // Route::get('/rute-perjalanan/{nominatif_id}', [RutePerjalananController::class, 'show']); // GET route by nominatif
    // Route::get('/rute-perjalanan/{nominatif_id}/formatted', [RutePerjalananController::class, 'getFormattedRoute']); // GET formatted route
    // Route::post('/rute-perjalanan', [RutePerjalananController::class, 'store']); // CREATE route
    // Route::put('/rute-perjalanan/{id}', [RutePerjalananController::class, 'update']); // UPDATE route
    // Route::delete('/rute-perjalanan/{id}', [RutePerjalananController::class, 'destroy']); // DELETE route

    // Penginapan CRUD Operations (Master Nominatif) - DISABLED (Controller not available)
    // Route::get('/penginapan/{master_nominatif_id}', [PenginapanController::class, 'index']); // GET penginapan for master
    // Route::post('/penginapan/generate-from-rute', [PenginapanController::class, 'generateFromRute']); // GENERATE from rute
    // Route::get('/penginapan/{master_nominatif_id}/summary', [PenginapanController::class, 'getSummary']); // GET summary
    // Route::put('/penginapan/{id}', [PenginapanController::class, 'update']); // UPDATE penginapan
    // Route::put('/penginapan/batch-update', [PenginapanController::class, 'batchUpdate']); // BATCH UPDATE
    // Route::delete('/penginapan/{id}', [PenginapanController::class, 'destroy']); // DELETE penginapan

    // Penginapan CRUD Operations (Tambahan Orang) - DISABLED (Controller not available)
    // Route::get('/penginapan/tambahan-orang/{tambahan_orang_nominatif_id}', [PenginapanController::class, 'indexTambahanOrang']); // GET penginapan for tambahan orang
    // Route::post('/penginapan/tambahan-orang/generate-from-rute', [PenginapanController::class, 'generateFromRuteTambahanOrang']); // GENERATE for tambahan orang
    // Route::put('/penginapan/tambahan-orang/{id}', [PenginapanController::class, 'updateTambahanOrang']); // UPDATE tambahan orang
    // Route::delete('/penginapan/tambahan-orang/{id}', [PenginapanController::class, 'destroyTambahanOrang']); // DELETE tambahan orang

    // Penginapan Tambahan Orang CRUD Operations - REMOVED (old system)
    // Route::get('/penginapan-tambahan-orang/by-tambahan-orang/{tambahanOrangId}', [PenginapanTambahanOrangController::class, 'getByTambahanOrang']); // GET all penginapan for tambahan orang
    // Route::post('/penginapan-tambahan-orang', [PenginapanTambahanOrangController::class, 'store']); // CREATE penginapan record
    // Route::get('/penginapan-tambahan-orang/{id}', [PenginapanTambahanOrangController::class, 'show']); // GET single penginapan record
    // Route::put('/penginapan-tambahan-orang/{id}', [PenginapanTambahanOrangController::class, 'update']); // UPDATE penginapan record
    // Route::delete('/penginapan-tambahan-orang/{id}', [PenginapanTambahanOrangController::class, 'destroy']); // DELETE penginapan record
});

// Dashboard API Routes (Public - for testing)
Route::get('/dashboard', [DashboardController::class, 'index']);
Route::get('/dashboard/{tahun}', [DashboardController::class, 'index']);
Route::get('/dashboard/kpi', [DashboardController::class, 'kpi']);
Route::get('/dashboard/charts', [DashboardController::class, 'charts']);

// Seed Data Routes
Route::get('/seed', [DashboardController::class, 'seedData']);

// Kategori Anggaran API Routes (Real-time Updates)
Route::get('/kategori/{tahun}', [DashboardController::class, 'getKategoriByTahun']);
Route::post('/kategori/{tahun}/{kategori}/update-terpakai', [DashboardController::class, 'updateAnggaranTerpakai']);
Route::post('/kategori/{tahun}/{kategori}/update-sp2d', [DashboardController::class, 'updateSP2D']);
Route::post('/kategori/{tahun}/sync', [DashboardController::class, 'syncMainAnggaran']);

// RKA Details API Routes
Route::get('/rka-details', [RKADetailsController::class, 'index']);
Route::post('/rka-details/import', [RKADetailsController::class, 'importExcel']);
Route::get('/rka-details/kategori', [RKADetailsController::class, 'getKategoriList']);

// Debug Routes (No auth required for debugging) - REMOVED (old system)
// Route::get('/debug/nominatif', [DebugController::class, 'nominatifDebug']);
// Route::get('/debug/nominatif/{id}', [DebugController::class, 'nominatifDebug']);
// Route::post('/debug/nominatif/{id}/calculate', [DebugController::class, 'testCalculate']);


// Dashboard API Routes (Protected - for production)
Route::get('/secure/dashboard', [DashboardController::class, 'index'])->middleware('auth:sanctum');
Route::get('/secure/dashboard/kpi', [DashboardController::class, 'kpi'])->middleware('auth:sanctum');
Route::get('/secure/dashboard/charts', [DashboardController::class, 'charts'])->middleware('auth:sanctum');

// RKA Details API Routes (Protected - for production)
Route::get('/secure/rka-details', [RKADetailsController::class, 'index'])->middleware('auth:sanctum');
Route::post('/secure/rka-details/import', [RKADetailsController::class, 'importExcel'])->middleware('auth:sanctum');

Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!',
        'timestamp' => now()->toDateTimeString()
    ]);
});

// Include new nominatif system routes
require __DIR__.'/api_nominatifs_new.php';