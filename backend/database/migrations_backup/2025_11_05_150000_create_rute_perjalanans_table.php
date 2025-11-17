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
        Schema::create('rute_perjalanans', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('nominatif_id')->constrained('nominatifs')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users');

            // Section 3: Detail Perjalanan (overview data)
            $table->integer('jumlah_hari')->default(1);
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->text('keterangan_perjalanan')->nullable(); // Overall trip notes

            // Route details (per hari)
            $table->integer('hari'); // Day number (1, 2, 3, etc.)
            $table->string('dari'); // Starting point
            $table->string('tujuan')->nullable(); // Primary destination
            $table->string('tujuan2')->nullable(); // Secondary destination (for 3+ days)
            $table->string('tujuan3')->nullable(); // Third destination (for 4+ days)
            $table->string('tujuan4')->nullable(); // Fourth destination (for 5+ days)
            $table->string('tujuan5')->nullable(); // Fifth destination (for 6+ days)
            $table->string('tujuan6')->nullable(); // Sixth destination (for 7+ days)
            $table->string('pulang')->nullable(); // Return destination
            $table->date('tanggal'); // Date for this specific route

            // Additional fields for future use
            $table->text('keterangan')->nullable(); // Additional notes for this route

            $table->timestamps();

            // Indexes
            $table->index(['nominatif_id', 'hari']);
            $table->index('user_id');
            $table->index(['tanggal_mulai', 'tanggal_selesai']);
            $table->index('tanggal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rute_perjalanans');
    }
};