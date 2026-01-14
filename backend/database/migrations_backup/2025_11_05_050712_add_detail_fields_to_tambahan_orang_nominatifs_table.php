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
        Schema::table('tambahan_orang_nominatifs', function (Blueprint $table) {
            // Detail Perjalanan fields
            $table->integer('jumlah_hari')->default(0);
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_selesai')->nullable();
            $table->json('rute_perjalanan')->nullable(); // Array of rute perjalanan

            // Transportasi fields (JSON arrays)
            $table->json('transportasi_per_hari')->nullable(); // Array of transport data per hari

            // Penginapan fields
            $table->boolean('menginap')->default(false);
            $table->integer('jumlah_malam')->default(1);
            $table->decimal('pagu_per_malam', 15, 2)->default(0);
            $table->decimal('biaya_aktual_per_malam', 15, 2)->default(0);
            $table->decimal('penginapan_total', 15, 2)->default(0);
            $table->decimal('penginapan_anggaran_realisasi', 15, 2)->default(0);

            // Uang Harian fields
            $table->integer('uang_harian_jumlah_hari')->default(0);
            $table->decimal('uang_harian_pagu_per_hari', 15, 2)->default(0);
            $table->decimal('uang_harian_total', 15, 2)->default(0);

            // Uang Representasi fields
            $table->integer('uang_representasi_jumlah_hari')->default(0);
            $table->decimal('uang_representasi_pagu_per_hari', 15, 2)->default(0);
            $table->decimal('uang_representasi_total', 15, 2)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tambahan_orang_nominatifs', function (Blueprint $table) {
            // Drop all added columns
            $table->dropColumn('jumlah_hari');
            $table->dropColumn('tanggal_mulai');
            $table->dropColumn('tanggal_selesai');
            $table->dropColumn('rute_perjalanan');
            $table->dropColumn('transportasi_per_hari');
            $table->dropColumn('menginap');
            $table->dropColumn('jumlah_malam');
            $table->dropColumn('pagu_per_malam');
            $table->dropColumn('biaya_aktual_per_malam');
            $table->dropColumn('penginapan_total');
            $table->dropColumn('penginapan_anggaran_realisasi');
            $table->dropColumn('uang_harian_jumlah_hari');
            $table->dropColumn('uang_harian_pagu_per_hari');
            $table->dropColumn('uang_harian_total');
            $table->dropColumn('uang_representasi_jumlah_hari');
            $table->dropColumn('uang_representasi_pagu_per_hari');
            $table->dropColumn('uang_representasi_total');
        });
    }
};
