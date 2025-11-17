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
        // Check if master_nominatifs table doesn't exist before renaming
        if (!Schema::hasTable('master_nominatifs')) {
            // Rename main table
            Schema::rename('nominatifs', 'master_nominatifs');
        }

        // Add missing fields to master_nominatifs only if they don't exist
        if (Schema::hasTable('master_nominatifs')) {
            // Use Schema::hasColumn for cross-database compatibility
            if (!Schema::hasColumn('master_nominatifs', 'total_anggaran_realisasi')) {
                Schema::table('master_nominatifs', function (Blueprint $table) {
                    $table->decimal('total_anggaran_realisasi', 15, 2)->default(0)->after('total_biaya_aktual');
                });
            }

            if (!Schema::hasColumn('master_nominatifs', 'anggaran_berjalan')) {
                Schema::table('master_nominatifs', function (Blueprint $table) {
                    $table->decimal('anggaran_berjalan', 15, 2)->default(0)->after('total_anggaran_realisasi');
                });
            }

            if (!Schema::hasColumn('master_nominatifs', 'anggaran_sp2d')) {
                Schema::table('master_nominatifs', function (Blueprint $table) {
                    $table->decimal('anggaran_sp2d', 15, 2)->default(0)->after('anggaran_berjalan');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove added fields first
        Schema::table('master_nominatifs', function (Blueprint $table) {
            $table->dropColumn(['anggaran_berjalan', 'anggaran_sp2d']);
        });

        // Rename back to original
        Schema::rename('master_nominatifs', 'nominatifs');
    }
};