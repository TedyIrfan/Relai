<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Disable transaction for this migration (CONCURRENTLY requires no transaction)
     */
    public $withinTransaction = false;

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Enable PG_TRGM extension for fuzzy search
        DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');

        // Step 2: GIN Index for exact match - cast json to jsonb for indexing
        DB::statement('
            CREATE INDEX CONCURRENTLY IF NOT EXISTS sbm_details_data_gin_idx
            ON sbm_details USING GIN ((data::jsonb) jsonb_path_ops)
        ');

        // Step 3: GIN Index for fuzzy search (trigram) on text representation
        DB::statement('
            CREATE INDEX CONCURRENTLY IF NOT EXISTS sbm_details_data_trgm_idx
            ON sbm_details USING GIN ((data::text) gin_trgm_ops)
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback: Drop indexes
        DB::statement('DROP INDEX IF EXISTS sbm_details_data_gin_idx');
        DB::statement('DROP INDEX IF EXISTS sbm_details_data_trgm_idx');

        // Optional: Drop extension (commented out to avoid affecting other tables)
        // DB::statement('DROP EXTENSION IF NOT EXISTS pg_trgm');
    }
};
