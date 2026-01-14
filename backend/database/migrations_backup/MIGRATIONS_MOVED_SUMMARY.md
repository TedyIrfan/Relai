# 📁 Migrations Moved to Backup
**Date:** 2025-11-17
**Reason:** Fixed migration errors for fresh install

---

## 🗑️ **Problematic Migrations Moved (5 files)**

### **1. `2025_11_05_150000_create_rute_perjalanans_table.php`**
- **Problem:** References `nominatifs` table (deleted)
- **Issue:** Foreign key constraint to non-existent table
- **Solution:** Moved to backup, not needed for fresh install

### **2. `2025_11_13_create_penginapan_tambahan_orang_table.php`**
- **Problem:** References `tambahan_orang_nominatifs` table (deleted)
- **Issue:** Foreign key constraint to non-existent table
- **Solution:** Moved to backup, not needed for fresh install

### **3. `2025_11_08_create_rute_perjalanan_tambahan_orang_table.php`**
- **Problem:** References old nominatif system tables
- **Issue:** Dependencies on deleted tables
- **Solution:** Moved to backup, not needed for fresh install

### **4. `2025_11_08_create_transportasi_tambahan_orang_table.php`**
- **Problem:** References old nominatif system tables
- **Issue:** Dependencies on deleted tables
- **Solution:** Moved to backup, not needed for fresh install

### **5. `2025_11_14_000005_migrate_master_nominatifs_to_new.php`**
- **Problem:** Data migration from old to new system
- **Issue:** Only needed for existing data migration, not fresh install
- **Solution:** Moved to backup, not needed for fresh install

---

## ✅ **Active Migrations Remaining (24 files)**

### **Core Laravel System (6):**
- `0001_01_01_000000_create_users_table.php`
- `0001_01_01_000001_create_cache_table.php`
- `0001_01_01_000002_create_jobs_table.php`
- `0001_01_01_000000_create_personal_access_tokens_table.php`
- `0001_01_01_000000_create_password_reset_tokens_table.php`
- `0001_01_01_000000_create_sessions_table.php`

### **Application System (8):**
- `2025_10_17_*` - User management and auth
- `2025_10_18_000001_create_anggarans_table.php`
- `2025_10_19_*` - Budget system
- `2025_10_20_*` - RKA details and kategori
- `2025_10_31_*` - Additional RKA features

### **New Nominatif System (5):**
- `2025_11_14_000001_create_nominatifs_new_table.php`
- `2025_11_14_000002_create_nominatif_detail_rows_table.php`
- `2025_11_14_000003_create_nominatif_biaya_rows_table.php`
- `2025_11_14_000004_create_nominatif_evidence_table.php`
- `2025_11_14_000007_fix_generated_columns_issue.php`

### **Budget Tracking (5):**
- `2025_11_02_*` - Budget terminology updates
- `2025_11_03_*` - SP2D additions
- `2025_11_04_*` - Budget tracking features

---

## 🎯 **Migration Status**

### **Before Fix:**
- ❌ Migration failed: `rute_perjalanans` table creation
- ❌ Foreign key error: `nominatifs` table does not exist
- ❌ 5 problematic migrations blocking fresh install

### **After Fix:**
- ✅ All problematic migrations moved to backup
- ✅ Only new system migrations remain
- ✅ Ready for fresh install

---

## 🚀 **Ready for Fresh Install**

**Command to run:**
```bash
./vendor/bin/sail artisan migrate:fresh --seed
```

**Expected tables after migration:**
- **Total:** ~15 tables
- **Core:** users, anggarans, kategori_anggarans, rka_details
- **New Nominatif:** 4 tables (nominatifs_new, detail_rows, biaya_rows, evidence)
- **System:** migrations, cache, jobs, sessions, tokens

**Status:** ✅ Migration fixed and ready for fresh install!