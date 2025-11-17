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
        Schema::table('tambahan_orang_nominatifs', function (Blueprint $table) {
            // Add calculated fields if not exists
            if (!Schema::hasColumn('tambahan_orang_nominatifs', 'total_pagu')) {
                $table->decimal('total_pagu', 15, 2)->default(0);
            }
            if (!Schema::hasColumn('tambahan_orang_nominatifs', 'total_biaya_aktual')) {
                $table->decimal('total_biaya_aktual', 15, 2)->default(0);
            }
            if (!Schema::hasColumn('tambahan_orang_nominatifs', 'anggaran_berjalan')) {
                $table->decimal('anggaran_berjalan', 15, 2)->default(0);
            }

            // Check if master_nominatif_id exists, if not add it
            if (!Schema::hasColumn('tambahan_orang_nominatifs', 'master_nominatif_id')) {
                $table->foreignId('master_nominatif_id')->nullable()->after('id');
                $table->foreign('master_nominatif_id')->references('id')->on('master_nominatifs')->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tambahan_orang_nominatifs', function (Blueprint $table) {
            // Remove calculated fields
            $table->dropColumn(['total_pagu', 'total_biaya_aktual', 'anggaran_berjalan']);

            // Remove master_nominatif_id if it exists (no revert needed for now)
            if (Schema::hasColumn('tambahan_orang_nominatifs', 'master_nominatif_id')) {
                $table->dropForeign(['master_nominatif_id']);
                $table->dropColumn('master_nominatif_id');
            }
        });
    }
};