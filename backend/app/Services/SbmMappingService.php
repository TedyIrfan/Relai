<?php

namespace App\Services;

class SbmMappingService
{
    private array $mapping;
    private array $currencyMap;
    private array $columnMappings;
    private array $sectionConfig;

    public function __construct()
    {
        $this->initMapping();
        $this->initCurrencyMap();
        $this->initColumnMappings();
        $this->initSectionConfig();
    }

    /**
     * Get complete mapping structure
     */
    public function getMapping(): array
    {
        return $this->mapping;
    }

    /**
     * Get structure for specific category
     */
    public function getStructure(string $category): ?array
    {
        return $this->mapping[$category] ?? null;
    }

    /**
     * Get currency for category (and sub-category if applicable)
     */
    public function getCurrency(string $category, ?string $subCategory = null): string
    {
        if ($subCategory && isset($this->mapping[$category]['sub_categories'][$subCategory])) {
            return $this->mapping[$category]['sub_categories'][$subCategory]['currency'];
        }

        return $this->mapping[$category]['currency'] ?? 'IDR';
    }

    /**
     * Get column mapping (Excel column → JSON key)
     */
    public function getColumnMapping(string $category, ?string $subCategory = null): array
    {
        if ($subCategory && isset($this->mapping[$category]['sub_categories'][$subCategory])) {
            return $this->mapping[$category]['sub_categories'][$subCategory]['column_mapping'] ?? [];
        }

        return $this->mapping[$category]['column_mapping'] ?? [];
    }

    /**
     * Get all categories
     */
    public function getAllCategories(): array
    {
        return array_keys($this->mapping);
    }

