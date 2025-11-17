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

            // Foreign key
            $table->foreignId('nominatif_detail_row_id')->constrained('nominatif_detail_rows')->onDelete('cascade');

            // File data
            $table->string('evidence_foto_path', 255);
            $table->string('evidence_foto_name', 255);
            $table->integer('evidence_foto_size');
            $table->string('evidence_foto_type', 50);
            $table->text('keterangan')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('nominatif_detail_row_id');
            $table->index('evidence_foto_type');
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