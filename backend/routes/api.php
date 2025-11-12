<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RKADetailsController;
use App\Http\Controllers\SwaggerController;
use App\Http\Controllers\AnggaranController;
use App\Http\Controllers\NominatifController;
use App\Http\Controllers\RutePerjalananController;
use App\Http\Controllers\DebugController;
use App\Http\Controllers\PenginapanController;

// Test endpoint for Swagger
Route::get('/test', [SwaggerController::class, 'test']);

// Authentication Routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/create-user', [AuthController::class, 'createUser']);

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

    // Nominatif CRUD Operations
    Route::get('/nominatifs', [NominatifController::class, 'index']);       // GET all nominatifs
    Route::post('/nominatifs', [NominatifController::class, 'store']);      // CREATE nominatif
    Route::get('/nominatifs/{id}', [NominatifController::class, 'show']);     // GET single nominatif
    Route::put('/nominatifs/{id}', [NominatifController::class, 'update']);   // UPDATE nominatif
    Route::post('/nominatifs/{id}/submit', [NominatifController::class, 'submit']); // SUBMIT nominatif
    Route::delete('/nominatifs/{id}', [NominatifController::class, 'destroy']); // DELETE nominatif
    Route::delete('/nominatifs/{id}/tambahan-orang', [NominatifController::class, 'deleteTambahanOrang']); // DELETE all tambahan orang

    // Tambahan Orang API Routes (New Normalized Structure)
    Route::get('/nominatifs/{id}/tambahan-orang', [NominatifController::class, 'getTambahanOrang']); // GET all tambahan orang for nominatif
    Route::post('/nominatifs/{id}/tambahan-orang', [NominatifController::class, 'saveTambahanOrang']); // SAVE tambahan orang
    Route::put('/nominatifs/tambahan-orang/{id}', [NominatifController::class, 'updateTambahanOrang']); // UPDATE specific tambahan orang
    Route::delete('/nominatifs/{id}/tambahan-orang/{tambahanOrangId}', [NominatifController::class, 'deleteTambahanOrangById']); // DELETE specific tambahan orang

    // Rute Perjalanan CRUD Operations
    Route::get('/rute-perjalanan/{nominatif_id}', [RutePerjalananController::class, 'show']); // GET route by nominatif
    Route::get('/rute-perjalanan/{nominatif_id}/formatted', [RutePerjalananController::class, 'getFormattedRoute']); // GET formatted route
    Route::post('/rute-perjalanan', [RutePerjalananController::class, 'store']); // CREATE route
    Route::put('/rute-perjalanan/{id}', [RutePerjalananController::class, 'update']); // UPDATE route
    Route::delete('/rute-perjalanan/{id}', [RutePerjalananController::class, 'destroy']); // DELETE route

    // Penginapan CRUD Operations (Master Nominatif)
    Route::get('/penginapan/{master_nominatif_id}', [PenginapanController::class, 'index']); // GET penginapan for master
    Route::post('/penginapan/generate-from-rute', [PenginapanController::class, 'generateFromRute']); // GENERATE from rute
    Route::get('/penginapan/{master_nominatif_id}/summary', [PenginapanController::class, 'getSummary']); // GET summary
    Route::put('/penginapan/{id}', [PenginapanController::class, 'update']); // UPDATE penginapan
    Route::put('/penginapan/batch-update', [PenginapanController::class, 'batchUpdate']); // BATCH UPDATE
    Route::delete('/penginapan/{id}', [PenginapanController::class, 'destroy']); // DELETE penginapan

    // Penginapan CRUD Operations (Tambahan Orang)
    Route::get('/penginapan/tambahan-orang/{tambahan_orang_nominatif_id}', [PenginapanController::class, 'indexTambahanOrang']); // GET penginapan for tambahan orang
    Route::post('/penginapan/tambahan-orang/generate-from-rute', [PenginapanController::class, 'generateFromRuteTambahanOrang']); // GENERATE for tambahan orang
    Route::put('/penginapan/tambahan-orang/{id}', [PenginapanController::class, 'updateTambahanOrang']); // UPDATE tambahan orang
    Route::delete('/penginapan/tambahan-orang/{id}', [PenginapanController::class, 'destroyTambahanOrang']); // DELETE tambahan orang
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

// Debug Routes (No auth required for debugging)
Route::get('/debug/nominatif', [DebugController::class, 'nominatifDebug']);
Route::get('/debug/nominatif/{id}', [DebugController::class, 'nominatifDebug']);
Route::post('/debug/nominatif/{id}/calculate', [DebugController::class, 'testCalculate']);


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