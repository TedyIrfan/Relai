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
            // RENAME uang_harian_fullboard menjadi uang_harian_meeting_fullboard
            $table->renameColumn('uang_harian_fullboard_jumlah_hari', 'uang_harian_meeting_fullboard_jumlah_hari');
            $table->renameColumn('uang_harian_fullboard_pagu_perhari', 'uang_harian_meeting_fullboard_pagu_perhari');
            $table->renameColumn('uang_harian_fullboard_aktual_perhari', 'uang_harian_meeting_fullboard_aktual_perhari');

            // RENAME generated columns untuk uang_harian_fullboard
            $table->renameColumn('uang_harian_fullboard_total_pagu', 'uang_harian_meeting_fullboard_total_pagu');
            $table->renameColumn('uang_harian_fullboard_total_aktual', 'uang_harian_meeting_fullboard_total_aktual');
            $table->renameColumn('uang_harian_fullboard_anggaran_berjalan', 'uang_harian_meeting_fullboard_anggaran_berjalan');

            // Tambah Uang Harian Meeting Fullday (3 fields baru)
            $table->integer('uang_harian_meeting_fullday_jumlah_hari')->default(0)->after('uang_harian_meeting_fullboard_aktual_perhari');
            $table->decimal('uang_harian_meeting_fullday_pagu_perhari', 15, 2)->default(0)->after('uang_harian_meeting_fullday_jumlah_hari');
            $table->decimal('uang_harian_meeting_fullday_aktual_perhari', 15, 2)->default(0)->after('uang_harian_meeting_fullday_pagu_perhari');

            // Generated Columns untuk Uang Harian Meeting Fullday
            $table->decimal('uang_harian_meeting_fullday_total_pagu', 15, 2)->nullable()
                  ->generatedAlwaysAs('uang_harian_meeting_fullday_jumlah_hari * uang_harian_meeting_fullday_pagu_perhari')
                  ->stored()
                  ->after('uang_harian_meeting_fullday_aktual_perhari');

            $table->decimal('uang_harian_meeting_fullday_total_aktual', 15, 2)->nullable()
                  ->generatedAlwaysAs('uang_harian_meeting_fullday_jumlah_hari * uang_harian_meeting_fullday_aktual_perhari')
                  ->stored()
                  ->after('uang_harian_meeting_fullday_total_pagu');

            $table->decimal('uang_harian_meeting_fullday_anggaran_berjalan', 15, 2)->nullable()
                  ->generatedAlwaysAs('uang_harian_meeting_fullday_total_pagu - uang_harian_meeting_fullday_total_aktual')
                  ->stored()
                  ->after('uang_harian_meeting_fullday_total_aktual');
        });

        // Update the total generated columns to include new field names
        Schema::table('nominatif_biaya_rows', function (Blueprint $table) {
            // Drop existing total columns to recreate them with new field names
            $table->dropColumn('total_pagu_row');
            $table->dropColumn('total_aktual_row');
            $table->dropColumn('total_anggaran_berjalan_row');
        });

        Schema::table('nominatif_biaya_rows', function (Blueprint $table) {
            // Recreate total_pagu_row with renamed fields
            $table->decimal('total_pagu_row', 15, 2)->generatedAlwaysAs('
                transportasi_taksi_pergi_pagu + transportasi_pergi_pagu +
                transportasi_taksi_pulang_pagu + transportasi_pulang_pagu +
                penginapan_pagu +
                uang_harian_meeting_fullboard_total_pagu +
                uang_harian_luar_kota_total_pagu +
                uang_harian_dalam_kota_total_pagu +
                uang_harian_meeting_fullday_total_pagu +
                representasi_luar_kota_total_pagu +
                representasi_dalam_kota_total_pagu
            ')->stored();

            // Recreate total_aktual_row with renamed fields
            $table->decimal('total_aktual_row', 15, 2)->generatedAlwaysAs('
                transportasi_taksi_pergi_aktual + transportasi_pergi_aktual +
                transportasi_taksi_pulang_aktual + transportasi_pulang_aktual +
                penginapan_aktual +
                uang_harian_meeting_fullboard_total_aktual +
                uang_harian_luar_kota_total_aktual +
                uang_harian_dalam_kota_total_aktual +
                uang_harian_meeting_fullday_total_aktual +
                representasi_luar_kota_total_aktual +
                representasi_dalam_kota_total_aktual
            ')->stored();

            // Recreate total_anggaran_berjalan_row
            $table->decimal('total_anggaran_berjalan_row', 15, 2)
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
            // Drop new fullday fields
            $table->dropColumn([
                'uang_harian_meeting_fullday_jumlah_hari',
                'uang_harian_meeting_fullday_pagu_perhari',
                'uang_harian_meeting_fullday_aktual_perhari',
                'uang_harian_meeting_fullday_total_pagu',
                'uang_harian_meeting_fullday_total_aktual',
                'uang_harian_meeting_fullday_anggaran_berjalan'
            ]);

            // RENAME kembali dari meeting fullboard ke fullboard asli
            $table->renameColumn('uang_harian_meeting_fullboard_jumlah_hari', 'uang_harian_fullboard_jumlah_hari');
            $table->renameColumn('uang_harian_meeting_fullboard_pagu_perhari', 'uang_harian_fullboard_pagu_perhari');
            $table->renameColumn('uang_harian_meeting_fullboard_aktual_perhari', 'uang_harian_fullboard_aktual_perhari');

            // RENAME kembali generated columns
            $table->renameColumn('uang_harian_meeting_fullboard_total_pagu', 'uang_harian_fullboard_total_pagu');
            $table->renameColumn('uang_harian_meeting_fullboard_total_aktual', 'uang_harian_fullboard_total_aktual');
            $table->renameColumn('uang_harian_meeting_fullboard_anggaran_berjalan', 'uang_harian_fullboard_anggaran_berjalan');

            // Drop and recreate total columns with original field names
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
                uang_harian_fullboard_total_pagu +
                uang_harian_luar_kota_total_pagu +
                uang_harian_dalam_kota_total_pagu +
                representasi_luar_kota_total_pagu +
                representasi_dalam_kota_total_pagu
            ')->stored();

            $table->decimal('total_aktual_row', 15, 2)->generatedAlwaysAs('
                transportasi_taksi_pergi_aktual + transportasi_pergi_aktual +
                transportasi_taksi_pulang_aktual + transportasi_pulang_aktual +
                penginapan_aktual +
                uang_harian_fullboard_total_aktual +
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