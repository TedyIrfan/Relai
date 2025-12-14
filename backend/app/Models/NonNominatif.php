<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NonNominatif extends Model
{
    use HasFactory;

    protected $fillable = [
        'rka_detail_id',
        'user_id',
        'deskripsi_kegiatan',
        'tanggal',
        'total_anggaran_terpakai',
        'evidence_link',
        'status'
    ];

    protected $casts = [
        'total_anggaran_terpakai' => 'decimal:2',
        'tanggal' => 'date'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function rkaDetail()
    {
        return $this->belongsTo(RkaDetail::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}