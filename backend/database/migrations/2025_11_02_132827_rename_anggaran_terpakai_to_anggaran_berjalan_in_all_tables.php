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
        // Rename anggaran_terpakai to anggaran_berjalan in anggarans table
        Schema::table('anggarans', function (Blueprint $table) {
            $table->renameColumn('anggaran_terpakai', 'anggaran_berjalan');
        });

        // Rename anggaran_terpakai_kategori to anggaran_berjalan_kategori in kategori_anggarans table
        Schema::table('kategori_anggarans', function (Blueprint $table) {
            $table->renameColumn('anggaran_terpakai_kategori', 'anggaran_berjalan_kategori');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback changes
        Schema::table('anggarans', function (Blueprint $table) {
            $table->renameColumn('anggaran_berjalan', 'anggaran_terpakai');
        });

        Schema::table('kategori_anggarans', function (Blueprint $table) {
            $table->renameColumn('anggaran_berjalan_kategori', 'anggaran_terpakai_kategori');
        });
    }
};
