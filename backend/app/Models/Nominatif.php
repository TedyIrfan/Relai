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
        'anggaran_berjalan',
        'anggaran_sp2d',
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
        'anggaran_berjalan' => 'decimal:2',
        'anggaran_sp2d' => 'decimal:2',
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

    public function tambahanOrang()
    {
        return $this->hasMany(TambahanOrangNominatif::class, 'nominatif_id', 'id')
                    ->orderBy('id');
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

    public function getAnggaranBerjalanFormattedAttribute()
    {
        return 'Rp' . number_format($this->anggaran_berjalan, 0, ',', '.');
    }

    public function getAnggaranSp2dFormattedAttribute()
    {
        return 'Rp' . number_format($this->anggaran_sp2d, 0, ',', '.');
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
        // Move anggaran_berjalan to anggaran_sp2d
        $this->anggaran_sp2d = $this->anggaran_berjalan;
        $this->anggaran_berjalan = 0;

        $this->status = 'submitted';
        $this->is_editable = false;
        $this->save();
    }

    public function canEdit()
    {
        return $this->is_editable && $this->status === 'draft';
    }

    // Calculate totals from JSON data
    public function calculateTotals()
    {
        $totalPagu = 0;
        $totalBiayaAktual = 0;

        // Calculate from transportasi JSON data
        $transportData = $this->transportasi_per_hari;
        if ($transportData && is_array($transportData)) {
            foreach ($transportData as $transport) {
                $totalPagu += $transport['pagu'] ?? 0;
                $totalBiayaAktual += $transport['biaya_aktual'] ?? 0;
            }
        }

        // Calculate from penginapan
        if ($this->penginapan && isset($this->penginapan['menginap']) && $this->penginapan['menginap']) {
            $totalPagu += ($this->penginapan['jumlahMalam'] ?? 1) * ($this->penginapan['paguPerMalam'] ?? 0);
            $totalBiayaAktual += ($this->penginapan['jumlahMalam'] ?? 1) * ($this->penginapan['biayaAktualPerMalam'] ?? 0);
        }

        // Calculate from uang harian (masuk ke total anggaran, tapi dianggap langsung aktual)
        if ($this->uang_harian) {
            $uangHarianTotal = ($this->uang_harian['total'] ?? 0);
            // Uang harian masuk ke totalPagu dan langsung dianggap aktual
            $totalPagu += $uangHarianTotal;
            $totalBiayaAktual += $uangHarianTotal;
        }

        // Calculate from uang representasi (masuk ke total anggaran, tapi dianggap langsung aktual)
        if ($this->uang_representasi) {
            $uangRepresentasiTotal = ($this->uang_representasi['total'] ?? 0);
            // Uang representasi masuk ke totalPagu dan langsung dianggap aktual
            $totalPagu += $uangRepresentasiTotal;
            $totalBiayaAktual += $uangRepresentasiTotal;
        }

        // Calculate from tambahan orang
        $tambahanOrang = $this->tambahanOrang;
        if ($tambahanOrang && $tambahanOrang->count() > 0) {
            foreach ($tambahanOrang as $orang) {
                $totalPagu += $orang->pagu;
                $totalBiayaAktual += $orang->aktual;
            }
        }

        $this->total_pagu = $totalPagu;
        $this->total_biaya_aktual = $totalBiayaAktual;

        // Calculate anggaran_berjalan: (pagu - aktual transportasi + taksi + penginapan) + uang harian + uang representasi
        $transportasiPagu = 0;  // Transportasi utama (pesawat, bus, dll)
        $transportasiAktual = 0;
        $taksiPagu = 0;         // Taksi
        $taksiAktual = 0;
        $penginapanPagu = 0;
        $penginapanAktual = 0;

        // Hitung pagu dan aktual transportasi (pisahkan transportasi utama dan taksi)
        if ($this->transportasi_per_hari && is_array($this->transportasi_per_hari)) {
            foreach ($this->transportasi_per_hari as $transport) {
                $jenisTransportasi = strtolower($transport['jenis_transportasi'] ?? '');
                $pagu = $transport['pagu'] ?? 0;
                $aktual = $transport['biaya_aktual'] ?? 0;

                if ($jenisTransportasi === 'taksi') {
                    // Ini taksi
                    $taksiPagu += $pagu;
                    $taksiAktual += $aktual;
                } else {
                    // Ini transportasi utama (pesawat, bus, dll)
                    $transportasiPagu += $pagu;
                    $transportasiAktual += $aktual;
                }
            }
        }

        // Hitung pagu dan aktual penginapan
        if ($this->penginapan && isset($this->penginapan['menginap']) && $this->penginapan['menginap']) {
            $penginapanPagu = ($this->penginapan['jumlahMalam'] ?? 1) * ($this->penginapan['paguPerMalam'] ?? 0);
            $penginapanAktual = ($this->penginapan['jumlahMalam'] ?? 1) * ($this->penginapan['biayaAktualPerMalam'] ?? 0);
        }

        // Hitung uang harian dan representasi
        $uangHarian = ($this->uang_harian['total'] ?? 0);
        $uangRepresentasi = ($this->uang_representasi['total'] ?? 0);

        // Calculate dari tambahan orang
        $tambahanOrangPagu = 0;
        $tambahanOrangAktual = 0;
        $tambahanOrang = $this->tambahanOrang;
        if ($tambahanOrang && $tambahanOrang->count() > 0) {
            foreach ($tambahanOrang as $orang) {
                $tambahanOrangPagu += $orang->pagu;
                $tambahanOrangAktual += $orang->aktual;
            }
        }

        // Anggaran berjalan = (transportasi pagu - aktual) + (taksi pagu - aktual) + (penginapan pagu - aktual) + uang harian + uang representasi + (tambahan orang pagu - aktual)
        $selisihTransportasi = $transportasiPagu - $transportasiAktual;
        $selisihTaksi = $taksiPagu - $taksiAktual;
        $selisihPenginapan = $penginapanPagu - $penginapanAktual;
        $selisihTambahanOrang = $tambahanOrangPagu - $tambahanOrangAktual;
        $this->anggaran_berjalan = $selisihTransportasi + $selisihTaksi + $selisihPenginapan + $uangHarian + $uangRepresentasi + $selisihTambahanOrang;

        // Only set anggaran_sp2d if it's already submitted
        if ($this->status === 'submitted' && $this->anggaran_sp2d == 0) {
            $this->anggaran_sp2d = $this->anggaran_berjalan;
            $this->anggaran_berjalan = 0;
        }

        $this->save();
    }
}
