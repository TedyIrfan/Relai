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
        // Transportasi (sesuai database yang ada)
        'transport_pesawat_non_pp_pagu',
        'transport_pesawat_non_pp_aktual',
        'transport_taksi_pagu',
        'transport_taksi_aktual',
        // Penginapan (3 fields)
        'penginapan_jumlah_malam',
        'penginapan_pagu_perhari',
        'penginapan_aktual_perhari',
        // Uang Harian Meeting Fullboard (3 fields)
        'uang_harian_meeting_fullboard_jumlah_hari',
        'uang_harian_meeting_fullboard_pagu_perhari',
        'uang_harian_meeting_fullboard_aktual_perhari',
        // Uang Harian Luar Kota (3 fields)
        'uang_harian_luar_kota_jumlah_hari',
        'uang_harian_luar_kota_pagu_perhari',
        'uang_harian_luar_kota_aktual_perhari',
        // Uang Harian Dalam Kota (3 fields)
        'uang_harian_dalam_kota_jumlah_hari',
        'uang_harian_dalam_kota_pagu_perhari',
        'uang_harian_dalam_kota_aktual_perhari',
        // Representasi Luar Kota (3 fields)
        'representasi_luar_kota_jumlah_hari',
        'representasi_luar_kota_pagu_perhari',
        'representasi_luar_kota_aktual_perhari',
        // Representasi Dalam Kota (3 fields)
        'representasi_dalam_kota_jumlah_hari',
        'representasi_dalam_kota_pagu_perhari',
        'representasi_dalam_kota_aktual_perhari',
        // Uang Harian Meeting Fullboard (3 fields)
        'uang_harian_meeting_fullboard_jumlah_hari',
        'uang_harian_meeting_fullboard_pagu_perhari',
        'uang_harian_meeting_fullboard_aktual_perhari',
        // Uang Harian Meeting Fullday (3 fields)
        'uang_harian_meeting_fullday_jumlah_hari',
        'uang_harian_meeting_fullday_pagu_perhari',
        'uang_harian_meeting_fullday_aktual_perhari',
    ];

    protected $casts = [
        // Transportasi
        'transport_pesawat_non_pp_pagu' => 'decimal:2',
        'transport_pesawat_non_pp_aktual' => 'decimal:2',
        'transport_taksi_pagu' => 'decimal:2',
        'transport_taksi_aktual' => 'decimal:2',
        // Penginapan
        'penginapan_jumlah_malam' => 'integer',
        'penginapan_pagu_perhari' => 'decimal:2',
        'penginapan_aktual_perhari' => 'decimal:2',
        // Generated columns
        'penginapan_total_pagu' => 'decimal:2',
        'penginapan_total_aktual' => 'decimal:2',
        'penginapan_anggaran_berjalan' => 'decimal:2',
        // Uang Harian Meeting Fullboard
        'uang_harian_meeting_fullboard_jumlah_hari' => 'integer',
        'uang_harian_meeting_fullboard_pagu_perhari' => 'decimal:2',
        'uang_harian_meeting_fullboard_aktual_perhari' => 'decimal:2',
        // Generated columns
        'uang_harian_meeting_fullboard_total_pagu' => 'decimal:2',
        'uang_harian_meeting_fullboard_total_aktual' => 'decimal:2',
        'uang_harian_meeting_fullboard_anggaran_berjalan' => 'decimal:2',
        // Uang Harian Luar Kota
        'uang_harian_luar_kota_jumlah_hari' => 'integer',
        'uang_harian_luar_kota_pagu_perhari' => 'decimal:2',
        'uang_harian_luar_kota_aktual_perhari' => 'decimal:2',
        // Generated columns
        'uang_harian_luar_kota_total_pagu' => 'decimal:2',
        'uang_harian_luar_kota_total_aktual' => 'decimal:2',
        'uang_harian_luar_kota_anggaran_berjalan' => 'decimal:2',
        // Uang Harian Dalam Kota
        'uang_harian_dalam_kota_jumlah_hari' => 'integer',
        'uang_harian_dalam_kota_pagu_perhari' => 'decimal:2',
        'uang_harian_dalam_kota_aktual_perhari' => 'decimal:2',
        // Generated columns
        'uang_harian_dalam_kota_total_pagu' => 'decimal:2',
        'uang_harian_dalam_kota_total_aktual' => 'decimal:2',
        'uang_harian_dalam_kota_anggaran_berjalan' => 'decimal:2',
        // Representasi Luar Kota
        'representasi_luar_kota_jumlah_hari' => 'integer',
        'representasi_luar_kota_pagu_perhari' => 'decimal:2',
        'representasi_luar_kota_aktual_perhari' => 'decimal:2',
        // Generated columns
        'representasi_luar_kota_total_pagu' => 'decimal:2',
        'representasi_luar_kota_total_aktual' => 'decimal:2',
        'representasi_luar_kota_anggaran_berjalan' => 'decimal:2',
        // Representasi Dalam Kota
        'representasi_dalam_kota_jumlah_hari' => 'integer',
        'representasi_dalam_kota_pagu_perhari' => 'decimal:2',
        'representasi_dalam_kota_aktual_perhari' => 'decimal:2',
        // Generated columns
        'representasi_dalam_kota_total_pagu' => 'decimal:2',
        'representasi_dalam_kota_total_aktual' => 'decimal:2',
        'representasi_dalam_kota_anggaran_berjalan' => 'decimal:2',
        // Uang Harian Meeting Fullboard
        'uang_harian_meeting_fullboard_jumlah_hari' => 'integer',
        'uang_harian_meeting_fullboard_pagu_perhari' => 'decimal:2',
        'uang_harian_meeting_fullboard_aktual_perhari' => 'decimal:2',
        // Generated columns
        'uang_harian_meeting_fullboard_total_pagu' => 'decimal:2',
        'uang_harian_meeting_fullboard_total_aktual' => 'decimal:2',
        'uang_harian_meeting_fullboard_anggaran_berjalan' => 'decimal:2',
        // Uang Harian Meeting Fullday
        'uang_harian_meeting_fullday_jumlah_hari' => 'integer',
        'uang_harian_meeting_fullday_pagu_perhari' => 'decimal:2',
        'uang_harian_meeting_fullday_aktual_perhari' => 'decimal:2',
        // Generated columns
        'uang_harian_meeting_fullday_total_pagu' => 'decimal:2',
        'uang_harian_meeting_fullday_total_aktual' => 'decimal:2',
        'uang_harian_meeting_fullday_anggaran_berjalan' => 'decimal:2',
        // Total akhir per row
        'total_pagu_row' => 'decimal:2',
        'total_aktual_row' => 'decimal:2',
        'total_anggaran_berjalan_row' => 'decimal:2',
    ];

    // Relationships
    public function detailRow()
    {
        return $this->belongsTo(NominatifDetailRow::class, 'nominatif_detail_row_id');
    }

    // Accessors for formatted currency
    public function getTransportPesawatNonPpPaguFormattedAttribute()
    {
        return 'Rp' . number_format($this->transport_pesawat_non_pp_pagu, 0, ',', '.');
    }

    public function getTransportPesawatNonPpAktualFormattedAttribute()
    {
        return 'Rp' . number_format($this->transport_pesawat_non_pp_aktual, 0, ',', '.');
    }

    public function getTransportTaxiPaguFormattedAttribute()
    {
        return 'Rp' . number_format($this->transport_taksi_pagu, 0, ',', '.');
    }

    public function getTransportTaxiAktualFormattedAttribute()
    {
        return 'Rp' . number_format($this->transport_taksi_aktual, 0, ',', '.');
    }

    public function getTotalPaguRowFormattedAttribute()
    {
        return 'Rp' . number_format($this->total_pagu_row, 0, ',', '.');
    }

    public function getTotalAktualRowFormattedAttribute()
    {
        return 'Rp' . number_format($this->total_aktual_row, 0, ',', '.');
    }

    public function getTotalAnggaranBerjalanRowFormattedAttribute()
    {
        return 'Rp' . number_format($this->total_anggaran_berjalan_row, 0, ',', '.');
    }

    // Calculate totals for each category
    public function getTransportTotalPaguAttribute()
    {
        return $this->transport_pesawat_non_pp_pagu + $this->transport_taksi_pagu;
    }

    public function getTransportTotalAktualAttribute()
    {
        return $this->transport_pesawat_non_pp_aktual + $this->transport_taksi_aktual;
    }

    public function getTransportAnggaranBerjalanAttribute()
    {
        return $this->transport_total_pagu - $this->transport_total_aktual;
    }

    // Validation rules
    public static function getValidationRules()
    {
        return [
            // Transportasi
            'transport_pesawat_non_pp_pagu' => 'nullable|numeric|min:0|max:999999999.99',
            'transport_pesawat_non_pp_aktual' => 'nullable|numeric|min:0|max:999999999.99',
            'transport_taksi_pagu' => 'nullable|numeric|min:0|max:999999999.99',
            'transport_taksi_aktual' => 'nullable|numeric|min:0|max:999999999.99',
            // Penginapan
            'penginapan_jumlah_malam' => 'nullable|integer|min:0|max:365',
            'penginapan_pagu_perhari' => 'nullable|numeric|min:0|max:999999999.99',
            'penginapan_aktual_perhari' => 'nullable|numeric|min:0|max:999999999.99',
            // Uang Harian Fullboard
            'uang_harian_fullboard_jumlah_hari' => 'nullable|integer|min:0|max:365',
            'uang_harian_fullboard_pagu_perhari' => 'nullable|numeric|min:0|max:999999999.99',
            'uang_harian_fullboard_aktual_perhari' => 'nullable|numeric|min:0|max:999999999.99',
            // Uang Harian Luar Kota
            'uang_harian_luar_kota_jumlah_hari' => 'nullable|integer|min:0|max:365',
            'uang_harian_luar_kota_pagu_perhari' => 'nullable|numeric|min:0|max:999999999.99',
            'uang_harian_luar_kota_aktual_perhari' => 'nullable|numeric|min:0|max:999999999.99',
            // Uang Harian Dalam Kota
            'uang_harian_dalam_kota_jumlah_hari' => 'nullable|integer|min:0|max:365',
            'uang_harian_dalam_kota_pagu_perhari' => 'nullable|numeric|min:0|max:999999999.99',
            'uang_harian_dalam_kota_aktual_perhari' => 'nullable|numeric|min:0|max:999999999.99',
            // Representasi Luar Kota
            'representasi_luar_kota_jumlah_hari' => 'nullable|integer|min:0|max:365',
            'representasi_luar_kota_pagu_perhari' => 'nullable|numeric|min:0|max:999999999.99',
            'representasi_luar_kota_aktual_perhari' => 'nullable|numeric|min:0|max:999999999.99',
            // Representasi Dalam Kota
            'representasi_dalam_kota_jumlah_hari' => 'nullable|integer|min:0|max:365',
            'representasi_dalam_kota_pagu_perhari' => 'nullable|numeric|min:0|max:999999999.99',
            'representasi_dalam_kota_aktual_perhari' => 'nullable|numeric|min:0|max:999999999.99',
        ];
    }

    // Custom method to check if anggaran berjalan is negative
    public function isOverBudget()
    {
        return $this->total_anggaran_berjalan_row < 0;
    }

    // Get budget status for UI
    public function getBudgetStatusAttribute()
    {
        if ($this->total_anggaran_berjalan_row < 0) {
            return 'over';
        } elseif ($this->total_anggaran_berjalan_row == 0) {
            return 'exact';
        } else {
            return 'under';
        }
    }
}