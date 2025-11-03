<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Nominatif extends Model
{
    use HasFactory;

    protected $table = 'nominatifs';

    protected $fillable = [
        'rka_detail_id',
        'user_id',
        'deskripsi_perjalanan_dinas',
        'jumlah_hari',
        'tanggal_mulai',
        'tanggal_selesai',
        'status',
        'is_editable',
        'rute_perjalanan',
        'transportasi_per_hari',
        'penginapan',
        'uang_harian',
        'uang_representasi',
        'total_pagu',
        'total_biaya_aktual',
        'total_anggaran_realisasi',
    ];

    protected $casts = [
        'jumlah_hari' => 'integer',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'is_editable' => 'boolean',
        'rute_perjalanan' => 'array',
        'transportasi_per_hari' => 'array',
        'penginapan' => 'array',
        'uang_harian' => 'array',
        'uang_representasi' => 'array',
        'total_pagu' => 'decimal:2',
        'total_biaya_aktual' => 'decimal:2',
        'total_anggaran_realisasi' => 'decimal:2',
    ];

    protected $dates = [
        'tanggal_mulai',
        'tanggal_selesai',
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

    public function transportasi()
    {
        return $this->hasMany(TransportasiNominatif::class, 'nominatif_id', 'id')
                    ->orderBy('hari')
                    ->orderBy('arah');
    }

    public function transportasiPergi()
    {
        return $this->hasMany(TransportasiNominatif::class, 'nominatif_id', 'id')
                    ->where('arah', 'pergi')
                    ->orderBy('hari');
    }

    public function transportasiPulang()
    {
        return $this->hasMany(TransportasiNominatif::class, 'nominatif_id', 'id')
                    ->where('arah', 'pulang')
                    ->orderBy('hari');
    }

    // Accessors & Mutators
    public function getTotalPaguFormattedAttribute()
    {
        return 'Rp' . number_format($this->total_pagu, 0, ',', '.');
    }

    public function getTotalBiayaAktualFormattedAttribute()
    {
        return 'Rp' . number_format($this->total_biaya_aktual, 0, ',', '.');
    }

    public function getTotalAnggaranRealisasiFormattedAttribute()
    {
        return 'Rp' . number_format($this->total_anggaran_realisasi, 0, ',', '.');
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

    public function scopeEditable($query)
    {
        return $query->where('is_editable', true);
    }

    // Business Logic
    public function submit()
    {
        $this->status = 'submitted';
        $this->is_editable = false;
        $this->save();
    }

    public function canEdit()
    {
        return $this->is_editable && $this->status === 'draft';
    }

    // Calculate totals from database records and JSON data
    public function calculateTotals()
    {
        $totalPagu = 0;
        $totalBiayaAktual = 0;

        // Calculate from transportasi table (more reliable than JSON)
        $transportasiRecords = $this->transportasi;
        if ($transportasiRecords) {
            foreach ($transportasiRecords as $transport) {
                $totalPagu += $transport->pagu;
                $totalBiayaAktual += $transport->biaya_aktual;
            }
        }

        // Calculate from penginapan
        if ($this->penginapan && $this->penginapan['menginap']) {
            $totalPagu += ($this->penginapan['jumlahMalam'] ?? 1) * ($this->penginapan['paguPerMalam'] ?? 0);
            $totalBiayaAktual += ($this->penginapan['jumlahMalam'] ?? 1) * ($this->penginapan['biayaAktualPerMalam'] ?? 0);
        }

        // Calculate from uang harian
        if ($this->uang_harian) {
            $totalPagu += ($this->uang_harian['jumlahHari'] ?? 1) * ($this->uang_harian['paguPerHari'] ?? 0);
            // No biaya aktual for uang harian
        }

        // Calculate from uang representasi
        if ($this->uang_representasi) {
            $totalPagu += ($this->uang_representasi['jumlahHari'] ?? 1) * ($this->uang_representasi['paguPerHari'] ?? 0);
            // No biaya aktual for uang representasi
        }

        $this->total_pagu = $totalPagu;
        $this->total_biaya_aktual = $totalBiayaAktual;
        $this->total_anggaran_realisasi = $totalPagu - $totalBiayaAktual;
        $this->save();
    }
}
