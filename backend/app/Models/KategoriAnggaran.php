<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KategoriAnggaran extends Model
{
    use HasFactory;

    protected $fillable = [
        'tahun',
        'nama_kategori',
        'total_anggaran_kategori',
        'anggaran_terpakai_kategori',
        'sp2d_kategori',
        'keterangan'
    ];

    protected $casts = [
        'total_anggaran_kategori' => 'decimal:2',
        'anggaran_terpakai_kategori' => 'decimal:2',
        'sp2d_kategori' => 'decimal:2',
        'sisa_anggaran_kategori' => 'decimal:2',
        'tahun' => 'integer'
    ];

    /**
     * Get sisa anggaran kategori calculated value
     */
    public function getSisaAnggaranKategoriAttribute()
    {
        $total = (float) ($this->total_anggaran_kategori ?? 0);
        $terpakai = (float) ($this->anggaran_terpakai_kategori ?? 0);
        return max(0, $total - $terpakai);
    }

    /**
     * Get kategori by tahun dan nama
     */
    public static function getByTahunAndKategori($tahun, $kategori)
    {
        return self::where('tahun', $tahun)
                   ->where('nama_kategori', $kategori)
                   ->first();
    }

    /**
     * Get all kategori by tahun
     */
    public static function getAllByTahun($tahun)
    {
        return self::where('tahun', $tahun)->get();
    }

    /**
     * Format anggaran to Rupiah
     */
    public function formatRupiah($amount)
    {
        return 'Rp ' . number_format($amount, 0, ',', '.');
    }

    /**
     * Get percentage used untuk kategori ini
     */
    public function getPercentageUsed()
    {
        $total = (float) ($this->total_anggaran_kategori ?? 0);
        $terpakai = (float) ($this->anggaran_terpakai_kategori ?? 0);

        if ($total == 0) return 0;
        return round(($terpakai / $total) * 100, 2);
    }

    /**
     * Update anggaran terpakai untuk kategori ini
     */
    public function updateAnggaranTerpakai($jumlah, $type = 'add')
    {
        if ($type === 'add') {
            $this->anggaran_terpakai_kategori += $jumlah;
        } elseif ($type === 'subtract') {
            $this->anggaran_terpakai_kategori = max(0, $this->anggaran_terpakai_kategori - $jumlah);
        }

        $this->save();

        // Auto update main anggaran table
        $this->updateMainAnggaran();

        return $this;
    }

    /**
     * Update SP2D untuk kategori ini
     */
    public function updateSP2D($jumlah, $type = 'add')
    {
        if ($type === 'add') {
            $this->sp2d_kategori += $jumlah;
        } elseif ($type === 'subtract') {
            $this->sp2d_kategori = max(0, $this->sp2d_kategori - $jumlah);
        }

        $this->save();

        // Auto update main anggaran table
        $this->updateMainAnggaran();

        return $this;
    }

    /**
     * Auto update main anggaran table based on all kategori
     */
    private function updateMainAnggaran()
    {
        $anggaran = Anggaran::getByYear($this->tahun);

        if ($anggaran) {
            // Get total dari semua kategori di tahun ini
            $kategoriData = self::getAllByTahun($this->tahun);

            $totalTerpakai = $kategoriData->sum('anggaran_terpakai_kategori');
            $totalSP2D = $kategoriData->sum('sp2d_kategori');

            $anggaran->update([
                'anggaran_terpakai' => $totalTerpakai,
                'sp2d' => $totalSP2D
            ]);
        }
    }

    /**
     * Sync main anggaran from all kategori (utility method)
     */
    public static function syncMainAnggaran($tahun)
    {
        $anggaran = Anggaran::getByYear($tahun);

        if ($anggaran) {
            $kategoriData = self::getAllByTahun($tahun);

            $totalTerpakai = $kategoriData->sum('anggaran_terpakai_kategori');
            $totalSP2D = $kategoriData->sum('sp2d_kategori');

            $anggaran->update([
                'anggaran_terpakai' => $totalTerpakai,
                'sp2d' => $totalSP2D
            ]);
        }

        return $anggaran;
    }
}
