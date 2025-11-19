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
        // DISABLED: This migration is now redundant and conflicts with the updated migration 2025_11_14_000003
        // All functionality is now included in the main table creation migration
        // This migration would cause column rename conflicts since the columns already exist with correct names

        // No action needed - everything is handled in migration 2025_11_14_000003_create_nominatif_biaya_rows_table.php
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No action needed for disabled migration
    }
};