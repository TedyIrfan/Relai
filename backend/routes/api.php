<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

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

// Dashboard API Routes (Protected - for production)
Route::get('/secure/dashboard', [DashboardController::class, 'index'])->middleware('auth:sanctum');
Route::get('/secure/dashboard/kpi', [DashboardController::class, 'kpi'])->middleware('auth:sanctum');
Route::get('/secure/dashboard/charts', [DashboardController::class, 'charts'])->middleware('auth:sanctum');

Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!',
        'timestamp' => now()->toDateTimeString()
    ]);
});