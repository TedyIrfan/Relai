<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\KategoriAnggaran;

class KategoriAnggaranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tahun = 2024; // bisa diganti atau di loop untuk multiple tahun
        $kategoriData = [
            [
                'tahun' => $tahun,
                'kode' => 'KA',
                'nama_kategori' => 'Kategori A - Dinas Pimpinan',
                'total_anggaran_kategori' => 0,
                'anggaran_berjalan_kategori' => 0,
                'sp2d_kategori' => 0,
                'keterangan' => 'Dinas Pimpinan'
            ],
            [
                'tahun' => $tahun,
                'kode' => 'KB',
                'nama_kategori' => 'Kategori B - Tata Usaha',
                'total_anggaran_kategori' => 0,
                'anggaran_berjalan_kategori' => 0,
                'sp2d_kategori' => 0,
                'keterangan' => 'Pengelolaan Tata Usaha'
            ],
            [
                'tahun' => $tahun,
                'kode' => 'KC',
                'nama_kategori' => 'Kategori C - Konferensi',
                'total_anggaran_kategori' => 0,
                'anggaran_berjalan_kategori' => 0,
                'sp2d_kategori' => 0,
                'keterangan' => 'Konferensi Infrastruktur'
            ]
        ];

        foreach ($kategoriData as $kategori) {
            KategoriAnggaran::updateOrCreate(
                [
                    'tahun' => $kategori['tahun'],
                    'kode' => $kategori['kode']
                ],
                $kategori
            );
        }

        $this->command->info('Kategori Anggaran seeded successfully for tahun ' . $tahun);
    }
}