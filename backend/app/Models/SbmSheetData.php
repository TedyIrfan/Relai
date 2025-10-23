<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SbmSheetData extends Model
{
    protected $fillable = [
        'sbm_sheet_id',
        'row_data'
    ];

    protected $casts = [
        'row_data' => 'array'
    ];

    public function sheet()
    {
        return $this->belongsTo(SbmSheet::class, 'sbm_sheet_id');
    }
}
