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
        Schema::dropIfExists('nominatif_biaya_rows'); // Drop existing table

        Schema::create('nominatif_biaya_rows', function (Blueprint $table) {
            $table->id();

            // Foreign key
            $table->foreignId('nominatif_detail_row_id')->constrained('nominatif_detail_rows')->onDelete('cascade');

            // Transportasi (4 fields)
            $table->decimal('transport_pesawat_non_pp_pagu', 15, 2)->default(0);
            $table->decimal('transport_pesawat_non_pp_aktual', 15, 2)->default(0);
            $table->decimal('transport_taksi_pagu', 15, 2)->default(0);
            $table->decimal('transport_taksi_aktual', 15, 2)->default(0);

            // Penginapan (3 fields)
            $table->integer('penginapan_jumlah_malam')->default(0);
            $table->decimal('penginapan_pagu_perhari', 15, 2)->default(0);
            $table->decimal('penginapan_aktual_perhari', 15, 2)->default(0);

            // Uang Harian Meeting Fullboard (3 fields) - FIX: Add missing base fields
            $table->integer('uang_harian_meeting_fullboard_jumlah_hari')->default(0);
            $table->decimal('uang_harian_meeting_fullboard_pagu_perhari', 15, 2)->default(0);
            $table->decimal('uang_harian_meeting_fullboard_aktual_perhari', 15, 2)->default(0);

            // Uang Harian Meeting Fullday (3 fields) - FIX: Add missing base fields
            $table->integer('uang_harian_meeting_fullday_jumlah_hari')->default(0);
            $table->decimal('uang_harian_meeting_fullday_pagu_perhari', 15, 2)->default(0);
            $table->decimal('uang_harian_meeting_fullday_aktual_perhari', 15, 2)->default(0);

            // Uang Harian Luar Kota (3 fields)
            $table->integer('uang_harian_luar_kota_jumlah_hari')->default(0);
            $table->decimal('uang_harian_luar_kota_pagu_perhari', 15, 2)->default(0);
            $table->decimal('uang_harian_luar_kota_aktual_perhari', 15, 2)->default(0);

            // Uang Harian Dalam Kota (3 fields)
            $table->integer('uang_harian_dalam_kota_jumlah_hari')->default(0);
            $table->decimal('uang_harian_dalam_kota_pagu_perhari', 15, 2)->default(0);
            $table->decimal('uang_harian_dalam_kota_aktual_perhari', 15, 2)->default(0);

            // Representasi Luar Kota (3 fields)
            $table->integer('representasi_luar_kota_jumlah_hari')->default(0);
            $table->decimal('representasi_luar_kota_pagu_perhari', 15, 2)->default(0);
            $table->decimal('representasi_luar_kota_aktual_perhari', 15, 2)->default(0);

            // Representasi Dalam Kota (3 fields)
            $table->integer('representasi_dalam_kota_jumlah_hari')->default(0);
            $table->decimal('representasi_dalam_kota_pagu_perhari', 15, 2)->default(0);
            $table->decimal('representasi_dalam_kota_aktual_perhari', 15, 2)->default(0);

            // Manual Calculation Fields (Regular Decimal Fields)
            // Penginapan Totals
            $table->decimal('penginapan_total_pagu', 15, 2)->default(0);
            $table->decimal('penginapan_total_aktual', 15, 2)->default(0);
            $table->decimal('penginapan_anggaran_berjalan', 15, 2)->default(0);

            // Uang Harian Meeting Fullboard Totals
            $table->decimal('uang_harian_meeting_fullboard_total_pagu', 15, 2)->default(0);
            $table->decimal('uang_harian_meeting_fullboard_total_aktual', 15, 2)->default(0);
            $table->decimal('uang_harian_meeting_fullboard_anggaran_berjalan', 15, 2)->default(0);

            // Uang Harian Meeting Fullday Totals
            $table->decimal('uang_harian_meeting_fullday_total_pagu', 15, 2)->default(0);
            $table->decimal('uang_harian_meeting_fullday_total_aktual', 15, 2)->default(0);
            $table->decimal('uang_harian_meeting_fullday_anggaran_berjalan', 15, 2)->default(0);

            // Uang Harian Luar Kota Totals
            $table->decimal('uang_harian_luar_kota_total_pagu', 15, 2)->default(0);
            $table->decimal('uang_harian_luar_kota_total_aktual', 15, 2)->default(0);
            $table->decimal('uang_harian_luar_kota_anggaran_berjalan', 15, 2)->default(0);

            // Uang Harian Dalam Kota Totals
            $table->decimal('uang_harian_dalam_kota_total_pagu', 15, 2)->default(0);
            $table->decimal('uang_harian_dalam_kota_total_aktual', 15, 2)->default(0);
            $table->decimal('uang_harian_dalam_kota_anggaran_berjalan', 15, 2)->default(0);

            // Representasi Luar Kota Totals
            $table->decimal('representasi_luar_kota_total_pagu', 15, 2)->default(0);
            $table->decimal('representasi_luar_kota_total_aktual', 15, 2)->default(0);
            $table->decimal('representasi_luar_kota_anggaran_berjalan', 15, 2)->default(0);

            // Representasi Dalam Kota Totals
            $table->decimal('representasi_dalam_kota_total_pagu', 15, 2)->default(0);
            $table->decimal('representasi_dalam_kota_total_aktual', 15, 2)->default(0);
            $table->decimal('representasi_dalam_kota_anggaran_berjalan', 15, 2)->default(0);

            // Total Akhir per Row (Manual Calculation)
            $table->decimal('total_pagu_row', 15, 2)->default(0);
            $table->decimal('total_aktual_row', 15, 2)->default(0);
            $table->decimal('total_anggaran_berjalan_row', 15, 2)->default(0);

            // Indexes for Performance
            $table->index('nominatif_detail_row_id');
            $table->index(['total_pagu_row', 'total_aktual_row']);
            $table->index('total_anggaran_berjalan_row');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nominatif_biaya_rows');
    }
};