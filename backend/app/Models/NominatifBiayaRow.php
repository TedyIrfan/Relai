<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NominatifBiayaRow extends Model
{
    use HasFactory;

    protected $table = 'nominatif_biaya_rows';

    protected $fillable = [
        'nominatif_detail_row_id',
        // Transportasi
        'transport_taksi_pergi_pagu',
        'transport_taksi_pergi_aktual',
        'transport_pergi_pagu',
        'transport_pergi_aktual',
        'transport_taksi_pulang_pagu',
        'transport_taksi_pulang_aktual',
        'transport_pulang_pagu',
        'transport_pulang_aktual',
        // Penginapan & Uang
        'penginapan_pagu',
        'penginapan_aktual',
        'uang_harian_fullboard_pagu',
        'uang_harian_fullboard_aktual',
        'uang_harian_pagu',
        'uang_harian_aktual',
        // Uang Representasi
        'uang_representasi_pagu',
        'uang_representasi_aktual',
    ];

    protected $casts = [
        'transport_taksi_pergi_pagu' => 'decimal:2',
        'transport_taksi_pergi_aktual' => 'decimal:2',
        'transport_pergi_pagu' => 'decimal:2',
        'transport_pergi_aktual' => 'decimal:2',
        'transport_taksi_pulang_pagu' => 'decimal:2',
        'transport_taksi_pulang_aktual' => 'decimal:2',
        'transport_pulang_pagu' => 'decimal:2',
        'transport_pulang_aktual' => 'decimal:2',
        'penginapan_pagu' => 'decimal:2',
        'penginapan_aktual' => 'decimal:2',
        'uang_harian_fullboard_pagu' => 'decimal:2',
        'uang_harian_fullboard_aktual' => 'decimal:2',
        'uang_harian_pagu' => 'decimal:2',
        'uang_harian_aktual' => 'decimal:2',
        'uang_representasi_pagu' => 'decimal:2',
        'uang_representasi_aktual' => 'decimal:2',
    ];

    // Relationships
    public function detailRow()
    {
        return $this->belongsTo(NominatifDetailRow::class, 'nominatif_detail_row_id');
    }

    // Accessors for formatted currency
    public function getTransportTaxiPergiPaguFormattedAttribute()
    {
        return 'Rp' . number_format($this->transport_taksi_pergi_pagu, 0, ',', '.');
    }

    public function getTransportTaxiPergiAktualFormattedAttribute()
    {
        return 'Rp' . number_format($this->transport_taksi_pergi_aktual, 0, ',', '.');
    }

    // Calculate totals
    public function getTotalTransportasiPaguAttribute()
    {
        return $this->transport_taksi_pergi_pagu +
               $this->transport_pergi_pagu +
               $this->transport_taksi_pulang_pagu +
               $this->transport_pulang_pagu;
    }

    public function getTotalTransportasiAktualAttribute()
    {
        return $this->transport_taksi_pergi_aktual +
               $this->transport_pergi_aktual +
               $this->transport_taksi_pulang_aktual +
               $this->transport_pulang_aktual;
    }

    public function getTotalUangHarianPaguAttribute()
    {
        return $this->uang_harian_fullboard_pagu + $this->uang_harian_pagu;
    }

    public function getTotalUangHarianAktualAttribute()
    {
        return $this->uang_harian_fullboard_aktual + $this->uang_harian_aktual;
    }

    // Validation rules
    public static function getValidationRules()
    {
        return [
            'transport_taksi_pergi_pagu' => 'nullable|numeric|min:0|max:999999999.99',
            'transport_taksi_pergi_aktual' => 'nullable|numeric|min:0|max:999999999.99',
            'transport_pergi_pagu' => 'nullable|numeric|min:0|max:999999999.99',
            'transport_pergi_aktual' => 'nullable|numeric|min:0|max:999999999.99',
            'transport_taksi_pulang_pagu' => 'nullable|numeric|min:0|max:999999999.99',
            'transport_taksi_pulang_aktual' => 'nullable|numeric|min:0|max:999999999.99',
            'transport_pulang_pagu' => 'nullable|numeric|min:0|max:999999999.99',
            'transport_pulang_aktual' => 'nullable|numeric|min:0|max:999999999.99',
            'penginapan_pagu' => 'nullable|numeric|min:0|max:999999999.99',
            'penginapan_aktual' => 'nullable|numeric|min:0|max:999999999.99',
            'uang_harian_fullboard_pagu' => 'nullable|numeric|min:0|max:999999999.99',
            'uang_harian_fullboard_aktual' => 'nullable|numeric|min:0|max:999999999.99',
            'uang_harian_pagu' => 'nullable|numeric|min:0|max:999999999.99',
            'uang_harian_aktual' => 'nullable|numeric|min:0|max:999999999.99',
            'uang_representasi_pagu' => 'nullable|numeric|min:0|max:999999999.99',
            'uang_representasi_aktual' => 'nullable|numeric|min:0|max:999999999.99',
        ];
    }
}