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
        Schema::table('rka_details', function (Blueprint $table) {
            $table->decimal('anggaran_layanan_used', 15, 2)->default(0)->after('anggaran_layanan');
        });

        // Add computed column manually for PostgreSQL
        DB::statement('ALTER TABLE rka_details ADD COLUMN anggaran_layanan_available DECIMAL(15,2) GENERATED ALWAYS AS (anggaran_layanan - anggaran_layanan_used) STORED');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rka_details', function (Blueprint $table) {
            $table->dropVirtualColumn('anggaran_layanan_available');
            $table->dropColumn('anggaran_layanan_used');
        });
    }
};
