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
        // Check if table exists and add columns if they don't exist
        if (Schema::hasTable('tambahan_orang_nominatifs')) {
            Schema::table('tambahan_orang_nominatifs', function (Blueprint $table) {
                // Only add columns that don't exist using Schema::hasColumn for cross-database compatibility

                // Detail Perjalanan fields
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'jumlah_hari')) {
                    $table->integer('jumlah_hari')->nullable()->after('anggaran_realisasi');
                }
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'tanggal_mulai')) {
                    $table->date('tanggal_mulai')->nullable()->after('jumlah_hari');
                }
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'tanggal_selesai')) {
                    $table->date('tanggal_selesai')->nullable()->after('tanggal_mulai');
                }
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'rute_perjalanan')) {
                    $table->json('rute_perjalanan')->nullable()->after('tanggal_selesai');
                }

                // Transportasi fields
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'transportasi_per_hari')) {
                    $table->json('transportasi_per_hari')->nullable()->after('rute_perjalanan');
                }

                // Penginapan fields
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'menginap')) {
                    $table->boolean('menginap')->default(false)->after('transportasi_per_hari');
                }
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'jumlah_malam')) {
                    $table->integer('jumlah_malam')->default(1)->after('menginap');
                }
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'pagu_per_malam')) {
                    $table->decimal('pagu_per_malam', 15, 2)->default(0)->after('jumlah_malam');
                }
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'biaya_aktual_per_malam')) {
                    $table->decimal('biaya_aktual_per_malam', 15, 2)->default(0)->after('pagu_per_malam');
                }
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'penginapan_total')) {
                    $table->decimal('penginapan_total', 15, 2)->default(0)->after('biaya_aktual_per_malam');
                }
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'penginapan_anggaran_realisasi')) {
                    $table->decimal('penginapan_anggaran_realisasi', 15, 2)->default(0)->after('penginapan_total');
                }

                // Uang Harian fields
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'uang_harian_jumlah_hari')) {
                    $table->integer('uang_harian_jumlah_hari')->default(0)->after('penginapan_anggaran_realisasi');
                }
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'uang_harian_pagu_per_hari')) {
                    $table->decimal('uang_harian_pagu_per_hari', 15, 2)->default(0)->after('uang_harian_jumlah_hari');
                }
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'uang_harian_total')) {
                    $table->decimal('uang_harian_total', 15, 2)->default(0)->after('uang_harian_pagu_per_hari');
                }

                // Uang Representasi fields
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'uang_representasi_jumlah_hari')) {
                    $table->integer('uang_representasi_jumlah_hari')->default(0)->after('uang_harian_total');
                }
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'uang_representasi_pagu_per_hari')) {
                    $table->decimal('uang_representasi_pagu_per_hari', 15, 2)->default(0)->after('uang_representasi_jumlah_hari');
                }
                if (!Schema::hasColumn('tambahan_orang_nominatifs', 'uang_representasi_total')) {
                    $table->decimal('uang_representasi_total', 15, 2)->default(0)->after('uang_representasi_pagu_per_hari');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tambahan_orang_nominatifs', function (Blueprint $table) {
            // Drop all added columns in reverse order
            $table->dropColumn([
                'uang_representasi_total',
                'uang_representasi_pagu_per_hari',
                'uang_representasi_jumlah_hari',
                'uang_harian_total',
                'uang_harian_pagu_per_hari',
                'uang_harian_jumlah_hari',
                'penginapan_anggaran_realisasi',
                'penginapan_total',
                'biaya_aktual_per_malam',
                'pagu_per_malam',
                'jumlah_malam',
                'menginap',
                'transportasi_per_hari',
                'rute_perjalanan',
                'tanggal_selesai',
                'tanggal_mulai',
                'jumlah_hari'
            ]);
        });
    }
};