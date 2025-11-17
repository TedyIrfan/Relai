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
        Schema::table('master_nominatifs', function (Blueprint $table) {
            // Remove the old JSON field
            $table->dropColumn('rute_perjalanan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_nominatifs', function (Blueprint $table) {
            // Add back the old JSON field
            $table->json('rute_perjalanan')->nullable()->after('is_editable');
        });
    }
};