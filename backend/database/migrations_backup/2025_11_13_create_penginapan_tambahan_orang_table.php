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
        Schema::create('penginapan_tambahan_orang', function (Blueprint $table) {
            $table->id();

            // Foreign key ke tambahan_orang_nominatifs (parent-child relationship)
            $table->foreignId('tambahan_orang_nominatif_id')->constrained('tambahan_orang_nominatifs')->onDelete('cascade');

            // Penginapan details per orang
            $table->integer('malam')->comment('Malam ke-berapa penginapan untuk orang ini (1, 2, 3, ...)');
            $table->string('lokasi_penginapan', 100)->nullable()->comment('Lokasi/kota penginapan');
            $table->string('nama_hotel')->nullable()->comment('Nama hotel tempat menginap');
            $table->text('keterangan')->nullable()->comment('Keterangan tambahan penginapan (kamar, lantai, dll)');

            // Room details
            $table->string('tipe_kamar')->nullable()->comment('Tipe kamar: Standard, Deluxe, Suite, etc.');
            $table->string('nomor_kamar')->nullable()->comment('Nomor kamar');
            $table->integer('kapasitas')->default(1)->comment('Kapasitas kamar (berapa orang)');

            // Budget dan actual per orang
            $table->decimal('pagu', 15, 2)->default(0)->comment('Budget alokasi per malam untuk orang ini');
            $table->decimal('biaya_aktual', 15, 2)->default(0)->comment('Biaya realisasi per malam untuk orang ini');
            $table->decimal('anggaran_realisasi', 15, 2)->storedAs('pagu - biaya_aktual')->comment('Pagu - Biaya Aktual');

            // Status dan control
            $table->boolean('dipesan')->default(true)->comment('Sudah dibayar?');
            $table->date('tanggal_checkin')->nullable()->comment('Tanggal checkin');
            $table->date('tanggal_checkout')->nullable()->comment('Tanggal checkout');
            $table->string('kode_booking')->nullable()->comment('Kode booking hotel');

            // Timestamps
            $table->timestamps();

            // Indexes untuk performance
            $table->index(['tambahan_orang_nominatif_id', 'malam']);
            $table->index(['tambahan_orang_nominatif_id', 'lokasi_penginapan']);
            $table->index('nama_hotel');

            // Unique constraint: satu orang tidak boleh nginap di malam yang sama
            $table->unique(['tambahan_orang_nominatif_id', 'malam'], 'penginapan_orang_unique_malam');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penginapan_tambahan_orang');
    }
};