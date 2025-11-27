<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NominatifNewController;
use App\Http\Controllers\NominatifDetailRowController;
use App\Http\Controllers\NominatifBiayaRowController;
use App\Http\Controllers\NominatifEvidenceController;

/*
|--------------------------------------------------------------------------
| API Routes - Nominatif System (New Architecture)
|--------------------------------------------------------------------------
|
| These routes handle the new nominatif system with separated tables
| for better performance and scalability.
|
*/

// Main Nominatif CRUD
Route::prefix('nominatifs-new')->group(function () {
    Route::get('/', [NominatifNewController::class, 'index']);
    Route::post('/', [NominatifNewController::class, 'store']);
    Route::get('/{id}', [NominatifNewController::class, 'show']);
    Route::put('/{id}', [NominatifNewController::class, 'update']);
    Route::delete('/{id}', [NominatifNewController::class, 'destroy']);
    Route::post('/{id}/submit', [NominatifNewController::class, 'submit']);
    Route::get('/by-rka/{rkaId}', [NominatifNewController::class, 'getByRka']);
});

// Detail Rows (Person + Route Data)
Route::prefix('nominatifs/{nominatifId}/details')->group(function () {
    Route::get('/', [NominatifDetailRowController::class, 'index']);
    Route::post('/', [NominatifDetailRowController::class, 'store']);
    Route::get('/{rowId}', [NominatifDetailRowController::class, 'show']);
    Route::put('/{rowId}', [NominatifDetailRowController::class, 'update']);
    Route::delete('/{rowId}', [NominatifDetailRowController::class, 'destroy']);
    Route::post('/bulk', [NominatifDetailRowController::class, 'bulkStore']);
    Route::put('/bulk', [NominatifDetailRowController::class, 'bulkUpdate']);
});

// Biaya Rows (Financial Data) - Lazy Loading
Route::prefix('nominatifs/details/{detailRowId}/biaya')->group(function () {
    Route::get('/', [NominatifBiayaRowController::class, 'index']);
    Route::post('/', [NominatifBiayaRowController::class, 'store']);
    Route::get('/{biayaId}', [NominatifBiayaRowController::class, 'show']);
    Route::put('/{biayaId}/simplified', [NominatifBiayaRowController::class, 'updateSimplified']); // 🔥 FIXED: Put specific route first!
    Route::put('/{biayaId}', [NominatifBiayaRowController::class, 'update']);
    Route::delete('/{biayaId}', [NominatifBiayaRowController::class, 'destroy']);
});

// Evidence (File Upload) - On Demand Loading
Route::prefix('nominatifs/{nominatifId}/evidence')->group(function () {
    Route::get('/', [NominatifEvidenceController::class, 'index']);
    Route::post('/', [NominatifEvidenceController::class, 'store']);
    Route::get('/all', [NominatifEvidenceController::class, 'getAllEvidence']);
    Route::get('/{evidenceId}', [NominatifEvidenceController::class, 'show']);
    Route::put('/{evidenceId}', [NominatifEvidenceController::class, 'update']);
    Route::delete('/{evidenceId}', [NominatifEvidenceController::class, 'destroy']);
    Route::get('/{evidenceId}/download', [NominatifEvidenceController::class, 'download']);
});

// Evidence for specific detail row
Route::prefix('nominatifs/{nominatifId}/details/{detailRowId}/evidence')->group(function () {
    Route::post('/', [NominatifEvidenceController::class, 'storeWithDetailRow']);
});

// Utility Routes
Route::prefix('nominatifs-new/utilities')->group(function () {
    Route::get('/search', [NominatifNewController::class, 'search']);
    Route::get('/statistics', [NominatifNewController::class, 'statistics']);
    Route::get('/export/{id}', [NominatifNewController::class, 'export']);
});

// Validation Routes
Route::prefix('nominatifs-new/validate')->group(function () {
    Route::post('/detail-row', [NominatifDetailRowController::class, 'validate']);
    Route::post('/biaya-row', [NominatifBiayaRowController::class, 'validate']);
    Route::post('/evidence', [NominatifEvidenceController::class, 'validate']);
});