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
        Schema::create('transportasi_tambahan_orang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tambahan_orang_nominatif_id')->constrained('tambahan_orang_nominatifs')->onDelete('cascade');

            // Transportasi Detail
            $table->integer('hari'); // Hari ke-berapa
            $table->enum('arah', ['pergi', 'pulang']); // Pergi atau Pulang
            $table->string('jenis_transportasi')->nullable(); // pesawat, kereta, bis, mobil, taxi
            $table->text('keterangan')->nullable();
            $table->decimal('pagu', 15, 2)->default(0);
            $table->decimal('biaya_aktual', 15, 2)->default(0);

            $table->timestamps();

            // Unique constraint - tidak boleh ada duplikat hari+arah untuk orang yang sama
            $table->unique(['tambahan_orang_nominatif_id', 'hari', 'arah'], 'transport_tambahan_unique');

            // Indexes untuk performance
            $table->index('tambahan_orang_nominatif_id');
            $table->index('hari');
            $table->index('arah');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transportasi_tambahan_orang');
    }
};