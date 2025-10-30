<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RKADetailsSeeder extends Seeder
{
    /**
     * Seed the RKA details table with sample data.
     */
    public function run(): void
    {
        $sampleData = [
            [
                'layananUmum' => '7394',
                'kodeLayanan1' => 'EBA',
                'kodeLayanan2' => '962',
                'layananTataUsaha' => '001',
                'kategoriAnggaran' => 'Belanja Barang',
                'codeRka' => '524111',
                'layanan' => 'Belanja Perjalanan Dinas Biasa Dalam Wilayah Kabupaten/Kota untuk menghadiri undangan kegiatan koordinasi dan evaluasi program kerja tingkat provinsi serta monitoring dan evaluasi implementasi kebijakan publik di daerah',
                'artiKode' => 'Belanja Perjalanan Dinas Biasa',
                'wilayah' => 'Jakarta',
                'status' => 'Aktif'
            ],
            [
                'layananUmum' => '7394',
                'kodeLayanan1' => 'EBA',
                'kodeLayanan2' => '963',
                'layananTataUsaha' => '001',
                'kategoriAnggaran' => 'Belanja Barang',
                'codeRka' => '524112',
                'layanan' => 'Belanja Perjalanan Dinas Biasa Luar Wilayah Kabupaten/Kota untuk menghadiri rapat koordinasi nasional program pembangunan daerah dan forum konsultasi publik tingkat nasional',
                'artiKode' => 'Belanja Perjalanan Dinas Luar Kota',
                'wilayah' => 'Surabaya',
                'status' => 'Aktif'
            ],
            [
                'layananUmum' => '7394',
                'kodeLayanan1' => 'EBA',
                'kodeLayanan2' => '964',
                'layananTataUsaha' => '001',
                'kategoriAnggaran' => 'Belanja Barang',
                'codeRka' => '524113',
                'layanan' => 'Belanja Perjalanan Dinas Biasa Luar Negeri untuk menghadiri konferensi internasional mengenai pembangunan berkelanjutan dan pertemuan bilateral kerjasama teknis',
                'artiKode' => 'Belanja Perjalanan Dinas Luar Negeri',
                'wilayah' => 'Singapura',
                'status' => 'Aktif'
            ],
            [
                'layananUmum' => '7394',
                'kodeLayanan1' => 'EBA',
                'kodeLayanan2' => '965',
                'layananTataUsaha' => '001',
                'kategoriAnggaran' => 'Belanja Barang',
                'codeRka' => '524114',
                'layanan' => 'Belanja Perjalanan Dinas Dalam Rangka Study Banding dan Benchmarking ke Pemerintah Daerah Terkait Implementasi Sistem E-Government dan Pelayanan Publik Digital',
                'artiKode' => 'Belanja Study Banding',
                'wilayah' => 'Bandung',
                'status' => 'Aktif'
            ],
            [
                'layananUmum' => '7394',
                'kodeLayanan1' => 'EBA',
                'kodeLayanan2' => '966',
                'layananTataUsaha' => '001',
                'kategoriAnggaran' => 'Belanja Barang',
                'codeRka' => '524115',
                'layanan' => 'Belanja Perjalanan Dinas Dalam Rangka Monitoring dan Evaluasi Pelaksanaan Program Kerja Sama Antar Daerah serta Supervisi Implementasi Kebijakan Pemerintah Pusat di Daerah',
                'artiKode' => 'Belanja Monitoring Evaluasi',
                'wilayah' => 'Medan',
                'status' => 'Aktif'
            ]
        ];

        DB::table('rka_details')->insert($sampleData);
    }
}