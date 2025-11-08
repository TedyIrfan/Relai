<?php

namespace App\Http\Controllers;

use App\Models\RutePerjalananNominatif;
use App\Models\Nominatif;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class RutePerjalananController extends Controller
{
    /**
     * Get route by nominatif ID
     */
    public function show($nominatifId): JsonResponse
    {
        try {
            $nominatif = Nominatif::findOrFail($nominatifId);

            // Check if user has permission to access this nominatif
            if ($nominatif->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this nominatif'
                ], 403);
            }

            $route = RutePerjalananNominatif::where('master_nominatif_id', $nominatifId)->first();

            if (!$route) {
                return response()->json([
                    'success' => false,
                    'message' => 'Route not found for this nominatif'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $route->load('masterNominatif')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get route: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store new route
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'master_nominatif_id' => 'required|exists:master_nominatifs,id',
                'total_hari' => 'required|integer|min:1|max:365',
                'tanggal_mulai' => 'required|date',
                'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
                'dari' => 'string|max:100',
                'pulang' => 'string|max:100',
                'tujuan_list' => 'required|array',
                'tujuan_list.*' => 'required|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation Error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();

            // Validate business logic
            $validationErrors = RutePerjalananNominatif::validateRouteData($data);
            if (!empty($validationErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation Error',
                    'errors' => $validationErrors
                ], 422);
            }

            // Check if nominatif exists and user has permission
            $nominatif = Nominatif::findOrFail($data['master_nominatif_id']);
            if ($nominatif->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to create route for this nominatif'
                ], 403);
            }

            // Check if route already exists
            $existingRoute = RutePerjalananNominatif::where('master_nominatif_id', $data['master_nominatif_id'])->first();
            if ($existingRoute) {
                return response()->json([
                    'success' => false,
                    'message' => 'Route already exists for this nominatif'
                ], 400);
            }

            // Set default values
            $data['dari'] = $data['dari'] ?? 'Jakarta';
            $data['pulang'] = $data['pulang'] ?? 'Jakarta';

            $route = RutePerjalananNominatif::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Route created successfully',
                'data' => $route->load('masterNominatif')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create route: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update existing route
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $route = RutePerjalananNominatif::findOrFail($id);

            // Check permission
            if ($route->masterNominatif->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this route'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'total_hari' => 'integer|min:1|max:365',
                'tanggal_mulai' => 'date',
                'tanggal_selesai' => 'date|after_or_equal:tanggal_mulai',
                'dari' => 'string|max:100',
                'pulang' => 'string|max:100',
                'tujuan_list' => 'array',
                'tujuan_list.*' => 'string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation Error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();

            // Validate business logic
            $validationErrors = RutePerjalananNominatif::validateRouteData(array_merge($route->toArray(), $data));
            if (!empty($validationErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation Error',
                    'errors' => $validationErrors
                ], 422);
            }

            $route->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Route updated successfully',
                'data' => $route->load('masterNominatif')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update route: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete route
     */
    public function destroy($id): JsonResponse
    {
        try {
            $route = RutePerjalananNominatif::findOrFail($id);

            // Check permission
            if ($route->masterNominatif->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this route'
                ], 403);
            }

            $route->delete();

            return response()->json([
                'success' => true,
                'message' => 'Route deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete route: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get route with formatted string for display
     */
    public function getFormattedRoute($nominatifId): JsonResponse
    {
        try {
            $route = RutePerjalananNominatif::where('master_nominatif_id', $nominatifId)->first();

            if (!$route) {
                return response()->json([
                    'success' => false,
                    'message' => 'Route not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $route->id,
                    'complete_route' => $route->complete_route,
                    'route_description' => $route->route_description,
                    'destination_count' => $route->destination_count,
                    'is_single_day' => $route->is_single_day(),
                    'destinations' => $route->tujuan_list,
                    'total_hari' => $route->total_hari,
                    'tanggal_mulai' => $route->tanggal_mulai,
                    'tanggal_selesai' => $route->tanggal_selesai,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get formatted route: ' . $e->getMessage()
            ], 500);
        }
    }
}