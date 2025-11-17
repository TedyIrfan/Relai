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
        Schema::create('nominatif_biaya_rows', function (Blueprint $table) {
            $table->id();

            // Foreign key
            $table->foreignId('nominatif_detail_row_id')->constrained('nominatif_detail_rows')->onDelete('cascade');

            // Transportasi (8 columns - 4 pairs)
            $table->decimal('transport_taksi_pergi_pagu', 15, 2)->default(0);
            $table->decimal('transport_taksi_pergi_aktual', 15, 2)->default(0);
            $table->decimal('transport_pergi_pagu', 15, 2)->default(0);
            $table->decimal('transport_pergi_aktual', 15, 2)->default(0);
            $table->decimal('transport_taksi_pulang_pagu', 15, 2)->default(0);
            $table->decimal('transport_taksi_pulang_aktual', 15, 2)->default(0);
            $table->decimal('transport_pulang_pagu', 15, 2)->default(0);
            $table->decimal('transport_pulang_aktual', 15, 2)->default(0);

            // Penginapan & Uang (6 columns - 3 pairs)
            $table->decimal('penginapan_pagu', 15, 2)->default(0);
            $table->decimal('penginapan_aktual', 15, 2)->default(0);
            $table->decimal('uang_harian_fullboard_pagu', 15, 2)->default(0);
            $table->decimal('uang_harian_fullboard_aktual', 15, 2)->default(0);
            $table->decimal('uang_harian_pagu', 15, 2)->default(0);
            $table->decimal('uang_harian_aktual', 15, 2)->default(0);

            // Uang Representasi (2 columns - 1 pair)
            $table->decimal('uang_representasi_pagu', 15, 2)->default(0);
            $table->decimal('uang_representasi_aktual', 15, 2)->default(0);

            // Auto-calculated totals (PostgreSQL syntax)
            $table->decimal('total_pagu_row', 15, 2)->generatedAlwaysAs('
                transport_taksi_pergi_pagu + transport_pergi_pagu +
                transport_taksi_pulang_pagu + transport_pulang_pagu +
                penginapan_pagu + uang_harian_fullboard_pagu +
                uang_harian_pagu + uang_representasi_pagu
            ')->stored();

            $table->decimal('total_aktual_row', 15, 2)->generatedAlwaysAs('
                transport_taksi_pergi_aktual + transport_pergi_aktual +
                transport_taksi_pulang_aktual + transport_pulang_aktual +
                penginapan_aktual + uang_harian_fullboard_aktual +
                uang_harian_aktual + uang_representasi_aktual
            ')->stored();

            $table->timestamps();

            // Indexes
            $table->index('nominatif_detail_row_id');
            $table->index(['total_pagu_row', 'total_aktual_row']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nominatif_biaya_rows');
    }
};