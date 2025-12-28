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
            $table->unsignedInteger('sbm_number')->nullable()->after('category')->index();
            $table->string('source_file')->nullable()->after('sbm_number');
            $table->unsignedInteger('display_order')->nullable()->after('source_file')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sbm_details', function (Blueprint $table) {
            $table->dropIndex(['display_order']);
            $table->dropIndex(['sbm_number']);
            $table->dropColumn(['source_file', 'display_order', 'sbm_number']);
        });
    }
};
