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
        Schema::create('rute_perjalanan_tambahan_orang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tambahan_orang_nominatif_id')->constrained('tambahan_orang_nominatifs')->onDelete('cascade');

            // Rute Detail
            $table->integer('total_hari')->default(1);
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->string('dari')->default('Jakarta');
            $table->string('pulang')->default('Jakarta');
            $table->json('tujuan_list')->nullable(); // Array of destinations

            $table->timestamps();

            // Unique constraint - satu orang hanya punya satu rute
            $table->unique('tambahan_orang_nominatif_id', 'rute_tambahan_unique');

            // Indexes untuk performance
            $table->index('tambahan_orang_nominatif_id');
            $table->index('tanggal_mulai');
            $table->index('tanggal_selesai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rute_perjalanan_tambahan_orang');
    }
};