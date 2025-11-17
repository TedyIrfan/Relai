-- =====================================================
-- BACKUP OLD NOMINATIF SYSTEM TABLES
-- Created: 2025-11-17
-- Purpose: Backup sebelum menghapus old nominatif system
-- =====================================================

-- Backup old nominatif tables ke dalam backup tables dengan timestamp
CREATE TABLE backup_master_nominatifs_20251117 AS SELECT * FROM master_nominatifs;
CREATE TABLE backup_transportasi_nominatifs_20251117 AS SELECT * FROM transportasi_nominatifs;
CREATE TABLE backup_tambahan_orang_nominatifs_20251117 AS SELECT * FROM tambahan_orang_nominatifs;
CREATE TABLE backup_rute_perjalanan_nominatifs_20251117 AS SELECT * FROM rute_perjalanan_nominatifs;
CREATE TABLE backup_penginapan_nominatifs_20251117 AS SELECT * FROM penginapan_nominatifs;
CREATE TABLE backup_transportasi_tambahan_orang_20251117 AS SELECT * FROM transportasi_tambahan_orang;
CREATE TABLE backup_rute_perjalanan_tambahan_orang_20251117 AS SELECT * FROM rute_perjalanan_tambahan_orang;
CREATE TABLE backup_penginapan_tambahan_orang_20251117 AS SELECT * FROM penginapan_tambahan_orang;
CREATE TABLE backup_rute_perjalanans_20251117 AS SELECT * FROM rute_perjalanans;

-- Verifikasi backup berhasil dibuat
SELECT
    schemaname,
    tablename,
    n_tup_ins as rows_count
FROM pg_stat_user_tables
WHERE tablename LIKE 'backup_%_20251117'
ORDER BY tablename;

-- Tampilkan summary backup data
SELECT
    'backup_master_nominatifs_20251117' as table_name, COUNT(*) as record_count FROM backup_master_nominatifs_20251117
UNION ALL
SELECT
    'backup_transportasi_nominatifs_20251117' as table_name, COUNT(*) as record_count FROM backup_transportasi_nominatifs_20251117
UNION ALL
SELECT
    'backup_tambahan_orang_nominatifs_20251117' as table_name, COUNT(*) as record_count FROM backup_tambahan_orang_nominatifs_20251117
UNION ALL
SELECT
    'backup_rute_perjalanan_nominatifs_20251117' as table_name, COUNT(*) as record_count FROM backup_rute_perjalanan_nominatifs_20251117
UNION ALL
SELECT
    'backup_penginapan_nominatifs_20251117' as table_name, COUNT(*) as record_count FROM backup_penginapan_nominatifs_20251117
UNION ALL
SELECT
    'backup_transportasi_tambahan_orang_20251117' as table_name, COUNT(*) as record_count FROM backup_transportasi_tambahan_orang_20251117
UNION ALL
SELECT
    'backup_rute_perjalanan_tambahan_orang_20251117' as table_name, COUNT(*) as record_count FROM backup_rute_perjalanan_tambahan_orang_20251117
UNION ALL
SELECT
    'backup_penginapan_tambahan_orang_20251117' as table_name, COUNT(*) as record_count FROM backup_penginapan_tambahan_orang_20251117
UNION ALL
SELECT
    'backup_rute_perjalanans_20251117' as table_name, COUNT(*) as record_count FROM backup_rute_perjalanans_20251117;