    /**
     * Initialize mapping structure based on MasterSBM.md
     */
    private function initMapping(): void
    {
        $this->mapping = [
            // Honorarium 28-39
            'honorarium_28' => [
                'label' => 'Honorarium 28. Uang Harian dan Uang Representasi Perjalanan Dinas Dalam Negeri',
                'currency' => 'IDR',
                'has_sub_categories' => true,
                'sub_categories' => [
                    '28.1' => [
                        'label' => 'Uang Harian Perjalanan Dinas Dalam Negeri',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'luar_kota', 'dalam_kota_lebih_dari_8_jam', 'diklat'],
                    ],
                    '28.2' => [
                        'label' => 'Uang Representasi Perjalanan Dinas Dalam Negeri',
                        'currency' => 'IDR',
                        'columns' => ['no', 'uraian', 'satuan', 'luar_kota', 'dalam_kota_lebih_dari_8_jam'],
                    ],
                ],
            ],
            'honorarium_29' => [
                'label' => 'Honorarium 29. Uang Harian Perjalanan Dinas Luar Negeri',
                'currency' => 'USD',
                'has_grouping' => true,
                'grouping_field' => 'region',
                'columns' => ['no', 'negara', 'satuan', 'golongan_a', 'golongan_b', 'golongan_c', 'golongan_d'],
            ],
            'honorarium_30' => [
                'label' => 'Honorarium 30. Penginapan Perjalanan Dinas Dalam Negeri',
                'currency' => 'IDR',
                'columns' => ['no', 'provinsi', 'satuan', 'tarif_hotel_pejabat_negara_eselon_i', 'tarif_hotel_pejabat_negara_lainnya_eselon_ii', 'tarif_hotel_pejabat_eselon_iii_golongan_iv', 'tarif_hotel_pejabat_eselon_iv_golongan_iii_ii_i'],
            ],
            'honorarium_31' => [
                'label' => 'Honorarium 31. Rapat/Pertemuan di Luar Kantor',
                'currency' => 'IDR',
                'has_sub_categories' => true,
                'sub_categories' => [
                    '31.1' => [
                        'label' => 'Paket Kegiatan Rapat/Pertemuan di Luar Kantor',
                        'currency' => 'IDR',
                        'has_sections' => true,
                        'sections' => ['a', 'b', 'c'],
                        'columns' => ['no', 'provinsi', 'satuan', 'halfday', 'fullday', 'fullboard'],
                    ],
                    '31.2' => [
                        'label' => 'Uang Harian Kegiatan Rapat/Pertemuan di Luar Kantor',
                        'currency' => 'IDR',
                        'columns' => ['no', 'uraian', 'satuan', 'besaran'],
                    ],
                ],
            ],
            'honorarium_32' => [
                'label' => 'Honorarium 32. Tiket Perjalanan Dinas Pindah Luar Negeri',
                'currency' => 'USD',
                'columns' => ['no', 'perwakilan', 'satuan', 'jakarta_perwakilan_published', 'jakarta_perwakilan_business', 'jakarta_perwakilan_first', 'perwakilan_jakarta_published', 'perwakilan_jakarta_business', 'perwakilan_jakarta_first'],
            ],
            'honorarium_33' => [
                'label' => 'Honorarium 33. Operasional Khusus Kepala Perwakilan RI di Luar Negeri',
                'currency' => 'USD',
                'has_grouping' => true,
                'grouping_field' => 'region',
                'columns' => ['no', 'perwakilan_ri', 'satuan', 'besaran'],
            ],
            'honorarium_34' => [
                'label' => 'Honorarium 34. Makanan Penambah Daya Tahan Tubuh',
                'currency' => 'IDR',
                'columns' => ['no', 'provinsi', 'satuan', 'besaran'],
            ],
            'honorarium_35' => [
                'label' => 'Honorarium 35. Sewa Kendaraan',
                'currency' => 'IDR',
                'has_grouping' => true,
                'grouping_field' => 'provinsi',
                'has_sub_categories' => true,
                'sub_categories' => [
                    '35.1' => [
                        'label' => 'Sewa Kendaraan Pelaksanaan Kegiatan Insidentil',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'roda_4', 'roda_6_bus_sedang', 'roda_6_bus_besar'],
                    ],
                    '35.2' => [
                        'label' => 'Sewa Kendaraan Operasional Pejabat',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'besaran'],
                    ],
                    '35.3' => [
                        'label' => 'Sewa Kendaraan Operasional Kantor dan/atau Lapangan',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'pick_up', 'minibus', 'double_gardan'],
                    ],
                ],
            ],
            'honorarium_36' => [
                'label' => 'Honorarium 36. Pengadaan Kendaraan Dinas',
                'currency' => 'IDR',
                'has_grouping' => true,
                'grouping_field' => 'provinsi',
                'has_sub_categories' => true,
                'sub_categories' => [
                    '36.1' => [
                        'label' => 'Kendaraan Dinas Pejabat',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'besaran'],
                    ],
                    '36.2' => [
                        'label' => 'Kendaraan Pejabat Eselon III sebagai Kepala Kantor, Operasional Kantor dan/atau Lapangan Roda 4',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'pick_up', 'pejabat_eselon_iii_minibus', 'double_gardan'],
                    ],
                    '36.3' => [
                        'label' => 'Kendaraan Operasional Bus',
                        'currency' => 'IDR',
                        'columns' => ['no', 'uraian', 'satuan', 'besaran'],
                    ],
                    '36.4' => [
                        'label' => 'Kendaraan Operasional Kantor dan/atau Lapangan Roda 2',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'operasional', 'lapangan'],
                    ],
                    '36.5' => [
                        'label' => 'Kendaraan Listrik Berbasis Baterai',
                        'currency' => 'IDR',
                        'columns' => ['no', 'uraian', 'satuan', 'besaran'],
                    ],
                ],
            ],
            'honorarium_37' => [
                'label' => 'Honorarium 37. Pengadaan Pakaian Dinas',
                'currency' => 'IDR',
                'columns' => ['no', 'provinsi', 'satuan', 'pakaian_dinas_dokter', 'pakaian_dinas_pegawai_perawat', 'pakaian_seragam_mahasiswa_taruna', 'pakaian_kerja_pengemudi_petugas_kebersihan_pramubakti', 'pakaian_kerja_satpam'],
            ],
            'honorarium_38' => [
                'label' => 'Honorarium 38. Konsumsi Rapat/Pertemuan',
                'currency' => 'IDR',
                'has_sub_categories' => true,
                'sub_categories' => [
                    '38.1' => [
                        'label' => 'Rapat Koordinasi Tingkat Menteri/Eselon I/Setara',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'makan', 'kudapan_snack'],
                    ],
                    '38.2' => [
                        'label' => 'Rapat Biasa',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'makan', 'kudapan_snack'],
                    ],
                ],
            ],
            'honorarium_39' => [
                'label' => 'Honorarium 39. Konsumsi Kegiatan Diklat',
                'currency' => 'IDR',
                'columns' => ['no', 'provinsi', 'satuan', 'makan', 'kudapan_snack'],
            ],

            // Lainnya 1-19
            'transportasi_provinsi' => [
                'label' => '1. Transportasi Darat dari Ibukota Provinsi ke Kabupaten/Kota',
                'currency' => 'IDR',
                'has_grouping' => true,
                'grouping_field' => 'provinsi',
                'columns' => ['no', 'ibukota_provinsi', 'kabupaten_kota_tujuan', 'satuan', 'besaran'],
            ],
            'transportasi_dki' => [
                'label' => '2. Transportasi dari DKI Jakarta ke Kabupaten/Kota Sekitar',
                'currency' => 'IDR',
                'has_grouping' => true,
                'grouping_field' => 'provinsi',
                'columns' => ['no', 'ibukota_provinsi', 'kabupaten_kota_tujuan', 'satuan', 'besaran'],
            ],
            'transportasi_kabupaten' => [
                'label' => '3. Transpor Kegiatan dalam Kabupaten/Kota',
                'currency' => 'IDR',
                'columns' => ['no', 'uraian', 'satuan', 'besaran'],
            ],
            'pemeliharaan_sarana_kantor' => [
                'label' => '4. Pemeliharaan Sarana Kantor',
                'currency' => 'IDR',
                'columns' => ['no', 'uraian', 'satuan', 'besaran'],
            ],
            'penerjemahan_pengetikan' => [
                'label' => '5. Penerjemahan dan Pengetikan',
                'currency' => 'IDR',
                'columns' => ['no', 'uraian', 'satuan', 'besaran'],
            ],
            'beasiswa' => [
                'label' => '6. Bantuan Beasiswa Program Gelar/Nongelar',
                'currency' => 'IDR',
                'columns' => ['no', 'uraian', 'satuan', 'besaran'],
            ],
            'sewa_fotokopi' => [
                'label' => '7. Sewa Mesin Fotokopi',
                'currency' => 'IDR',
                'columns' => ['no', 'uraian', 'satuan', 'besaran'],
            ],
            'honorarium_narasumber' => [
                'label' => '8. Honorarium Narasumber/Pakar/Praktisi/Profesional',
                'currency' => 'MIXED', // Has both IDR and USD - will be detected from data
                'has_sections' => true,
                'columns' => ['no', 'uraian', 'satuan', 'besaran'],
            ],
            'bahan_makanan' => [
                'label' => '9. Pengadaan Bahan Makanan',
                'currency' => 'IDR',
                'has_sub_categories' => true,
                'sub_categories' => [
                    '9.1' => [
                        'label' => 'Narapidana/Tahanan dan Anak di Lapas/Rutan',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'besaran'],
                    ],
                    '9.2' => [
                        'label' => 'Operasi Pasukan/Latihan/Diklat Polri/TNI',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'operasi_pasukan', 'dikma_taruna', 'diklat_lainnya', 'anggota_sakit', 'tahanan', 'jaga_kawal'],
                    ],
                    '9.3' => [
                        'label' => 'Pasien Rumah Sakit dan PMKS',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'pasien_rumah_sakit', 'pmks'],
                    ],
                    '9.4' => [
                        'label' => 'Keluarga PMS, Petugas Pengamatan Laut, ABK',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'keluarga_pms', 'petugas_pengamatan_laut', 'abk_cadangan', 'abk_aktif', 'petugas_srop_vtis'],
                    ],
                    '9.5' => [
                        'label' => 'Petugas Bengkel dan Galangan Kapal Kenavigasian',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'petugas_bengkel', 'petugas_pabrik_gas_aga', 'pms', 'kelompok_tenaga_kesehatan'],
                    ],
                    '9.6' => [
                        'label' => 'Mahasiswa/Siswa di Sekolah Kedinasan',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'mahasiswa_sipil', 'mahasiswa_militer_semi_militer'],
                    ],
                    '9.7' => [
                        'label' => 'Rescue Team',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'besaran'],
                    ],
                ],
            ],
            'konsumsi_tahanan' => [
                'label' => '10. Konsumsi Tahanan/Deteni/ABK Nonjustisia',
                'currency' => 'IDR',
                'columns' => ['no', 'provinsi', 'satuan', 'besaran'],
            ],
            'keperluan_perkantoran' => [
                'label' => '11. Keperluan Sehari-hari Perkantoran',
                'currency' => 'IDR',
                'columns' => ['no', 'provinsi', 'memiliki_sampai_dengan_40_pegawai_satuan', 'memiliki_sampai_dengan_40_pegawai_besaran', 'memiliki_lebih_dari_40_pegawai_satuan', 'memiliki_lebih_dari_40_pegawai_besaran'],
            ],
            'penggantian_inventaris' => [
                'label' => '12. Penggantian Inventaris',
                'currency' => 'IDR',
                'columns' => ['no', 'provinsi', 'satuan', 'besaran'],
            ],
            'pemeliharaan_kendaraan' => [
                'label' => '13. Pemeliharaan dan Operasional Kendaraan Dinas',
                'currency' => 'IDR',
                'has_sub_categories' => true,
                'sub_categories' => [
                    '13.1' => [
                        'label' => 'Kendaraan Dinas Pejabat',
                        'currency' => 'IDR',
                        'has_grouping' => true,
                        'grouping_field' => 'provinsi',
                        'columns' => ['no', 'provinsi', 'satuan', 'besaran'],
                    ],
                    '13.2' => [
                        'label' => 'Kendaraan Dinas Operasional',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'roda_empat', 'double_gardan', 'roda_dua'],
                    ],
                    '13.3' => [
                        'label' => 'Operasional dalam Lingkungan Kantor, Roda 6, Speed Boat',
                        'currency' => 'IDR',
                        'columns' => ['no', 'uraian', 'satuan', 'besaran'],
                    ],
                    '13.4' => [
                        'label' => 'Kendaraan Dinas Operasional Patroli Jalan Raya (PJR)',
                        'currency' => 'IDR',
                        'columns' => ['no', 'provinsi', 'satuan', 'pjr_roda_empat', 'pjr_roda_dua_max_250cc', 'pjr_roda_dua_min_750cc'],
                    ],
                    '13.5' => [
                        'label' => 'Operasional Kendaraan Dinas Untuk Pengadaan Dari Sewa',
                        'currency' => 'IDR',
                        'columns' => ['no', 'uraian', 'satuan', 'besaran'],
                    ],
                    '13.6' => [
                        'label' => 'Kendaraan Bermotor Listrik Berbasis Baterai',
                        'currency' => 'IDR',
                        'columns' => ['no', 'uraian', 'satuan', 'besaran'],
                    ],
                ],
            ],
            'pemeliharaan_gedung' => [
                'label' => '14. Pemeliharaan Gedung/Bangunan',
                'currency' => 'IDR',
                'columns' => ['no', 'provinsi', 'satuan', 'gedung_bertingkat', 'gedung_tidak_bertingkat', 'halaman_gedung_bangunan_kantor'],
            ],
            'sewa_gedung' => [
                'label' => '15. Sewa Gedung Pertemuan',
                'currency' => 'IDR',
                'columns' => ['no', 'provinsi', 'satuan', 'besaran'],
            ],
            'transportasi_terminal' => [
                'label' => '16. Transportasi dari/ke Terminal/Stasiun/Bandara/Pelabuhan',
                'currency' => 'IDR',
                'columns' => ['no', 'provinsi', 'satuan', 'besaran'],
            ],
            'tiket_pesawat_dalam_negeri' => [
                'label' => '17. Tiket Pesawat Perjalanan Dinas Dalam Negeri',
                'currency' => 'IDR',
                'columns' => ['no', 'kota_asal', 'kota_tujuan', 'satuan_biaya_tiket_bisnis', 'satuan_biaya_tiket_ekonomi'],
            ],
            'tiket_pesawat_luar_negeri' => [
                'label' => '18. Tiket Pesawat Perjalanan Dinas Luar Negeri',
                'currency' => 'USD',
                'has_grouping' => true,
                'grouping_field' => 'region',
                'columns' => ['no', 'kota', 'besaran_eksekutif', 'besaran_bisnis', 'besaran_ekonomi'],
            ],
            'perwakilan_ri' => [
                'label' => '19. Penyelenggaraan Perwakilan Republik Indonesia di Luar Negeri',
                'currency' => 'USD',
                'has_grouping' => true,
                'grouping_field' => 'region',
                'has_sub_categories' => true,
                'sub_categories' => [
                    '19.1' => [
                        'label' => 'ATK, Langganan Koran/Majalah, Lampu, Pengamanan Sendiri, Kantong Diplomatik, dan Jamuan',
                        'currency' => 'USD',
                        'columns' => ['no', 'kota', 'atk_ot', 'langganan_koran_majalah', 'lampu', 'pengamanan_sendiri_ob', 'kantong_diplomatik_kg', 'jamuan_oh'],
                    ],
                    '19.2' => [
                        'label' => 'Pemeliharaan, Pengadaan Inventaris Kantor, Pakaian Sopir/Satpam, Sewa Kendaraan, dan Konsumsi Rapat',
                        'currency' => 'USD',
                        'columns' => ['no', 'kota', 'pemeliharaan_kendaraan_dinas', 'pemeliharaan_gedung', 'pemeliharaan_halaman', 'pengadaan_inventaris_kantor_ot', 'pakaian_sopir_satpam_stel', 'sewa_kendaraan_sedan', 'sewa_kendaraan_bus', 'sewa_kendaraan_mobil_box', 'konsumsi_rapat_ok'],
                    ],
                ],
            ],
        ];
    }

    /**
     * Initialize currency map (USD categories)
     */
    private function initCurrencyMap(): void
    {
        $this->currencyMap = [
            'honorarium_29' => 'USD',
            'honorarium_32' => 'USD',
            'honorarium_33' => 'USD',
            'tiket_pesawat_luar_negeri' => 'USD',
            'perwakilan_ri' => 'USD', // Both 19.1 and 19.2
        ];
    }

    /**
     * Initialize column mappings (Excel column name → JSON key)
     */
    private function initColumnMappings(): void
    {
        $this->columnMappings = [
            'honorarium_29' => [
                'NO.' => 'no',
                'NEGARA' => 'negara',
                'SATUAN' => 'satuan',
                'GOLONGAN' => 'golongan_merged', // Special handling needed
            ],
            'honorarium_37' => [
                'NO.' => 'no',
                'PROVINSI' => 'provinsi',
                'SATUAN' => 'satuan',
                'PAKAIAN DINAS DOKTER' => 'pakaian_dinas_dokter',
                'PAKAIAN DINAS PEGAWAI/ PERAWAT' => 'pakaian_dinas_pegawai_perawat',
                'PAKAIAN SERAGAM MAHASISWA/ TARUNA' => 'pakaian_seragam_mahasiswa_taruna',
                'PAKAIAN  KERJA PENGEMUDI/ PETUGAS KEBERSIHA/ PRAMUBAKTI' => 'pakaian_kerja_pengemudi_petugas_kebersihan_pramubakti',
                'PAKAIAN KERJA SATPAM' => 'pakaian_kerja_satpam',
            ],
            'perwakilan_ri' => [
                '19.1' => [
                    'NO.' => 'no',
                    'K  O    T    A' => 'kota',
                    'ATK (OT)' => 'atk_ot',
                    'Langganan Koran/ Majalah (Eksemplar/ Bulan)' => 'langganan_koran_majalah',
                    'Lampu (Buah)' => 'lampu',
                    'Pengamanan Sendiri
(OB)' => 'pengamanan_sendiri_ob',
                    'Kantong Diplomatik (kg)' => 'kantong_diplomatik_kg',
                    'Jamuan (OH)' => 'jamuan_oh',
                ],
                '19.2' => [
                    'NO.' => 'no',
                    'K  O    T    A' => 'kota',
                    'Pemeliharaan' => 'pemeliharaan',
                    'Pengadaan Inventaris Kantor  (OT)' => 'pengadaan_inventaris_kantor_ot',
                    'Pakaian Sopir/ Satpam (Stel)' => 'pakaian_sopir_satpam_stel',
                    'Sewa  kendaraan
(hari)' => 'sewa_kendaraan_hari',
                    'Konsumsi Rapat (OK)' => 'konsumsi_rapat_ok',
                ],
            ],
            'tiket_pesawat_dalam_negeri' => [
                'NO.' => 'no',
                'KOTA' => 'kota_asal',
                'KOTA TUJUAN' => 'kota_tujuan',
                'SATUAN  BIAYA  TIKET' => 'satuan_biaya_tiket_bisnis',
            ],
        ];
    }

    /**
     * Initialize section-level configurations for special handling
     * Handles: data_start_row, exclude, force_null_grouping, explicit sub_category
     */
    private function initSectionConfig(): void
    {
        $this->sectionConfig = [
            // Honorarium 35 - Section 35.2 needs custom data_start_row
            'honorarium_35' => [
                'Sewa Kendaraan Operasional Pejabat' => [
                    'data_start_row' => 46, // Skip row 45 (grouping label: "35.02.01 | PEJABAT ESELON I")
                ],
            ],

            // Honorarium 36 - Section 36.1 needs custom data_start_row
            'honorarium_36' => [
                'Kendaraan Dinas Pejabat' => [
                    'data_start_row' => 5, // Skip row 4 (grouping label: "36.01.01 | PEJABAT ESELON I")
                ],
                'Kendaraan Operasional Kantor dan/atau Lapangan Roda 2 (Dua)' => [
                    // No longer excluded - import this section
                ],
            ],

            // Honorarium 38 - Section 38.2 needs explicit null sub_category
            'honorarium_38' => [
                'RAPAT KOORDINASI T INGKAT MENTERI/ ESELON I/SETARA' => [
                    'sub_category' => null,
                ],
                'RAPAT BIASA' => [
                    'sub_category' => null, // Force null, not inherited from 38.1
                ],
            ],

            // Satuan Biaya 5 - Section 5.2 needs force_null_grouping
            'penerjemahan_pengetikan' => [
                'Dari Bahasa Indonesia ke Bahasa Daerah/Bahasa Lokal atau Sebaliknya' => [
                    'force_null_grouping' => true, // No grouping from section 5.1
                    'sub_category' => null,
                ],
            ],

            // Satuan Biaya 9
            'bahan_makanan' => [
                'Pengadaan Bahan Makanan untuk Narapidana/Tahanan dan Anak di Lapas/Rutan Kementerian Hukum dan Hak Asasi Manusia' => [
                    'sub_category' => null,
                ],
                'Pengadaan Bahan Makanan untuk Pasien Rumah Sakit dan Penyandang Masalah Kesejahteraan Sosial (PMKS)' => [
                    'sub_category' => null,
                ],
                'Pengadaan Bahan Makanan untuk Keluarga Penjaga Menara Suar (PMS), Petugas Pengamatan Laut, Anak Buah Kapal (ABK) Cadangan pada Kapal Negara, ABK Aktif pada Kapal Negara, dan Petugas Stasiun Radio Pantai (SROP) dan Vessel Traffic Information Service (VTIS)' => [
                    'sub_category' => null,
                ],
                'Pengadaan Bahan Makanan untuk Petugas Bengkel dan Galangan Kapal Kenavigasian, Petugas Pabrik Gas Aga untuk Lampu Suar, PMS, dan Kelompok Tenaga Kesehatan Kerja Pelayaran' => [
                    'sub_category' => null,
                ],
                'Pengadaan Bahan Makanan untuk Mahasiswa / Siswa Sipil dan Mahasiswa Militer / Semi Militer di Lingkup Sekolah Kedinasan' => [
                    'sub_category' => null,
                ],
                'Pengadaan Bahan Makanan untuk Rescue Team' => [
                    'sub_category' => null,
                ],
            ],

            // Satuan Biaya 13 - All sections should be imported
            'pemeliharaan_kendaraan' => [
                'Kendaraan Dinas Pejabat' => [
                    'sub_category' => null,
                ],
                'Kendaraan Dinas Operasional' => [
                    'sub_category' => null,
                ],
                'Operasional dalam Lingkungan Kantor, Roda 6, Roda 6 Khusus Tahanan Kejaksaan, dan Speed Boat' => [
                    'sub_category' => null,
                ],
                'Kendaraan Dinas Operasional Patroli Jalan Raya (PJR)' => [
                    'sub_category' => null,
                ],
                'Operasional Kendaraan Dinas Untuk Pengadaan Dari Sewa' => [
                    'sub_category' => null, // No longer excluded - section 13.5
                ],
                'Kendaraan Bermotor Listrik Berbasis Baterai' => [
                    'sub_category' => null, // No longer excluded - section 13.6
                ],
            ],
        ];
    }

    /**
     * Get section-specific configuration
     *
     * @param string $category Category name (e.g., 'honorarium_35')
     * @param string $sectionLabel Section label from scan
     * @return array|null Configuration array or null if not found
     */
    public function getSectionMapping(string $category, string $sectionLabel): ?array
    {
        if (!isset($this->sectionConfig[$category])) {
            return null;
        }

        $config = $this->sectionConfig[$category];

        // Try exact match first
        if (isset($config[$sectionLabel])) {
            return $config[$sectionLabel];
        }

        // Try partial match (handles cases where section label contains extra text)
        foreach ($config as $key => $value) {
            if (strpos($sectionLabel, $key) !== false || strpos($key, $sectionLabel) !== false) {
                return $value;
            }
        }

        return null;
    }

    /**
     * Check if category uses USD
     */
    public function isUsdCurrency(string $category): bool
    {
        return isset($this->currencyMap[$category]);
    }

    /**
     * Normalize column name from Excel to JSON key
     */
    public function normalizeColumnName(string $columnName, string $category, ?string $subCategory = null): string
    {
        // Trim and normalize spaces
        $columnName = trim(preg_replace('/\s+/', ' ', $columnName));

        // Check if there's a direct mapping
        if ($subCategory && isset($this->columnMappings[$category][$subCategory][$columnName])) {
            return $this->columnMappings[$category][$subCategory][$columnName];
        }

        if (isset($this->columnMappings[$category][$columnName])) {
            return $this->columnMappings[$category][$columnName];
        }

        // Default: convert to lowercase, replace special chars with underscore
        $key = strtolower($columnName);
        $key = preg_replace('/[^a-z0-9]+/', '_', $key);
        $key = trim($key, '_');

        return $key;
    }

    /**
     * Get SBM number for category (1-31, 28-39)
     */
    public function getSbmNumber(string $category): ?int
    {
        $map = [
            'transportasi_provinsi' => 1,
            'transportasi_dki' => 2,
            'transportasi_kabupaten' => 3,
            'pemeliharaan_sarana_kantor' => 4,
            'penerjemahan_pengetikan' => 5,
            'beasiswa' => 6,
            'sewa_fotokopi' => 7,
            'honorarium_narasumber' => 8,
            'bahan_makanan' => 9,
            'konsumsi_tahanan' => 10,
            'keperluan_perkantoran' => 11,
            'penggantian_inventaris' => 12,
            'pemeliharaan_kendaraan' => 13,
            'pemeliharaan_gedung' => 14,
            'sewa_gedung' => 15,
            'transportasi_terminal' => 16,
            'tiket_pesawat_dalam_negeri' => 17,
            'tiket_pesawat_luar_negeri' => 18,
            'perwakilan_ri' => 19,
            'honorarium_28' => 28,
            'honorarium_29' => 29,
            'honorarium_30' => 30,
            'honorarium_31' => 31,
            'honorarium_32' => 32,
            'honorarium_33' => 33,
            'honorarium_34' => 34,
            'honorarium_35' => 35,
            'honorarium_36' => 36,
            'honorarium_37' => 37,
            'honorarium_38' => 38,
            'honorarium_39' => 39,
        ];

        return $map[$category] ?? null;
    }

    /**
     * Get source file name for category
     */
    public function getSourceFile(string $category): ?string
    {
        $map = [
            'transportasi_provinsi' => '1. SATUAN BIAYA TRANSPORTASI DARAT DARI IBUKOTA PROVINSI KE KABUPATEN atau KOTA DALAM PROVINSI YANG SAMA (ONE  WAY ).xlsx',
            'transportasi_dki' => '2. SATUAN BIAYA TRANSPORTASI DARI DKI JAKARTA KE KABUPATEN atau KOTA SEKITAR (ONE WAY  ).xlsx',
            'transportasi_kabupaten' => '3. SATUAN BIAYA TRANSPOR KEGIATAN DALAM KABUPATEN/KOTA PERGI PULANG (PP).xlsx',
            'pemeliharaan_sarana_kantor' => '4. SATUAN BIAYA PEMELIHARAAN SARANA KANTOR.xlsx',
            'penerjemahan_pengetikan' => '5. SATUAN BIAYA PENERJEMAHAN DAN PENGETIKAN.xlsx',
            'beasiswa' => '6. SATUAN BIAYA BANTUAN BEASISWA PROGRAM GELAR/NONGELAR DALAM NEGERI.xlsx',
            'sewa_fotokopi' => '7. SATUAN BIAYA SEWA MESIN FOTOKOPI.xlsx',
            'honorarium_narasumber' => '8. SATUAN BIAYA HONORARARIUM NARASUMBER PAKAR PRAKTISI PROFESIONAL.xlsx',
            'bahan_makanan' => '9. SATUAN BIAYA PENGADAAN BAHAN MAKANAN.xlsx',
            'konsumsi_tahanan' => '10. SATUAN BIAYA KONSUMSI TAHANAN/DETENI/ABK NONJUSTISIA.xlsx',
            'keperluan_perkantoran' => '11. SATUAN BIAYA KEPERLUAN SEHARI-HARI PERKANTORAN DI DALAM NEGERI.xlsx',
            'penggantian_inventaris' => '12. SATUAN BIAYA PENGGANTIAN INVENTARIS LAMA DAN ATAU PEMBELIAN INVENTARIS UNTUK PEGAWAI BARU.xlsx',
            'pemeliharaan_kendaraan' => '13. SATUAN BIAYA PEMELIHARAAN DAN OPERASIONAL KENDARAAN DINAS.xlsx',
            'pemeliharaan_gedung' => '14. SATUAN BIAYA PEMELIHARAAN GEDUNG BANGUNAN DALAM NEGERI.xlsx',
            'sewa_gedung' => '15. SATUAN BIAYA SEWA GEDUNG PERTEMUAN.xlsx',
            'transportasi_terminal' => '16. SATUAN BIAYA TRANSPORTASI DARI DAN/ATAU KE TERMINAL BUS STASIUN BANDARA PELABUHAN DALAM RANGKA PERJALANAN DINAS DALAM NEGERI.xlsx',
            'tiket_pesawat_dalam_negeri' => '17. SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS DALAM NEGERI PERGI PULANG (PP).xlsx',
            'tiket_pesawat_luar_negeri' => '18. SATUAN BIAYA TIKET PESAWAT PERJALANAN DINAS LUAR NEGERI PERGI PULANG (PP).xlsx',
            'perwakilan_ri' => '19. SATUAN BIAYA PENYELENGGARAAN PERWAKILAN REPUBLIK INDONESIA DI LUAR NEGERI.xlsx',
            'honorarium_28' => 'Honorarium 28 SATUAN BIAYA UANG HARIAN DAN UANG REPRESENTASI PERJALANAN DINAS DALAM NEGERI.xlsx',
            'honorarium_29' => 'Honorarium 29 SATUAN BIAYA UANG HARIAN PERJALANAN DINAS LUAR NEGERI.xlsx',
            'honorarium_30' => 'Honorarium 30 SATUAN BIAYA PENGINAPAN PERJALANAN DINAS DALAM NEGERI.xlsx',
            'honorarium_31' => 'Honorarium 31 SATUAN BIAYA RAPAT ATAU PERTEMUAN DI LUAR KANTOR.xlsx',
            'honorarium_32' => 'Honorarium 32 SATUAN BIAYA TIKET PERJALANAN DINAS PINDAH LUAR NEGERI.xlsx',
            'honorarium_33' => 'Honorarium 33 SATUAN BIAYA OPERASIONAL KHUSUS KEPALA PERWAKILAN REPUBLIK INDONESIA DI LUAR NEGERI.xlsx',
            'honorarium_34' => 'Honorarium 34 SATUAN BIAYA MAKANAN PENAMBAH DAYA TAHAN TUBUH.xlsx',
            'honorarium_35' => 'Honorarium 35 SATUAN BIAYA SEWA KENDARAAN.xlsx',
            'honorarium_36' => 'Honorarium 36 SATUAN BIAYA PENGAADAAN KENDARAAN DINAS.xlsx',
            'honorarium_37' => 'Honorarium 37 SATUAN BIAYA PENGAADAAN PAKAIAN DINAS.xlsx',
            'honorarium_38' => 'Honorarium 38 SATUAN BIAYA KONSUMSI RAPAT ATAU PERTEMUAN.xlsx',
            'honorarium_39' => 'Honorarium 39 SATUAN BIAYA KONSUMSI KEGIATAN PENDIDIKAN DAN PELATIHAN (DIKLAT).xlsx',
        ];

        return $map[$category] ?? null;
    }

    /**
     * Get display order for category (same as SBM number)
     */
    public function getDisplayOrder(string $category): ?int
    {
        return $this->getSbmNumber($category);
    }
}
