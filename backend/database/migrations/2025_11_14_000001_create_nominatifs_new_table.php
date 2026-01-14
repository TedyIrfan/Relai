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
        Schema::create('nominatifs_new', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('rka_detail_id')->constrained('rka_details');
            $table->foreignId('user_id')->constrained('users');

            // Core fields
            $table->text('deskripsi_perjalanan_dinas');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->enum('status', ['draft', 'submitted'])->default('draft');

            // Financial summary
            $table->decimal('total_pagu', 15, 2)->default(0);
            $table->decimal('total_biaya_aktual', 15, 2)->default(0);

            // Indexes for performance
            $table->index(['user_id', 'status']);
            $table->index(['tanggal_mulai', 'tanggal_selesai']);
            $table->index('rka_detail_id');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nominatifs_new');
    }
};