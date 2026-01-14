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
            // Change parent_section from varchar(255) to text to accommodate long labels
            $table->text('parent_section')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sbm_details', function (Blueprint $table) {
            $table->string('parent_section', 255)->nullable()->change();
        });
    }
};
