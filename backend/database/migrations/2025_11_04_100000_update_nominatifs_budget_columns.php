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
        Schema::table('nominatifs', function (Blueprint $table) {
            // Rename total_anggaran_realisasi to anggaran_berjalan
            $table->renameColumn('total_anggaran_realisasi', 'anggaran_berjalan');

            // Add new anggaran_sp2d column
            $table->decimal('anggaran_sp2d', 15, 2)->default(0)->after('anggaran_berjalan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nominatifs', function (Blueprint $table) {
            // Drop anggaran_sp2d column
            $table->dropColumn('anggaran_sp2d');

            // Rename anggaran_berjalan back to total_anggaran_realisasi
            $table->renameColumn('anggaran_berjalan', 'total_anggaran_realisasi');
        });
    }
};