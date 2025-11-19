<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('nominatif_biaya_rows', function (Blueprint $table) {
            // Only add generated columns for Meeting Fullday (skip existing basic fields)
            if (!Schema::hasColumn('nominatif_biaya_rows', 'uang_harian_meeting_fullday_total_pagu')) {
                $table->decimal('uang_harian_meeting_fullday_total_pagu', 15, 2)
                      ->generatedAlwaysAs('uang_harian_meeting_fullday_jumlah_hari * uang_harian_meeting_fullday_pagu_perhari')
                      ->stored();
            }

            if (!Schema::hasColumn('nominatif_biaya_rows', 'uang_harian_meeting_fullday_total_aktual')) {
                $table->decimal('uang_harian_meeting_fullday_total_aktual', 15, 2)
                      ->generatedAlwaysAs('uang_harian_meeting_fullday_jumlah_hari * uang_harian_meeting_fullday_aktual_perhari')
                      ->stored();
            }

            if (!Schema::hasColumn('nominatif_biaya_rows', 'uang_harian_meeting_fullday_anggaran_berjalan')) {
                $table->decimal('uang_harian_meeting_fullday_anggaran_berjalan', 15, 2)
                      ->generatedAlwaysAs('uang_harian_meeting_fullday_total_pagu - uang_harian_meeting_fullday_total_aktual')
                      ->stored();
            }
        });

        // Update total generated columns to include fullday fields
        Schema::table('nominatif_biaya_rows', function (Blueprint $table) {
            // Drop existing total columns to recreate them with fullday fields
            $table->dropColumn('total_pagu_row');
            $table->dropColumn('total_aktual_row');
            $table->dropColumn('total_anggaran_berjalan_row');
        });

        Schema::table('nominatif_biaya_rows', function (Blueprint $table) {
            // Recreate total_pagu_row including fullday fields (FIX: sesuai database)
            $table->decimal('total_pagu_row', 15, 2)->nullable()->generatedAlwaysAs('
                transport_pesawat_non_pp_pagu + transport_taksi_pagu +
                penginapan_pagu +
                uang_harian_meeting_fullboard_total_pagu +
                uang_harian_meeting_fullday_total_pagu +
                uang_harian_luar_kota_total_pagu +
                uang_harian_dalam_kota_total_pagu +
                representasi_luar_kota_total_pagu +
                representasi_dalam_kota_total_pagu
            ')->stored();

            // Recreate total_aktual_row including fullday fields (FIX: sesuai database)
            $table->decimal('total_aktual_row', 15, 2)->nullable()->generatedAlwaysAs('
                transport_pesawat_non_pp_aktual + transport_taksi_aktual +
                penginapan_aktual +
                uang_harian_meeting_fullboard_total_aktual +
                uang_harian_meeting_fullday_total_aktual +
                uang_harian_luar_kota_total_aktual +
                uang_harian_dalam_kota_total_aktual +
                representasi_luar_kota_total_aktual +
                representasi_dalam_kota_total_aktual
            ')->stored();

            // Recreate total_anggaran_berjalan_row
            $table->decimal('total_anggaran_berjalan_row', 15, 2)->nullable()
                  ->generatedAlwaysAs('total_pagu_row - total_aktual_row')
                  ->stored();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nominatif_biaya_rows', function (Blueprint $table) {
            // Drop fullday fields
            $table->dropColumn([
                'uang_harian_meeting_fullday_jumlah_hari',
                'uang_harian_meeting_fullday_pagu_perhari',
                'uang_harian_meeting_fullday_aktual_perhari',
                'uang_harian_meeting_fullday_total_pagu',
                'uang_harian_meeting_fullday_total_aktual',
                'uang_harian_meeting_fullday_anggaran_berjalan'
            ]);

            // Drop and recreate total columns without fullday fields
            $table->dropColumn('total_pagu_row');
            $table->dropColumn('total_aktual_row');
            $table->dropColumn('total_anggaran_berjalan_row');
        });

        Schema::table('nominatif_biaya_rows', function (Blueprint $table) {
            // Recreate original total columns without fullday fields
            $table->decimal('total_pagu_row', 15, 2)->generatedAlwaysAs('
                transportasi_taksi_pergi_pagu + transportasi_pergi_pagu +
                transportasi_taksi_pulang_pagu + transportasi_pulang_pagu +
                penginapan_pagu +
                uang_harian_meeting_fullboard_total_pagu +
                uang_harian_luar_kota_total_pagu +
                uang_harian_dalam_kota_total_pagu +
                representasi_luar_kota_total_pagu +
                representasi_dalam_kota_total_pagu
            ')->stored();

            $table->decimal('total_aktual_row', 15, 2)->generatedAlwaysAs('
                transportasi_taksi_pergi_aktual + transportasi_pergi_aktual +
                transportasi_taksi_pulang_aktual + transportasi_pulang_aktual +
                penginapan_aktual +
                uang_harian_meeting_fullboard_total_aktual +
                uang_harian_luar_kota_total_aktual +
                uang_harian_dalam_kota_total_aktual +
                representasi_luar_kota_total_aktual +
                representasi_dalam_kota_total_aktual
            ')->stored();

            $table->decimal('total_anggaran_berjalan_row', 15, 2)
                  ->generatedAlwaysAs('total_pagu_row - total_aktual_row')
                  ->stored();
        });
    }
};
