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
        // 1. Remove duplicate field 'nama' from nominatif_detail_rows table
        Schema::table('nominatif_detail_rows', function (Blueprint $table) {
            $table->dropColumn('nama');
        });

        // 2. Update nominatif_evidence table - remove file upload, add Google Drive link fields
        Schema::table('nominatif_evidence', function (Blueprint $table) {
            // Drop old file upload fields
            $table->dropColumn([
                'evidence_foto_path',
                'evidence_foto_name',
                'evidence_foto_size',
                'evidence_foto_type'
            ]);

            // Add new Google Drive link fields (with preview support)
            $table->string('evidence_link', 1000)->after('nominatif_detail_row_id');
            $table->string('evidence_name', 255)->after('evidence_link');

            // Add index for better performance
            $table->index('evidence_link');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse nominatif_evidence table changes
        Schema::table('nominatif_evidence', function (Blueprint $table) {
            // Drop new Google Drive link fields
            $table->dropIndex(['evidence_link']);
            $table->dropColumn(['evidence_link', 'evidence_name']);

            // Add back old file upload fields
            $table->string('evidence_foto_path', 500);
            $table->string('evidence_foto_name', 255);
            $table->integer('evidence_foto_size');
            $table->string('evidence_foto_type', 100);
        });

        // Reverse nominatif_detail_rows table changes
        Schema::table('nominatif_detail_rows', function (Blueprint $table) {
            $table->string('nama', 255)->after('eselon');
        });
    }
};
