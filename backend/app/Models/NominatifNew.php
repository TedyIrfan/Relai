<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NominatifNew extends Model
{
    use HasFactory;

    protected $table = 'nominatifs_new';

    protected $fillable = [
        'rka_detail_id',
        'user_id',
        'deskripsi_perjalanan_dinas',
        'tanggal_mulai',
        'tanggal_selesai',
        'status',
        'total_pagu',
        'total_biaya_aktual',
        // New fields for trip calculations
        'total_pagu_trip',
        'total_aktual_trip',
        'total_anggaran_berjalan_trip',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'total_pagu' => 'decimal:2',
        'total_biaya_aktual' => 'decimal:2',
        // New fields
        'total_pagu_trip' => 'decimal:2',
        'total_aktual_trip' => 'decimal:2',
        'total_anggaran_berjalan_trip' => 'decimal:2',
    ];

    // Relationships
    public function rkaDetail()
    {
        return $this->belongsTo(RkaDetail::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function detailRows()
    {
        return $this->hasMany(NominatifDetailRow::class, 'nominatif_id')
                    ->orderBy('row_order');
    }

    public function mainPersonRows()
    {
        return $this->hasMany(NominatifDetailRow::class, 'nominatif_id')
                    ->where('person_type', 'main')
                    ->orderBy('row_order');
    }

    public function tambahanOrangRows()
    {
        return $this->hasMany(NominatifDetailRow::class, 'nominatif_id')
                    ->where('person_type', 'tambahan')
                    ->orderBy('row_order');
    }

    public function evidence()
    {
        return $this->hasMany(NominatifEvidence::class, 'nominatif_id')
                    ->orderBy('created_at', 'desc');
    }

    public function images()
    {
        return $this->hasMany(NominatifEvidence::class, 'nominatif_id')
                    ->whereIn('evidence_foto_type', ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'])
                    ->orderBy('created_at', 'desc');
    }

    public function documents()
    {
        return $this->hasMany(NominatifEvidence::class, 'nominatif_id')
                    ->where('evidence_foto_type', 'application/pdf')
                    ->orderBy('created_at', 'desc');
    }

    // Scopes
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Accessors
    public function getTotalPaguFormattedAttribute()
    {
        return 'Rp' . number_format($this->total_pagu, 0, ',', '.');
    }

    public function getTotalBiayaAktualFormattedAttribute()
    {
        return 'Rp' . number_format($this->total_biaya_aktual, 0, ',', '.');
    }

    // New accessors for trip calculations
    public function getTotalPaguTripFormattedAttribute()
    {
        return 'Rp' . number_format($this->total_pagu_trip, 0, ',', '.');
    }

    public function getTotalAktualTripFormattedAttribute()
    {
        return 'Rp' . number_format($this->total_aktual_trip, 0, ',', '.');
    }

    public function getTotalAnggaranBerjalanTripFormattedAttribute()
    {
        return 'Rp' . number_format($this->total_anggaran_berjalan_trip, 0, ',', '.');
    }

    public function getJumlahHariAttribute()
    {
        return $this->tanggal_mulai && $this->tanggal_selesai
            ? $this->tanggal_mulai->diffInDays($this->tanggal_selesai) + 1
            : 0;
    }

    // Business Logic
    public function submit()
    {
        $this->status = 'submitted';
        $this->save();
    }

    public function canEdit()
    {
        return $this->status === 'draft';
    }
}