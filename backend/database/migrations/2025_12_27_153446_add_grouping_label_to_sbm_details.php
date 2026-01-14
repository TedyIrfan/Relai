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
        Schema::table('sbm_details', function (Blueprint $table) {
            // Add grouping_label column after section
            $table->string('grouping_label')->nullable()->after('section');

            // Add index for fast queries
            $table->index('grouping_label');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sbm_details', function (Blueprint $table) {
            // Drop index first
            $table->dropIndex(['grouping_label']);

            // Drop column
            $table->dropColumn('grouping_label');
        });
    }
};
