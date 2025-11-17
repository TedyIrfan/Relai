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
        Schema::create('nominatif_detail_rows', function (Blueprint $table) {
            $table->id();

            // Foreign key
            $table->foreignId('nominatif_id')->constrained('nominatifs_new')->onDelete('cascade');

            // Person identification
            $table->enum('person_type', ['main', 'tambahan'])->default('main');
            $table->string('person_name', 255);
            $table->integer('row_order')->default(1);

            // Identitas Perjalanan (5 columns)
            $table->string('asal', 100);
            $table->string('tujuan', 100);
            $table->date('tanggal_pergi');
            $table->date('tanggal_sampai');
            $table->integer('no'); // Auto row number

            // Identitas Person (4 columns)
            $table->string('golongan', 10);
            $table->string('jabatan', 255);
            $table->string('eselon', 10);
            $table->string('nama', 255);

            $table->timestamps();

            // Indexes for performance
            $table->index(['nominatif_id', 'person_type']);
            $table->index(['tanggal_pergi', 'tanggal_sampai']);
            $table->index('person_name');
            $table->index('row_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nominatif_detail_rows');
    }
};