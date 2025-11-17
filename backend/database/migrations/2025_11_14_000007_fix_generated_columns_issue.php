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
        // Drop generated columns and recreate as regular columns
        Schema::table('nominatif_biaya_rows', function (Blueprint $table) {
            // Drop generated columns
            $table->dropColumn(['total_pagu_row', 'total_aktual_row']);
        });

        Schema::table('nominatif_biaya_rows', function (Blueprint $table) {
            // Add regular calculated columns with default 0
            $table->decimal('total_pagu_row', 15, 2)->default(0)->after('uang_representasi_aktual');
            $table->decimal('total_aktual_row', 15, 2)->default(0)->after('total_pagu_row');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nominatif_biaya_rows', function (Blueprint $table) {
            $table->dropColumn(['total_pagu_row', 'total_aktual_row']);
        });

        Schema::table('nominatif_biaya_rows', function (Blueprint $table) {
            // Restore generated columns (PostgreSQL syntax)
            $table->decimal('total_pagu_row', 15, 2)->generatedAlwaysAs('
                transport_taksi_pergi_pagu + transport_pergi_pagu +
                transport_taksi_pulang_pagu + transport_pulang_pagu +
                penginapan_pagu + uang_harian_fullboard_pagu +
                uang_harian_pagu + uang_representasi_pagu
            ')->stored()->after('uang_representasi_aktual');

            $table->decimal('total_aktual_row', 15, 2)->generatedAlwaysAs('
                transport_taksi_pergi_aktual + transport_pergi_aktual +
                transport_taksi_pulang_aktual + transport_pulang_aktual +
                penginapan_aktual + uang_harian_fullboard_aktual +
                uang_harian_aktual + uang_representasi_aktual
            ')->stored()->after('total_pagu_row');
        });
    }
};