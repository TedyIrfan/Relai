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
        Schema::table('rka_details', function (Blueprint $table) {
            // Add budget tracking columns
            $table->decimal('anggaran_berjalan', 15, 2)->default(0)->after('anggaran_layanan');
            $table->decimal('anggaran_sp2d', 15, 2)->default(0)->after('anggaran_berjalan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rka_details', function (Blueprint $table) {
            $table->dropColumn('anggaran_sp2d');
            $table->dropColumn('anggaran_berjalan');
        });
    }
};