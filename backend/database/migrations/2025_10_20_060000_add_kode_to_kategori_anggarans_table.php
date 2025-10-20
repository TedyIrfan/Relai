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
        Schema::table('kategori_anggarans', function (Blueprint $table) {
            // Add kode column as nullable first, then we'll fill it
            $table->string('kode', 10)->nullable()->after('id');
        });

        // Update existing data to have proper kode
        \DB::statement("
            UPDATE kategori_anggarans
            SET kode = CASE
                WHEN nama_kategori LIKE '%A%' THEN 'A'
                WHEN nama_kategori LIKE '%B%' THEN 'B'
                WHEN nama_kategori LIKE '%C%' THEN 'C'
                ELSE 'OTHER'
            END
            WHERE kode IS NULL
        ");

        // Now make it NOT NULL and add indexes
        Schema::table('kategori_anggarans', function (Blueprint $table) {
            $table->string('kode', 10)->nullable(false)->change();

            // Add index for faster lookup
            $table->index('kode');

            // Make unique combination of tahun and kode
            $table->unique(['tahun', 'kode']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kategori_anggarans', function (Blueprint $table) {
            $table->dropIndex(['kode']);
            $table->dropUnique(['tahun', 'kode']);
            $table->dropColumn('kode');
        });
    }
};