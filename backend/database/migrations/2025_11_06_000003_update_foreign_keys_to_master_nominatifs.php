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
        // Update foreign key references in related tables
        Schema::table('transportasi_nominatifs', function (Blueprint $table) {
            // Drop existing foreign key
            $table->dropForeign(['nominatif_id']);
            // Add new foreign key pointing to master_nominatifs
            $table->foreign('nominatif_id')->references('id')->on('master_nominatifs')->onDelete('cascade');
        });

        Schema::table('tambahan_orang_nominatifs', function (Blueprint $table) {
            // Drop existing foreign key
            $table->dropForeign(['nominatif_id']);
            // Add new foreign key pointing to master_nominatifs
            $table->foreign('nominatif_id')->references('id')->on('master_nominatifs')->onDelete('cascade');
        });

        // Update rute_perjalanan_nominatifs if exists
        if (Schema::hasTable('rute_perjalanan_nominatifs')) {
            Schema::table('rute_perjalanan_nominatifs', function (Blueprint $table) {
                // Drop existing foreign key
                $table->dropForeign(['nominatif_id']);
                // Add new foreign key pointing to master_nominatifs
                $table->foreign('nominatif_id')->references('id')->on('master_nominatifs')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert foreign key references back to nominatifs
        Schema::table('transportasi_nominatifs', function (Blueprint $table) {
            $table->dropForeign(['nominatif_id']);
            $table->foreign('nominatif_id')->references('id')->on('nominatifs')->onDelete('cascade');
        });

        Schema::table('tambahan_orang_nominatifs', function (Blueprint $table) {
            $table->dropForeign(['nominatif_id']);
            $table->foreign('nominatif_id')->references('id')->on('nominatifs')->onDelete('cascade');
        });

        if (Schema::hasTable('rute_perjalanan_nominatifs')) {
            Schema::table('rute_perjalanan_nominatifs', function (Blueprint $table) {
                $table->dropForeign(['nominatif_id']);
                $table->foreign('nominatif_id')->references('id')->on('nominatifs')->onDelete('cascade');
            });
        }
    }
};