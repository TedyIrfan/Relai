<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NominatifDetailRow extends Model
{
    use HasFactory;

    protected $table = 'nominatif_detail_rows';

    protected $fillable = [
        'nominatif_id',
        'person_name',
        'row_order',
        'asal',
        'tujuan',
        'tanggal_pergi',
        'tanggal_sampai',
        'no',
        'golongan',
        'jabatan',
        'eselon',
        'nama',
    ];

    protected $casts = [
        'tanggal_pergi' => 'date',
        'tanggal_sampai' => 'date',
    ];

    // Relationships
    public function nominatif()
    {
        return $this->belongsTo(NominatifNew::class, 'nominatif_id');
    }

    public function biayaRow()
    {
        return $this->hasOne(NominatifBiayaRow::class, 'nominatif_detail_row_id');
    }

    public function evidence()
    {
        return $this->hasMany(NominatifEvidence::class, 'nominatif_detail_row_id');
    }

    // Scopes

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_pergi', [$startDate, $endDate])
                    ->orWhereBetween('tanggal_sampai', [$startDate, $endDate]);
    }

    // Accessors
    public function getJumlahHariAttribute()
    {
        return $this->tanggal_pergi && $this->tanggal_sampai
            ? $this->tanggal_pergi->diffInDays($this->tanggal_sampai) + 1
            : 1;
    }

    public function getFormattedDateRangeAttribute()
    {
        if ($this->tanggal_pergi && $this->tanggal_sampai) {
            return $this->tanggal_pergi->format('d M Y') . ' - ' . $this->tanggal_sampai->format('d M Y');
        }
        return $this->tanggal_pergi?->format('d M Y') ?? '-';
    }

    // Business Logic
    public function getTotalPaguAttribute()
    {
        return $this->biayaRow?->total_pagu_row ?? 0;
    }

    public function getTotalAktualAttribute()
    {
        return $this->biayaRow?->total_aktual_row ?? 0;
    }

    public function getEvidenceCountAttribute()
    {
        return $this->evidence()->count();
    }
}