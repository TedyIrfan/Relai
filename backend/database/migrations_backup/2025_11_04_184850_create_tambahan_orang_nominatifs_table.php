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
        Schema::create('tambahan_orang_nominatifs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nominatif_id')->constrained('nominatifs')->onDelete('cascade');
            $table->string('nama_peserta');
            $table->string('jabatan_peserta');
            $table->decimal('pagu', 15, 2)->default(0);
            $table->decimal('aktual', 15, 2)->default(0);
            $table->decimal('anggaran_realisasi', 15, 2)->storedAs('pagu - aktual');
            $table->timestamps();

            $table->index(['nominatif_id', 'nama_peserta']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tambahan_orang_nominatifs');
    }
};
