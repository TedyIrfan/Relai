<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SbmFile extends Model
{
    protected $fillable = [
        'file_name',
        'original_filename',
        'total_sheets',
        'total_rows',
        'uploaded_by',
        'upload_date',
        'status',
        'description'
    ];

    protected $casts = [
        'upload_date' => 'date',
        'total_sheets' => 'integer',
        'total_rows' => 'integer'
    ];

    public function sheets()
    {
        return $this->hasMany(SbmSheet::class, 'sbm_file_id');
    }
}
