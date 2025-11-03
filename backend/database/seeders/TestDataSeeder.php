<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\KategoriAnggaran;
use App\Models\RkaDetail;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create test user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'name' => 'Test User',
            'username' => 'testuser',
            'jabatan' => 'Staff',
        ]);

        // Create test kategori anggaran
        $kategori = KategoriAnggaran::factory()->create([
            'tahun' => 2025,
            'kategori' => 'Perjalanan Dinas',
            'kode' => 'PERJALANAN',
        ]);

        // Create test RKA Detail
        $rkaDetail = RkaDetail::create([
            'program_dukungan_manajemen' => 'Program Dukungan Manajemen',
            'kode_program' => 'PDM-001',
            'layanan_umum' => 'Layanan Umum',
            'kode_layanan_1' => 'LU-001',
            'kode_layanan_2' => 'LU-002',
            'layanan_tata_usaha' => 'Layanan Tata Usaha',
            'kategori_anggaran_id' => $kategori->id,
            'code_rka' => 'RKA-2025-001',
            'layanan' => 'Perjalanan Dinas Dalam Negeri',
            'wilayah' => 'Jakarta',
            'arti_kode' => 'Perjalanan Dinas Jakarta',
            'sisa_pemakaian_anggaran' => 100000000,
            'status' => 'Aktif',
            'anggaran_perjalanan' => 50000000,
            'anggaran_layanan' => 100000000,
            'anggaran_layanan_used' => 0,
            'sbm' => 1500000,
        ]);

        $this->command->info('Test data created successfully!');
        $this->command->info('User: test@example.com / password123');
        $this->command->info('RKA Detail ID: ' . $rkaDetail->id);
    }
}