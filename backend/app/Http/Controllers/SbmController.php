<?php

namespace App\Http\Controllers;

use App\Http\Resources\SbmDetailResource;
use App\Http\Requests\SbmFilterRequest;
use App\Services\SbmApiService;
use Illuminate\Http\Request;

class SbmController extends Controller
{
    protected SbmApiService $service;

    public function __construct(SbmApiService $service)
    {
        $this->service = $service;
    }

    /**
     * GET /api/sbm/categories
     * Get all categories dengan metadata
     */
    public function categories()
    {
        $categories = $this->service->getAllCategories();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * GET /api/sbm/{category}
     * Get data by category dengan filter, search, sort, pagination
     */
    public function show(string $category, SbmFilterRequest $request)
    {
        // Cek apakah category valid
        $validCategories = array_column($this->service->getAllCategories(), 'category');
        if (!in_array($category, $validCategories)) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found',
            ], 404);
        }

        // Panggil service untuk get data
        $data = $this->service->getByCategory($category, $request->getValidatedData());

        // Return dengan Resource (pagination meta auto-include by Laravel)
        return SbmDetailResource::collection($data)
            ->additional([
                'success' => true,
                'meta' => [
                    'category' => $category,
                ],
            ]);
    }

    /**
     * GET /api/sbm/filters
     * Get available filter options (all categories)
     */
    public function filters()
    {
        $options = $this->service->getFilterOptions();

        return response()->json([
            'success' => true,
            'data' => $options,
        ]);
    }

    /**
     * GET /api/sbm/filters/{category}
     * Get filter options for specific category
     */
    public function filtersByCategory(string $category)
    {
        // Cek apakah category valid
        $validCategories = array_column($this->service->getAllCategories(), 'category');
        if (!in_array($category, $validCategories)) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found',
            ], 404);
        }

        $options = $this->service->getFilterOptionsByCategory($category);

        return response()->json([
            'success' => true,
            'data' => $options,
        ]);
    }

    /**
     * GET /api/sbm/summary
     * Get summary statistics
     */
    public function summary()
    {
        $summary = $this->service->getSummary();

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }

    /**
     * GET /api/sbm/detail/{id}
     * Get single record by ID
     */
    public function detail(int $id)
    {
        $record = $this->service->getById($id);

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Record not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new SbmDetailResource($record),
        ]);
    }
}
