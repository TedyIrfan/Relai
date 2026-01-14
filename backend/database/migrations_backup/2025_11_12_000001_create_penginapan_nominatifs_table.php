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
        Schema::create('penginapan_nominatifs', function (Blueprint $table) {
            $table->id();

            // Foreign key ke master_nominatifs (parent-child relationship)
            $table->foreignId('master_nominatif_id')->constrained('master_nominatifs')->onDelete('cascade');

            // Penginapan details
            $table->integer('malam')->comment('Malam ke-berapa penginapan (1, 2, 3, ...)');
            $table->string('lokasi_penginapan', 100)->nullable()->comment('Lokasi/kota penginapan (ambil dari rute_perjalanan)');
            $table->string('nama_hotel')->nullable()->comment('Nama hotel tempat menginap (opsional)');
            $table->text('keterangan')->nullable()->comment('Keterangan tambahan penginapan');

            // Budget dan actual (follow transportasi pattern)
            $table->decimal('pagu', 15, 2)->default(0)->comment('Budget alokasi per malam');
            $table->decimal('biaya_aktual', 15, 2)->default(0)->comment('Biaya realisasi per malam');
            $table->decimal('anggaran_realisasi', 15, 2)->storedAs('pagu - biaya_aktual')->comment('Pagu - Biaya Aktual');

            // Timestamps
            $table->timestamps();

            // Indexes untuk performance
            $table->index(['master_nominatif_id', 'malam']);
            $table->index(['master_nominatif_id', 'lokasi_penginapan']);
            $table->unique(['master_nominatif_id', 'malam']); // Unique per master per malam
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penginapan_nominatifs');
    }
};