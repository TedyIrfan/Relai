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
        Schema::create('kategori_anggarans', function (Blueprint $table) {
            $table->id();
            $table->integer('tahun');
            $table->string('nama_kategori', 50); // 'Kategori A', 'Kategori B', 'Kategori C'
            $table->decimal('total_anggaran_kategori', 15, 2)->default(0);
            $table->decimal('anggaran_terpakai_kategori', 15, 2)->default(0);
            $table->decimal('sp2d_kategori', 15, 2)->default(0);
            $table->text('keterangan')->nullable();
            $table->timestamps();

            // Unique combination per tahun dan kategori
            $table->unique(['tahun', 'nama_kategori']);

            // Indexes for performance
            $table->index('tahun');
            $table->index('nama_kategori');
            $table->index(['tahun', 'nama_kategori']);
        });

        // Add PostgreSQL generated column untuk sisa anggaran per kategori
        DB::statement('ALTER TABLE kategori_anggarans ADD COLUMN sisa_anggaran_kategori DECIMAL(15,2) GENERATED ALWAYS AS (total_anggaran_kategori - anggaran_terpakai_kategori) STORED');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kategori_anggarans');
    }
};
