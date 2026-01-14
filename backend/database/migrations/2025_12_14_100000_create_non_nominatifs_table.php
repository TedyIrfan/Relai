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
        Schema::create('non_nominatifs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rka_detail_id')->constrained('rka_details');
            $table->foreignId('user_id')->constrained('users');
            $table->string('deskripsi_kegiatan');
            $table->date('tanggal'); // Required field
            $table->decimal('total_anggaran_terpakai', 15, 2)->default(0); // Required field
            $table->string('evidence_link'); // Required field
            $table->enum('status', ['draft', 'submitted', 'rejected'])->default('draft');
            $table->timestamps();

            // Add indexes
            $table->index('rka_detail_id');
            $table->index('user_id');
            $table->index('status');
            $table->index('tanggal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('non_nominatifs');
    }
};