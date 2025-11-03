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
        Schema::create('transportasi_nominatifs', function (Blueprint $table) {
            $table->id();

            // Foreign key ke nominatifs
            $table->foreignId('nominatif_id')->constrained('nominatifs')->onDelete('cascade');

            // Detail transportasi
            $table->integer('hari')->comment('Hari ke-berapa perjalanan');
            $table->enum('arah', ['pergi', 'pulang'])->comment('Arah transportasi: pergi atau pulang');
            $table->string('jenis_transportasi', 50)->nullable()->comment('Jenis: Pesawat, Taksi, Kereta, dll');

            // Budget dan actual
            $table->decimal('pagu', 15, 2)->default(0)->comment('Budget alokasi');
            $table->decimal('biaya_aktual', 15, 2)->default(0)->comment('Biaya realisasi');
            $table->decimal('anggaran_realisasi', 15, 2)->default(0)->comment('Pagu - Biaya Aktual');

            // Keterangan tambahan
            $table->text('keterangan')->nullable()->comment('Keterangan transportasi');

            // Timestamps
            $table->timestamps();

            // Indexes untuk performance
            $table->index(['nominatif_id', 'hari']);
            $table->index(['nominatif_id', 'arah']);
            $table->index(['nominatif_id', 'hari', 'arah']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transportasi_nominatifs');
    }
};