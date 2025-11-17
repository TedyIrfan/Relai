<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Migrate existing data from master_nominatifs to nominatifs_new
        $existingNominatifs = DB::table('master_nominatifs')->get();

        foreach ($existingNominatifs as $nominatif) {
            // Insert into new nominatifs table
            $newId = DB::table('nominatifs_new')->insertGetId([
                'rka_detail_id' => $nominatif->rka_detail_id,
                'user_id' => $nominatif->user_id,
                'deskripsi_perjalanan_dinas' => $nominatif->deskripsi_perjalanan_dinas,
                'tanggal_mulai' => $this->getTanggalMulai($nominatif),
                'tanggal_selesai' => $this->getTanggalSelesai($nominatif),
                'status' => $nominatif->status,
                'total_pagu' => $nominatif->total_pagu,
                'total_biaya_aktual' => $nominatif->total_biaya_aktual,
                'created_at' => $nominatif->created_at,
                'updated_at' => $nominatif->updated_at,
            ]);

            // TODO: If you have existing data in child tables, you can migrate them here
            // This is optional for now since we're starting with fresh structure
        }

        // Step 2: Create a backup of old tables (optional but recommended)
        // You can uncomment this if you want to keep old tables as backup
        /*
        Schema::rename('master_nominatifs', 'master_nominatifs_backup_'.date('Y_m_d_His'));
        Schema::rename('tambahan_orang_nominatifs', 'tambahan_orang_nominatifs_backup_'.date('Y_m_d_His'));
        Schema::rename('transportasi_nominatifs', 'transportasi_nominatifs_backup_'.date('Y_m_d_His'));
        Schema::rename('penginapan_nominatifs', 'penginapan_nominatifs_backup_'.date('Y_m_d_His'));
        Schema::rename('rute_perjalanan_nominatifs', 'rute_perjalanan_nominatifs_backup_'.date('Y_m_d_His'));
        */
    }

    /**
     * Get tanggal_mulai from rute_perjalanan relationship
     */
    private function getTanggalMulai($nominatif)
    {
        $rute = DB::table('rute_perjalanan_nominatifs')
                    ->where('master_nominatif_id', $nominatif->id)
                    ->first();

        return $rute ? $rute->tanggal_mulai : now()->toDateString();
    }

    /**
     * Get tanggal_selesai from rute_perjalanan relationship
     */
    private function getTanggalSelesai($nominatif)
    {
        $rute = DB::table('rute_perjalanan_nominatifs')
                    ->where('master_nominatif_id', $nominatif->id)
                    ->first();

        return $rute ? $rute->tanggal_selesai : now()->toDateString();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse the migration
        DB::table('nominatifs_new')->delete();

        // If you created backup tables, you can restore them
        /*
        Schema::rename('master_nominatifs_backup_'.date('Y_m_d_His'), 'master_nominatifs');
        // ... restore other tables
        */
    }
};