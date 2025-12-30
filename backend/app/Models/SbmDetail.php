<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SbmDetail extends Model
{
    protected $table = 'sbm_details';

    protected $fillable = [
        'category',
        'sub_category',
        'parent_section',
        'grouping_label',
        'sbm_number',
        'source_file',
        'display_order',
        'data',
        'currency',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    /**
     * Scope untuk filter by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}
