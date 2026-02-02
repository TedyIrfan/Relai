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
        Schema::table('nominatif_detail_rows', function (Blueprint $table) {
            $table->string('golongan', 50)->change();
            $table->string('eselon', 50)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nominatif_detail_rows', function (Blueprint $table) {
            $table->string('golongan', 10)->change();
            $table->string('eselon', 10)->change();
        });
    }
};
