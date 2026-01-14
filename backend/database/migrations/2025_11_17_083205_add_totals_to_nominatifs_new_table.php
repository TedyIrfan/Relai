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
        Schema::table('nominatifs_new', function (Blueprint $table) {
            // Total calculations per trip
            $table->decimal('total_pagu_trip', 15, 2)->default(0);
            $table->decimal('total_aktual_trip', 15, 2)->default(0);
            $table->decimal('total_anggaran_berjalan_trip', 15, 2)->default(0);

            // Indexes for performance
            $table->index(['rka_detail_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nominatifs_new', function (Blueprint $table) {
            $table->dropIndex(['rka_detail_id', 'status']);
            $table->dropColumn([
                'total_pagu_trip',
                'total_aktual_trip',
                'total_anggaran_berjalan_trip'
            ]);
        });
    }
};
