<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL for SQLite to avoid Laravel schema builder issues
        DB::statement('DROP INDEX IF EXISTS nominatifs_tanggal_mulai_tanggal_selesai_index');

        // Drop columns one by one to handle SQLite limitations
        // jumlah_hari already removed, only drop remaining columns
        DB::statement('ALTER TABLE master_nominatifs DROP COLUMN tanggal_mulai');
        DB::statement('ALTER TABLE master_nominatifs DROP COLUMN tanggal_selesai');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_nominatifs', function (Blueprint $table) {
            // Restore duplicate fields untuk rollback
            $table->integer('jumlah_hari')->default(1);
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
        });

        Schema::table('master_nominatifs', function (Blueprint $table) {
            // Recreate indexes
            $table->index(['tanggal_mulai', 'tanggal_selesai'], 'nominatifs_tanggal_mulai_tanggal_selesai_index');
        });
    }
};