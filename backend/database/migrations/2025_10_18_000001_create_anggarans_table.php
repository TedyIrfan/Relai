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
        Schema::create('anggarans', function (Blueprint $table) {
            $table->id();
            $table->integer('tahun')->unique();
            $table->decimal('total_anggaran', 15, 2)->default(0);
            $table->decimal('anggaran_terpakai', 15, 2)->default(0);
            $table->decimal('sp2d', 15, 2)->default(0);
            $table->text('keterangan')->nullable();
            $table->timestamps();

            // Index untuk pencarian cepat
            $table->index('tahun');
        });

        // Add PostgreSQL generated column
        DB::statement('ALTER TABLE anggarans ADD COLUMN sisa_anggaran DECIMAL(15,2) GENERATED ALWAYS AS (total_anggaran - anggaran_terpakai) STORED');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anggarans');
    }
};