<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SbmSheet extends Model
{
    protected $fillable = [
        'sbm_file_id',
        'name',
        'sheet_index',
        'headers'
    ];

    protected $casts = [
        'headers' => 'array',
        'sheet_index' => 'integer'
    ];

    public function file()
    {
        return $this->belongsTo(SbmFile::class, 'sbm_file_id');
    }

    public function data()
    {
        return $this->hasMany(SbmSheetData::class, 'sbm_sheet_id');
    }
}
