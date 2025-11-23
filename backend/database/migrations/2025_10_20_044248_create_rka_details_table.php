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
        Schema::create('rka_details', function (Blueprint $table) {
            $table->id();
            $table->string('program_dukungan_manajemen', 50);
            $table->string('kode_program', 20);
            $table->string('layanan_umum', 50);
            $table->string('kode_layanan_1', 20);
            $table->string('kode_layanan_2', 20);
            $table->string('layanan_tata_usaha', 50);
            $table->foreignId('kategori_anggaran_id')->constrained('kategori_anggarans');
            $table->string('code_rka', 20);
            $table->text('layanan');
            $table->string('wilayah', 100)->nullable();
            $table->string('arti_kode', 255);
            $table->decimal('sisa_pemakaian_anggaran', 5, 2);
            $table->string('status', 20);
            $table->decimal('anggaran_perjalanan', 15, 2);
            $table->decimal('anggaran_layanan', 15, 2);
            $table->string('sbm', 50);

            $table->index(['kategori_anggaran_id', 'code_rka']);
            $table->index('wilayah');
            $table->index('status');
            $table->index('layanan');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rka_details');
    }
};
