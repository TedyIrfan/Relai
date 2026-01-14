-- =====================================================
-- CLEANUP OLD NOMINATIF SYSTEM TABLES
-- Created: 2025-11-17
-- Purpose: Menghapus old nominatif system setelah backup
-- WARNING: Run backup script first!
-- =====================================================

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Drop old nominatif tables (foreign key constraints dihandle dengan cascade)
DROP TABLE IF EXISTS transportasi_tambahan_orang CASCADE;
DROP TABLE IF EXISTS rute_perjalanan_tambahan_orang CASCADE;
DROP TABLE IF EXISTS penginapan_tambahan_orang CASCADE;
DROP TABLE IF EXISTS transportasi_nominatifs CASCADE;
DROP TABLE IF EXISTS rute_perjalanan_nominatifs CASCADE;
DROP TABLE IF EXISTS penginapan_nominatifs CASCADE;
DROP TABLE IF EXISTS tambahan_orang_nominatifs CASCADE;
DROP TABLE IF EXISTS rute_perjalanans CASCADE;
DROP TABLE IF EXISTS master_nominatifs CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Clean up cache
TRUNCATE TABLE cache RESTART IDENTITY CASCADE;
TRUNCATE TABLE cache_locks RESTART IDENTITY CASCADE;

-- Verify old tables are deleted
SELECT
    schemaname,
    tablename,
    n_tup_ins as rows_count
FROM pg_stat_user_tables
WHERE tablename IN (
    'master_nominatifs', 'transportasi_nominatifs', 'tambahan_orang_nominatifs',
    'rute_perjalanan_nominatifs', 'penginapan_nominatifs', 'transportasi_tambahan_orang',
    'rute_perjalanan_tambahan_orang', 'penginapan_tambahan_orang', 'rute_perjalanans'
);

-- Show remaining tables
SELECT
    schemaname,
    tablename,
    n_tup_ins as rows_count
FROM pg_stat_user_tables
WHERE tablename NOT LIKE 'backup_%'
ORDER BY tablename;