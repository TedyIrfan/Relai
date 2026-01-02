# SQL SIMPLE - LANGSUNG DATA JSON

## 1. HONORARIUM 28

```sql
SELECT * FROM sbm_details WHERE category = 'honorarium_28' ORDER BY id;
```

## 2. HONORARIUM 29

```sql
SELECT * FROM sbm_details WHERE category = 'honorarium_29' ORDER BY id;
```

## 3. HONORARIUM 30

```sql
SELECT * FROM sbm_details WHERE category = 'honorarium_30' ORDER BY id;
```

## 4. HONORARIUM 31

```sql
SELECT * FROM sbm_details WHERE category = 'honorarium_31' ORDER BY id;
```

## 5. HONORARIUM 32

```sql
SELECT * FROM sbm_details WHERE category = 'honorarium_32' ORDER BY id;
```

## 6. HONORARIUM 33

```sql
SELECT * FROM sbm_details WHERE category = 'honorarium_33' ORDER BY id;
```

## 7. HONORARIUM 34

```sql
SELECT * FROM sbm_details WHERE category = 'honorarium_34' ORDER BY id;
```

## 8. HONORARIUM 35

```sql
SELECT * FROM sbm_details WHERE category = 'honorarium_35' ORDER BY id;
```

## 9. HONORARIUM 36

```sql
SELECT * FROM sbm_details WHERE category = 'honorarium_36' ORDER BY id;
```

## 10. HONORARIUM 37

```sql
SELECT * FROM sbm_details WHERE category = 'honorarium_37' ORDER BY id;
```

## 11. HONORARIUM 38

```sql
SELECT * FROM sbm_details WHERE category = 'honorarium_38' ORDER BY id;
```

## 12. HONORARIUM 39

```sql
SELECT * FROM sbm_details WHERE category = 'honorarium_39' ORDER BY id;
```

## 13. SECTION 1 - Transportasi Provinsi

```sql
SELECT * FROM sbm_details WHERE category = 'transportasi_provinsi' ORDER BY id;
```

## 14. SECTION 2 - Transportasi DKI

```sql
SELECT * FROM sbm_details WHERE category = 'transportasi_dki' ORDER BY id;
```

## 15. SECTION 3 - Transportasi Kabupaten

```sql
SELECT * FROM sbm_details WHERE category = 'transportasi_kabupaten' ORDER BY id;
```

## 16. SECTION 4 - Pemeliharaan Sarana Kantor

```sql
SELECT * FROM sbm_details WHERE category = 'pemeliharaan_sarana_kantor' ORDER BY id;
```

## 17. SECTION 5 - Penerjemahan

```sql
SELECT * FROM sbm_details WHERE category = 'penerjemahan_pengetikan' ORDER BY id;
```

## 18. SECTION 6 - Beasiswa

```sql
SELECT * FROM sbm_details WHERE category = 'beasiswa' ORDER BY id;
```

## 19. SECTION 7 - Sewa Fotokopi

```sql
SELECT * FROM sbm_details WHERE category = 'sewa_fotokopi' ORDER BY id;
```

## 20. SECTION 8 - Honorarium Narasumber

```sql
SELECT * FROM sbm_details WHERE category = 'honorarium_narasumber' ORDER BY id;
```

## 21. SECTION 9 - Bahan Makanan

```sql
SELECT * FROM sbm_details WHERE category = 'bahan_makanan' ORDER BY id;
```

## 22. SECTION 10 - Konsumsi Tahanan

```sql
SELECT * FROM sbm_details WHERE category = 'konsumsi_tahanan' ORDER BY id;
```

## 23. SECTION 11 - Keperluan Perkantoran

```sql
SELECT * FROM sbm_details WHERE category = 'keperluan_perkantoran' ORDER BY id;
```

## 24. SECTION 12 - Penggantian Inventaris

```sql
SELECT * FROM sbm_details WHERE category = 'penggantian_inventaris' ORDER BY id;
```

## 25. SECTION 13 - Pemeliharaan Kendaraan

```sql
SELECT * FROM sbm_details WHERE category = 'pemeliharaan_kendaraan' ORDER BY id;
```

## 26. SECTION 14 - Pemeliharaan Gedung

```sql
SELECT * FROM sbm_details WHERE category = 'pemeliharaan_gedung' ORDER BY id;
```

## 27. SECTION 15 - Sewa Gedung

```sql
SELECT * FROM sbm_details WHERE category = 'sewa_gedung' ORDER BY id;
```

## 28. SECTION 16 - Transportasi Terminal

```sql
SELECT * FROM sbm_details WHERE category = 'transportasi_terminal' ORDER BY id;
```

## 29. SECTION 17 - Tiket Pesawat Dalam Negeri

```sql
SELECT * FROM sbm_details WHERE category = 'tiket_pesawat_dalam_negeri' ORDER BY id;
```

## 30. SECTION 18 - Tiket Pesawat Luar Negeri

```sql
SELECT * FROM sbm_details WHERE category = 'tiket_pesawat_luar_negeri' ORDER BY id;
```

## 31. SECTION 19 - Perwakilan RI

```sql
SELECT * FROM sbm_details WHERE category = 'perwakilan_ri' ORDER BY id;
```

---

## SUMMARY - Total Rows Per File

```sql
SELECT source_file, category, COUNT(*) as total
FROM sbm_details
GROUP BY source_file, category
ORDER BY source_file;
```

## ALL DATA - Semua 31 Files

```sql
SELECT * FROM sbm_details ORDER BY source_file, id;
```
