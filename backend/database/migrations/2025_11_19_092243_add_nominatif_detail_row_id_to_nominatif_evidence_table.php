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
        Schema::table('nominatif_evidence', function (Blueprint $table) {
            // Add foreign key to nominatif detail row
            $table->foreignId('nominatif_detail_row_id')->nullable()->after('id')->constrained('nominatif_detail_rows')->onDelete('cascade');

            // Add index for performance
            $table->index('nominatif_detail_row_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nominatif_evidence', function (Blueprint $table) {
            // Drop foreign key and index
            $table->dropForeign(['nominatif_detail_row_id']);
            $table->dropIndex(['nominatif_detail_row_id']);
            $table->dropColumn('nominatif_detail_row_id');
        });
    }
};
