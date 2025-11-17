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
        Schema::create('rute_perjalanan_nominatifs', function (Blueprint $table) {
            $table->id();

            // Foreign key relationship
            $table->foreignId('master_nominatif_id')->constrained('master_nominatifs')->onDelete('cascade');
            $table->unique('master_nominatif_id'); // One-to-one relationship

            // Trip information
            $table->integer('total_hari');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');

            // Route information
            $table->string('dari', 100)->default('Jakarta');
            $table->string('pulang', 100)->default('Jakarta');
            $table->json('tujuan_list'); // Dynamic destinations array

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index(['master_nominatif_id']);
            $table->index(['tanggal_mulai', 'tanggal_selesai']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rute_perjalanan_nominatifs');
    }
};