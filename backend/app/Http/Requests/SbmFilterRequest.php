<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SbmFilterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Already authenticated via sanctum middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Pagination
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',

            // Sorting
            'sort_by' => 'nullable|in:id,no,provinsi,uraian,besaran',
            'order' => 'nullable|in:asc,desc',

            // Filters
            'provinsi' => 'nullable|string|max:255',
            'grouping' => 'nullable|string|max:255',
            'sub_category' => 'nullable|string|max:255',

            // Search
            'search' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get validated data with default values
     */
    public function getValidatedData(): array
    {
        $data = $this->validated();

        // Set default values
        $data['per_page'] = $data['per_page'] ?? 15;
        $data['sort_by'] = $data['sort_by'] ?? 'id';
        $data['order'] = $data['order'] ?? 'asc';
        $data['page'] = $data['page'] ?? 1;

        return $data;
    }
}
