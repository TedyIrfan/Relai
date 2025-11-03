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
        Schema::create('nominatifs', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('rka_detail_id')->constrained('rka_details');
            $table->foreignId('user_id')->constrained('users');

            // Section 1: Detail Perjalanan Dinas
            $table->text('deskripsi_perjalanan_dinas');

            // Section 2: Kode Anggaran (dari foreign key rka_detail_id)

            // Section 3: Detail Perjalanan
            $table->integer('jumlah_hari');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');

            // Status & Control
            $table->enum('status', ['draft', 'submitted'])->default('draft');
            $table->boolean('is_editable')->default(true);

            // JSON fields untuk data kompleks
            $table->json('rute_perjalanan')->nullable(); // Array of routes
            $table->json('transportasi_per_hari')->nullable(); // Array of daily transport
            $table->json('penginapan')->nullable(); // Penginapan details
            $table->json('uang_harian')->nullable(); // Uang harian details
            $table->json('uang_representasi')->nullable(); // Uang representasi details

            // Summary fields (calculated)
            $table->decimal('total_pagu', 15, 2)->default(0);
            $table->decimal('total_biaya_aktual', 15, 2)->default(0);
            $table->decimal('total_anggaran_realisasi', 15, 2)->default(0);

            $table->timestamps();

            // Indexes
            $table->index(['rka_detail_id', 'status']);
            $table->index('user_id');
            $table->index('status');
            $table->index(['tanggal_mulai', 'tanggal_selesai']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nominatifs');
    }
};
