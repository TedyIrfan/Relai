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

            // Uang Harian Fullboard (3 fields)
            $table->integer('uang_harian_fullboard_jumlah_hari')->default(0);
            $table->decimal('uang_harian_fullboard_pagu_perhari', 15, 2)->default(0);
            $table->decimal('uang_harian_fullboard_aktual_perhari', 15, 2)->default(0);

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

            // Generated Columns for Performance (PostgreSQL)

            // Penginapan Calculations
            $table->decimal('penginapan_total_pagu', 15, 2)->generatedAlwaysAs('penginapan_jumlah_malam * penginapan_pagu_perhari')->stored();
            $table->decimal('penginapan_total_aktual', 15, 2)->generatedAlwaysAs('penginapan_jumlah_malam * penginapan_aktual_perhari')->stored();
            $table->decimal('penginapan_anggaran_berjalan', 15, 2)->generatedAlwaysAs('penginapan_total_pagu - penginapan_total_aktual')->stored();

            // Uang Harian Fullboard Calculations
            $table->decimal('uang_harian_fullboard_total_pagu', 15, 2)->generatedAlwaysAs('uang_harian_fullboard_jumlah_hari * uang_harian_fullboard_pagu_perhari')->stored();
            $table->decimal('uang_harian_fullboard_total_aktual', 15, 2)->generatedAlwaysAs('uang_harian_fullboard_jumlah_hari * uang_harian_fullboard_aktual_perhari')->stored();
            $table->decimal('uang_harian_fullboard_anggaran_berjalan', 15, 2)->generatedAlwaysAs('uang_harian_fullboard_total_pagu - uang_harian_fullboard_total_aktual')->stored();

            // Uang Harian Luar Kota Calculations
            $table->decimal('uang_harian_luar_kota_total_pagu', 15, 2)->generatedAlwaysAs('uang_harian_luar_kota_jumlah_hari * uang_harian_luar_kota_pagu_perhari')->stored();
            $table->decimal('uang_harian_luar_kota_total_aktual', 15, 2)->generatedAlwaysAs('uang_harian_luar_kota_jumlah_hari * uang_harian_luar_kota_aktual_perhari')->stored();
            $table->decimal('uang_harian_luar_kota_anggaran_berjalan', 15, 2)->generatedAlwaysAs('uang_harian_luar_kota_total_pagu - uang_harian_luar_kota_total_aktual')->stored();

            // Uang Harian Dalam Kota Calculations
            $table->decimal('uang_harian_dalam_kota_total_pagu', 15, 2)->generatedAlwaysAs('uang_harian_dalam_kota_jumlah_hari * uang_harian_dalam_kota_pagu_perhari')->stored();
            $table->decimal('uang_harian_dalam_kota_total_aktual', 15, 2)->generatedAlwaysAs('uang_harian_dalam_kota_jumlah_hari * uang_harian_dalam_kota_aktual_perhari')->stored();
            $table->decimal('uang_harian_dalam_kota_anggaran_berjalan', 15, 2)->generatedAlwaysAs('uang_harian_dalam_kota_total_pagu - uang_harian_dalam_kota_total_aktual')->stored();

            // Representasi Luar Kota Calculations
            $table->decimal('representasi_luar_kota_total_pagu', 15, 2)->generatedAlwaysAs('representasi_luar_kota_jumlah_hari * representasi_luar_kota_pagu_perhari')->stored();
            $table->decimal('representasi_luar_kota_total_aktual', 15, 2)->generatedAlwaysAs('representasi_luar_kota_jumlah_hari * representasi_luar_kota_aktual_perhari')->stored();
            $table->decimal('representasi_luar_kota_anggaran_berjalan', 15, 2)->generatedAlwaysAs('representasi_luar_kota_total_pagu - representasi_luar_kota_total_aktual')->stored();

            // Representasi Dalam Kota Calculations
            $table->decimal('representasi_dalam_kota_total_pagu', 15, 2)->generatedAlwaysAs('representasi_dalam_kota_jumlah_hari * representasi_dalam_kota_pagu_perhari')->stored();
            $table->decimal('representasi_dalam_kota_total_aktual', 15, 2)->generatedAlwaysAs('representasi_dalam_kota_jumlah_hari * representasi_dalam_kota_aktual_perhari')->stored();
            $table->decimal('representasi_dalam_kota_anggaran_berjalan', 15, 2)->generatedAlwaysAs('representasi_dalam_kota_total_pagu - representasi_dalam_kota_total_aktual')->stored();

            // Total Akhir per Row (Generated Columns)
            $table->decimal('total_pagu_row', 15, 2)->generatedAlwaysAs('
                transport_pesawat_non_pp_pagu + transport_taksi_pagu +
                penginapan_total_pagu +
                uang_harian_fullboard_total_pagu +
                uang_harian_luar_kota_total_pagu +
                uang_harian_dalam_kota_total_pagu +
                representasi_luar_kota_total_pagu +
                representasi_dalam_kota_total_pagu
            ')->stored();

            $table->decimal('total_aktual_row', 15, 2)->generatedAlwaysAs('
                transport_pesawat_non_pp_aktual + transport_taksi_aktual +
                penginapan_total_aktual +
                uang_harian_fullboard_total_aktual +
                uang_harian_luar_kota_total_aktual +
                uang_harian_dalam_kota_total_aktual +
                representasi_luar_kota_total_aktual +
                representasi_dalam_kota_total_aktual
            ')->stored();

            $table->decimal('total_anggaran_berjalan_row', 15, 2)->generatedAlwaysAs('total_pagu_row - total_aktual_row')->stored();

            $table->timestamps();

            // Indexes for Performance
            $table->index('nominatif_detail_row_id');
            $table->index(['total_pagu_row', 'total_aktual_row']);
            $table->index('total_anggaran_berjalan_row');
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