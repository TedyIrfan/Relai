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
        Schema::create('nominatif_evidence', function (Blueprint $table) {
            $table->id();

            // Foreign key to main nominatif
            $table->foreignId('nominatif_id')->constrained('nominatifs_new')->onDelete('cascade');

            // File data
            $table->string('evidence_foto_path', 255);
            $table->string('evidence_foto_name', 255);
            $table->integer('evidence_foto_size');
            $table->string('evidence_foto_type', 50);
            $table->text('keterangan')->nullable();

            // Indexes
            $table->index('nominatif_id');
            $table->index('evidence_foto_type');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nominatif_evidence');
    }
};