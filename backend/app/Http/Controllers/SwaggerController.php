<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     title="RelAI API Documentation",
 *     version="1.0.0",
 *     description="API documentation for RelAI - Realisasi Keuangan Kementerian Koordinator Bidang Infrastruktur dan Pembangunan Kewilayahan",
 *     @OA\Contact(
 *         email="admin@relai.go.id",
 *         name="RelAI Admin"
 *     )
 * )
 *
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="API Server"
 * )
 *
 * @OA\Tag(
 *     name="Authentication",
 *     description="User authentication and management operations"
 * )
 *
 * @OA\Tag(
 *     name="Dashboard",
 *     description="Dashboard and budget management operations"
 * )
 *
 * @OA\Tag(
 *     name="RKA",
 *     description="RKA Details (Rencana Kerja dan Anggaran) operations"
 * )
 *
 * @OA\Tag(
 *     name="SBM",
 *     description="Master Standar Biaya Masukan (SBM) operations"
 * )
 *
 * @OA\Tag(
 *     name="Nominatif",
 *     description="Nominatif Perjalanan Dinas operations"
 * )
 *
 * @OA\Tag(
 *     name="NonNominatif",
 *     description="Non-Nominatif operations"
 * )
 *
 * @OA\Schema(
 *     schema="User",
 *     title="User",
 *     description="User model",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="username",
 *         type="string",
 *         example="eselon1"
 *     ),
 *     @OA\Property(
 *         property="nama",
 *         type="string",
 *         example="Eselon 1 User"
 *     ),
 *     @OA\Property(
 *         property="jabatan",
 *         type="string",
 *         example="Eselon 1"
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time",
 *         example="2025-01-01T00:00:00.000000Z"
 *     ),
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time",
 *         example="2025-01-01T00:00:00.000000Z"
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="Anggaran",
 *     title="Anggaran",
 *     description="Anggaran model",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="tahun",
 *         type="integer",
 *         example=2025
 *     ),
 *     @OA\Property(
 *         property="total_anggaran",
 *         type="number",
 *         format="decimal",
 *         example=2000000000.00
 *     ),
 *     @OA\Property(
 *         property="anggaran_berjalan",
 *         type="number",
 *         format="decimal",
 *         example=500000000.00
 *     ),
 *     @OA\Property(
 *         property="sp2d",
 *         type="number",
 *         format="decimal",
 *         example=300000000.00
 *     ),
 *     @OA\Property(
 *         property="sisa_anggaran",
 *         type="number",
 *         format="decimal",
 *         example=1500000000.00
 *     ),
 *     @OA\Property(
 *         property="keterangan",
 *         type="string",
 *         example="Anggaran tahun 2025"
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time",
 *         example="2025-01-01T00:00:00.000000Z"
 *     ),
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time",
 *         example="2025-01-01T00:00:00.000000Z"
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="SbmDetail",
 *     title="SbmDetail",
 *     description="Master Standar Biaya Masukan (SBM) detail",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="category",
 *         type="string",
 *         example="transportasi_provinsi"
 *     ),
 *     @OA\Property(
 *         property="source_file",
 *         type="string",
 *         example="SECTION 1.xlsx"
 *     ),
 *     @OA\Property(
 *         property="no",
 *         type="string",
 *         example="1"
 *     ),
 *     @OA\Property(
 *         property="provinsi",
 *         type="string",
 *         example="DKI Jakarta"
 *     ),
 *     @OA\Property(
 *         property="uraian",
 *         type="string",
 *         example="Tiket Pesawat Ekonomi"
 *     ),
 *     @OA\Property(
 *         property="satuan",
 *         type="string",
 *         example="orang"
 *     ),
 *     @OA\Property(
 *         property="besaran",
 *         type="number",
 *         example=1500000
 *     ),
 *     @OA\Property(
 *         property="besaran_formatted",
 *         type="string",
 *         example="Rp 1.500.000"
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="SbmCategory",
 *     title="SbmCategory",
 *     description="SBM Category with metadata",
 *     @OA\Property(
 *         property="category",
 *         type="string",
 *         example="transportasi_provinsi"
 *     ),
 *     @OA\Property(
 *         property="source_file",
 *         type="string",
 *         example="SECTION 1.xlsx"
 *     ),
 *     @OA\Property(
 *         property="total_records",
 *         type="integer",
 *         example=34
 *     ),
 *     @OA\Property(
 *         property="last_updated",
 *         type="string",
 *         format="date-time",
 *         example="2024-12-31T10:00:00.000000Z"
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="NominatifNew",
 *     title="NominatifNew",
 *     description="Nominatif Perjalanan Dinas Master",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="rka_detail_id",
 *         type="integer",
 *         example=5
 *     ),
 *     @OA\Property(
 *         property="user_id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="deskripsi_perjalanan_dinas",
 *         type="string",
 *         example="Perjalanan Dinas ke Jakarta untuk Koordinasi Program"
 *     ),
 *     @OA\Property(
 *         property="tanggal_mulai",
 *         type="string",
 *         format="date",
 *         example="2025-01-15"
 *     ),
 *     @OA\Property(
 *         property="tanggal_selesai",
 *         type="string",
 *         format="date",
 *         example="2025-01-17"
 *     ),
 *     @OA\Property(
 *         property="status",
 *         type="string",
 *         enum={"draft", "submitted"},
 *         example="draft"
 *     ),
 *     @OA\Property(
 *         property="total_pagu",
 *         type="number",
 *         format="decimal",
 *         example=5000000.00
 *     ),
 *     @OA\Property(
 *         property="total_biaya_aktual",
 *         type="number",
 *         format="decimal",
 *         example=4500000.00
 *     ),
 *     @OA\Property(
 *         property="total_pagu_trip",
 *         type="number",
 *         format="decimal",
 *         example=15000000.00
 *     ),
 *     @OA\Property(
 *         property="total_aktual_trip",
 *         type="number",
 *         format="decimal",
 *         example=13500000.00
 *     ),
 *     @OA\Property(
 *         property="total_anggaran_berjalan_trip",
 *         type="number",
 *         format="decimal",
 *         example=12000000.00
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time",
 *         example="2025-01-01T00:00:00.000000Z"
 *     ),
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time",
 *         example="2025-01-01T00:00:00.000000Z"
 *     ),
 *     @OA\Property(
 *         property="rka_detail",
 *         type="object",
 *         @OA\Property(property="id", type="integer"),
 *         @OA\Property(property="code_rka", type="string"),
 *         @OA\Property(property="layanan", type="string")
 *     ),
 *     @OA\Property(
 *         property="user",
 *         ref="#/components/schemas/User"
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="NominatifDetailRow",
 *     title="NominatifDetailRow",
 *     description="Nominatif Detail Row - Person and Route Data",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="nominatif_id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="person_type",
 *         type="string",
 *         enum={"main", "tambahan"},
 *         example="main"
 *     ),
 *     @OA\Property(
 *         property="person_name",
 *         type="string",
 *         example="Ahmad Sudrajat"
 *     ),
 *     @OA\Property(
 *         property="row_order",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="asal",
 *         type="string",
 *         example="Jakarta"
 *     ),
 *     @OA\Property(
 *         property="tujuan",
 *         type="string",
 *         example="Bandung"
 *     ),
 *     @OA\Property(
 *         property="tanggal_pergi",
 *         type="string",
 *         format="date",
 *         example="2025-01-15"
 *     ),
 *     @OA\Property(
 *         property="tanggal_sampai",
 *         type="string",
 *         format="date",
 *         example="2025-01-17"
 *     ),
 *     @OA\Property(
 *         property="no",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="golongan",
 *         type="string",
 *         example="IV/e"
 *     ),
 *     @OA\Property(
 *         property="jabatan",
 *         type="string",
 *         example="Kepala Bagian"
 *     ),
 *     @OA\Property(
 *         property="eselon",
 *         type="string",
 *         example="IIb"
 *     ),
 *     @OA\Property(
 *         property="jumlah_hari",
 *         type="integer",
 *         example=3
 *     ),
 *     @OA\Property(
 *         property="formatted_date_range",
 *         type="string",
 *         example="15 Jan 2025 - 17 Jan 2025"
 *     ),
 *     @OA\Property(
 *         property="total_pagu",
 *         type="number",
 *         format="decimal",
 *         example=5000000.00
 *     ),
 *     @OA\Property(
 *         property="total_aktual",
 *         type="number",
 *         format="decimal",
 *         example=4500000.00
 *     ),
 *     @OA\Property(
 *         property="evidence_count",
 *         type="integer",
 *         example=2
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time"
 *     ),
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time"
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="NominatifBiayaRow",
 *     title="NominatifBiayaRow",
 *     description="Nominatif Biaya Row - Financial Data",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="nominatif_detail_row_id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="transport_pesawat_non_pp_pagu",
 *         type="number",
 *         format="decimal",
 *         example=1500000.00
 *     ),
 *     @OA\Property(
 *         property="transport_pesawat_non_pp_aktual",
 *         type="number",
 *         format="decimal",
 *         example=1350000.00
 *     ),
 *     @OA\Property(
 *         property="transport_taksi_pagu",
 *         type="number",
 *         format="decimal",
 *         example=100000.00
 *     ),
 *     @OA\Property(
 *         property="transport_taksi_aktual",
 *         type="number",
 *         format="decimal",
 *         example=95000.00
 *     ),
 *     @OA\Property(
 *         property="penginapan_jumlah_malam",
 *         type="integer",
 *         example=2
 *     ),
 *     @OA\Property(
 *         property="penginapan_pagu_perhari",
 *         type="number",
 *         format="decimal",
 *         example=500000.00
 *     ),
 *     @OA\Property(
 *         property="penginapan_aktual_perhari",
 *         type="number",
 *         format="decimal",
 *         example=480000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_meeting_fullboard_jumlah_hari",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="uang_harian_meeting_fullboard_pagu_perhari",
 *         type="number",
 *         format="decimal",
 *         example=300000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_meeting_fullboard_aktual_perhari",
 *         type="number",
 *         format="decimal",
 *         example=300000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_meeting_fullday_jumlah_hari",
 *         type="integer",
 *         example=0
 *     ),
 *     @OA\Property(
 *         property="uang_harian_meeting_fullday_pagu_perhari",
 *         type="number",
 *         format="decimal",
 *         example=150000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_meeting_fullday_aktual_perhari",
 *         type="number",
 *         format="decimal",
 *         example=150000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_luar_kota_jumlah_hari",
 *         type="integer",
 *         example=3
 *     ),
 *     @OA\Property(
 *         property="uang_harian_luar_kota_pagu_perhari",
 *         type="number",
 *         format="decimal",
 *         example=400000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_luar_kota_aktual_perhari",
 *         type="number",
 *         format="decimal",
 *         example=400000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_dalam_kota_jumlah_hari",
 *         type="integer",
 *         example=0
 *     ),
 *     @OA\Property(
 *         property="uang_harian_dalam_kota_pagu_perhari",
 *         type="number",
 *         format="decimal",
 *         example=200000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_dalam_kota_aktual_perhari",
 *         type="number",
 *         format="decimal",
 *         example=200000.00
 *     ),
 *     @OA\Property(
 *         property="representasi_luar_kota_jumlah_hari",
 *         type="integer",
 *         example=0
 *     ),
 *     @OA\Property(
 *         property="representasi_luar_kota_pagu_perhari",
 *         type="number",
 *         format="decimal",
 *         example=250000.00
 *     ),
 *     @OA\Property(
 *         property="representasi_luar_kota_aktual_perhari",
 *         type="number",
 *         format="decimal",
 *         example=250000.00
 *     ),
 *     @OA\Property(
 *         property="representasi_dalam_kota_jumlah_hari",
 *         type="integer",
 *         example=0
 *     ),
 *     @OA\Property(
 *         property="representasi_dalam_kota_pagu_perhari",
 *         type="number",
 *         format="decimal",
 *         example=150000.00
 *     ),
 *     @OA\Property(
 *         property="representasi_dalam_kota_aktual_perhari",
 *         type="number",
 *         format="decimal",
 *         example=150000.00
 *     ),
 *     @OA\Property(
 *         property="penginapan_total_pagu",
 *         type="number",
 *         format="decimal",
 *         example=1000000.00
 *     ),
 *     @OA\Property(
 *         property="penginapan_total_aktual",
 *         type="number",
 *         format="decimal",
 *         example=960000.00
 *     ),
 *     @OA\Property(
 *         property="penginapan_anggaran_berjalan",
 *         type="number",
 *         format="decimal",
 *         example=980000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_meeting_fullboard_total_pagu",
 *         type="number",
 *         format="decimal",
 *         example=300000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_meeting_fullboard_total_aktual",
 *         type="number",
 *         format="decimal",
 *         example=300000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_meeting_fullboard_anggaran_berjalan",
 *         type="number",
 *         format="decimal",
 *         example=300000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_meeting_fullday_total_pagu",
 *         type="number",
 *         format="decimal",
 *         example=0.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_meeting_fullday_total_aktual",
 *         type="number",
 *         format="decimal",
 *         example=0.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_meeting_fullday_anggaran_berjalan",
 *         type="number",
 *         format="decimal",
 *         example=0.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_luar_kota_total_pagu",
 *         type="number",
 *         format="decimal",
 *         example=1200000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_luar_kota_total_aktual",
 *         type="number",
 *         format="decimal",
 *         example=1200000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_luar_kota_anggaran_berjalan",
 *         type="number",
 *         format="decimal",
 *         example=1200000.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_dalam_kota_total_pagu",
 *         type="number",
 *         format="decimal",
 *         example=0.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_dalam_kota_total_aktual",
 *         type="number",
 *         format="decimal",
 *         example=0.00
 *     ),
 *     @OA\Property(
 *         property="uang_harian_dalam_kota_anggaran_berjalan",
 *         type="number",
 *         format="decimal",
 *         example=0.00
 *     ),
 *     @OA\Property(
 *         property="representasi_luar_kota_total_pagu",
 *         type="number",
 *         format="decimal",
 *         example=0.00
 *     ),
 *     @OA\Property(
 *         property="representasi_luar_kota_total_aktual",
 *         type="number",
 *         format="decimal",
 *         example=0.00
 *     ),
 *     @OA\Property(
 *         property="representasi_luar_kota_anggaran_berjalan",
 *         type="number",
 *         format="decimal",
 *         example=0.00
 *     ),
 *     @OA\Property(
 *         property="representasi_dalam_kota_total_pagu",
 *         type="number",
 *         format="decimal",
 *         example=0.00
 *     ),
 *     @OA\Property(
 *         property="representasi_dalam_kota_total_aktual",
 *         type="number",
 *         format="decimal",
 *         example=0.00
 *     ),
 *     @OA\Property(
 *         property="representasi_dalam_kota_anggaran_berjalan",
 *         type="number",
 *         format="decimal",
 *         example=0.00
 *     ),
 *     @OA\Property(
 *         property="total_pagu_row",
 *         type="number",
 *         format="decimal",
 *         example=5000000.00
 *     ),
 *     @OA\Property(
 *         property="total_aktual_row",
 *         type="number",
 *         format="decimal",
 *         example=4810000.00
 *     ),
 *     @OA\Property(
 *         property="total_anggaran_berjalan_row",
 *         type="number",
 *         format="decimal",
 *         example=4780000.00
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time"
 *     ),
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time"
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="NominatifEvidence",
 *     title="NominatifEvidence",
 *     description="Nominatif Evidence - File Evidence Links",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="nominatif_id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="nominatif_detail_row_id",
 *         type="integer",
 *         nullable=true,
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="evidence_link",
 *         type="string",
 *         example="https://drive.google.com/file/d/1ABCxyz/view?usp=sharing"
 *     ),
 *     @OA\Property(
 *         property="evidence_name",
 *         type="string",
 *         example="Tiket Pesawat PDF"
 *     ),
 *     @OA\Property(
 *         property="keterangan",
 *         type="string",
 *         nullable=true,
 *         example="Tiket pesawat PP Jakarta - Bandung"
 *     ),
 *     @OA\Property(
 *         property="user_id",
 *         type="integer",
 *         nullable=true,
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="google_drive_id",
 *         type="string",
 *         example="1ABCxyz"
 *     ),
 *     @OA\Property(
 *         property="preview_url",
 *         type="string",
 *         example="https://drive.google.com/file/d/1ABCxyz/preview"
 *     ),
 *     @OA\Property(
 *         property="thumbnail_url",
 *         type="string",
 *         example="https://drive.google.com/thumbnail?id=1ABCxyz&sz=w200"
 *     ),
 *     @OA\Property(
 *         property="is_google_drive_link",
 *         type="boolean",
 *         example=true
 *     ),
 *     @OA\Property(
 *         property="is_google_docs_link",
 *         type="boolean",
 *         example=false
 *     ),
 *     @OA\Property(
 *         property="document_type",
 *         type="string",
 *         example="Google Drive File"
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time"
 *     ),
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time"
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="NonNominatif",
 *     title="NonNominatif",
 *     description="Non-Nominatif Pengeluaran",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="rka_detail_id",
 *         type="integer",
 *         example=5
 *     ),
 *     @OA\Property(
 *         property="user_id",
 *         type="integer",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="deskripsi_kegiatan",
 *         type="string",
 *         example="Pembelian ATK Bulanan"
 *     ),
 *     @OA\Property(
 *         property="tanggal",
 *         type="string",
 *         format="date",
 *         example="2025-01-15"
 *     ),
 *     @OA\Property(
 *         property="total_anggaran_terpakai",
 *         type="number",
 *         format="decimal",
 *         example=5000000.00
 *     ),
 *     @OA\Property(
 *         property="evidence_link",
 *         type="string",
 *         example="https://drive.google.com/file/d/1ABCxyz/view?usp=sharing"
 *     ),
 *     @OA\Property(
 *         property="status",
 *         type="string",
 *         enum={"draft", "submitted", "rejected"},
 *         example="draft"
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time",
 *         example="2025-01-01T00:00:00.000000Z"
 *     ),
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time",
 *         example="2025-01-01T00:00:00.000000Z"
 *     ),
 *     @OA\Property(
 *         property="rka_detail",
 *         type="object",
 *         @OA\Property(property="id", type="integer"),
 *         @OA\Property(property="code_rka", type="string"),
 *         @OA\Property(property="layanan", type="string")
 *     ),
 *     @OA\Property(
 *         property="user",
 *         ref="#/components/schemas/User"
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="RKADetail",
 *     title="RKADetail",
 *     description="RKA Detail - Rencana Kerja dan Anggaran",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="programDukunganManajemen", type="string", example="7394"),
 *     @OA\Property(property="kodeProgram", type="string", example="EBA"),
 *     @OA\Property(property="layananUmum", type="string", example="962"),
 *     @OA\Property(property="kodeLayanan1", type="string", example="EBA"),
 *     @OA\Property(property="kodeLayanan2", type="string", example="962"),
 *     @OA\Property(property="layananTataUsaha", type="string", example="001"),
 *     @OA\Property(property="kategoriAnggaran", type="string", example="A", description="Kategori A/B/C"),
 *     @OA\Property(property="codeRka", type="string", example="524111"),
 *     @OA\Property(property="layanan", type="string", example="Belanja Perjalanan Dinas Biasa Dalam Wilayah"),
 *     @OA\Property(property="wilayah", type="string", example="Jakarta"),
 *     @OA\Property(property="artiKode", type="string", example="Belanja Perjalanan Dinas Biasa"),
 *     @OA\Property(property="sisaPemakaianAnggaran", type="number", example=50.00),
 *     @OA\Property(property="status", type="string", example="Aktif"),
 *     @OA\Property(property="anggaranPerjalanan", type="number", format="decimal", example=5000000.00),
 *     @OA\Property(property="anggaranLayanan", type="number", format="decimal", example=100000000.00),
 *     @OA\Property(property="anggaranLayananUsed", type="number", format="decimal", example=25000000.00),
 *     @OA\Property(property="anggaranLayananAvailable", type="number", format="decimal", example=75000000.00),
 *     @OA\Property(property="sp2d", type="number", format="decimal", example=10000000.00),
 *     @OA\Property(property="anggaran_berjalan", type="number", format="decimal", example=25000000.00),
 *     @OA\Property(property="anggaran_sp2d", type="number", format="decimal", example=10000000.00),
 *     @OA\Property(property="anggaran_tersisa", type="number", format="integer", example=65000000),
 *     @OA\Property(property="sbm", type="string", example="perwakilan_ri")
 * )
 *
 * @OA\Schema(
 *     schema="KategoriAnggaran",
 *     title="KategoriAnggaran",
 *     description="Kategori Anggaran (A/B/C)",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="tahun", type="integer", example=2025),
 *     @OA\Property(property="nama_kategori", type="string", example="Kategori A"),
 *     @OA\Property(property="kode", type="string", example="A", description="Kode kategori (A/B/C)"),
 *     @OA\Property(property="total_anggaran_kategori", type="number", format="decimal", example=2000000000.00),
 *     @OA\Property(property="anggaran_berjalan_kategori", type="number", format="decimal", example=500000000.00),
 *     @OA\Property(property="sp2d_kategori", type="number", format="decimal", example=300000000.00),
 *     @OA\Property(property="keterangan", type="string", example="Kategori anggaran A"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-01-01T00:00:00.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-01-01T00:00:00.000000Z"),
 *     @OA\Property(property="sisa_anggaran_kategori", type="number", format="decimal", example=1500000000.00)
 * )
 */
class SwaggerController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/test",
     *     tags={"Authentication"},
     *     summary="Test endpoint",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="API is working!"
     *             )
     *         )
     *     )
     * )
     */
    public function test()
    {
        return response()->json(['message' => 'API is working!']);
    }

    /**
     * @OA\Get(
     *     path="/api/sbm/categories",
     *     tags={"SBM"},
     *     summary="Get all SBM categories",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="success",
     *                 type="boolean",
     *                 example=true
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/SbmCategory")
     *             )
     *         )
     *     )
     * )
     */
    public function sbmCategories()
    {
        // Documentation only - actual logic in SbmController
    }

    /**
     * @OA\Get(
     *     path="/api/sbm/{category}",
     *     tags={"SBM"},
     *     summary="Get SBM data by category with filters",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         description="Category name (e.g., transportasi_provinsi)",
     *         @OA\Schema(type="string", example="transportasi_provinsi")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search keyword",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="provinsi",
     *         in="query",
     *         description="Filter by provinsi",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="grouping",
     *         in="query",
     *         description="Filter by grouping label",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Sort by field",
     *         @OA\Schema(type="string", enum={"id", "no", "provinsi", "uraian", "besaran"})
     *     ),
     *     @OA\Parameter(
     *         name="order",
     *         in="query",
     *         description="Sort order",
     *         @OA\Schema(type="string", enum={"asc", "desc"})
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page (max 100)",
     *         @OA\Schema(type="integer", minimum=1, maximum=100, default=15)
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         @OA\Schema(type="integer", minimum=1, default=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="success",
     *                 type="boolean",
     *                 example=true
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/SbmDetail")
     *             ),
     *             @OA\Property(
     *                 property="meta",
     *                 type="object",
     *                 @OA\Property(property="category", type="string"),
     *                 @OA\Property(property="total", type="integer"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="current_page", type="integer"),
     *                 @OA\Property(property="last_page", type="integer")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Category not found"
     *     )
     * )
     */
    public function sbmByCategory()
    {
        // Documentation only - actual logic in SbmController
    }

    /**
     * @OA\Get(
     *     path="/api/sbm/filters/options",
     *     tags={"SBM"},
     *     summary="Get available filter options (all categories)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="success",
     *                 type="boolean",
     *                 example=true
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="categories",
     *                     type="array",
     *                     description="All available categories",
     *                     @OA\Items(type="string")
     *                 ),
     *                 @OA\Property(
     *                     property="sub_categories",
     *                     type="array",
     *                     description="All available sub-categories",
     *                     @OA\Items(type="string")
     *                 ),
     *                 @OA\Property(
     *                     property="parent_sections",
     *                     type="array",
     *                     description="All available parent sections",
     *                     @OA\Items(type="string")
     *                 ),
     *                 @OA\Property(
     *                     property="grouping_labels",
     *                     type="array",
     *                     description="All available grouping labels",
     *                     @OA\Items(type="string")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function sbmFilterOptions()
    {
        // Documentation only - actual logic in SbmController
    }

    /**
     * @OA\Get(
     *     path="/api/sbm/filters/{category}",
     *     tags={"SBM"},
     *     summary="Get filter options for specific category",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         description="Category name (e.g., honorarium_28, transportasi_provinsi)",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="success",
     *                 type="boolean",
     *                 example=true
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 description="Filter options specific to the category. Each field from the Excel file becomes a filter option with all unique values.",
     *                 additionalProperties=true,
     *                 example={
     *                     "_source_files": {"Honorarium 28 SATUAN BIAYA UANG HARIAN DAN UANG REPRESENTASI PERJALANAN DINAS DALAM NEGERI.xlsx"},
     *                     "provinsi": {"ACEH", "DKI JAKARTA", "JAWA BARAT"},
     *                     "satuan": {"OH"}
     *                 }
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Category not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Category not found")
     *         )
     *     )
     * )
     */
    public function sbmFiltersByCategory()
    {
        // Documentation only - actual logic in SbmController
    }

    /**
     * @OA\Get(
     *     path="/api/sbm/summary",
     *     tags={"SBM"},
     *     summary="Get SBM summary statistics",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="success",
     *                 type="boolean",
     *                 example=true
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="total_records", type="integer"),
     *                 @OA\Property(property="total_categories", type="integer"),
     *                 @OA\Property(
     *                     property="by_category",
     *                     type="object",
     *                     additionalProperties=true
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function sbmSummary()
    {
        // Documentation only - actual logic in SbmController
    }

    /**
     * @OA\Get(
     *     path="/api/sbm/detail/{id}",
     *     tags={"SBM"},
     *     summary="Get single SBM record by ID",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Record ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="success",
     *                 type="boolean",
     *                 example=true
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 ref="#/components/schemas/SbmDetail"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Record not found"
     *     )
     * )
     */
    public function sbmDetail()
    {
        // Documentation only - actual logic in SbmController
    }

    // ==================== NOMINATIF ENDPOINTS ====================

    /**
     * @OA\Get(
     *     path="/api/nominatifs-new",
     *     tags={"Nominatif"},
     *     summary="Get all nominatifs",
     *     description="Get list of all nominatifs perjalanan dinas for the authenticated user",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="success",
     *                 type="boolean",
     *                 example=true
     *             ),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/NominatifNew")
     *             )
     *         )
     *     )
     * )
     */
    public function nominatifsIndex()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/nominatifs-new",
     *     tags={"Nominatif"},
     *     summary="Create new nominatif",
     *     description="Create a new nominatif perjalanan dinas",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"rka_detail_id", "deskripsi_perjalanan_dinas", "tanggal_mulai", "tanggal_selesai"},
     *             @OA\Property(property="rka_detail_id", type="integer", example=5),
     *             @OA\Property(property="deskripsi_perjalanan_dinas", type="string", example="Perjalanan Dinas ke Jakarta"),
     *             @OA\Property(property="tanggal_mulai", type="string", format="date", example="2025-01-15"),
     *             @OA\Property(property="tanggal_selesai", type="string", format="date", example="2025-01-17")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Nominatif created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", ref="#/components/schemas/NominatifNew"),
     *             @OA\Property(property="message", type="string", example="Nominatif created successfully")
     *         )
     *     )
     * )
     */
    public function nominatifsStore()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/nominatifs-new/{id}",
     *     tags={"Nominatif"},
     *     summary="Get nominatif by ID",
     *     description="Get detailed information about a specific nominatif",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Nominatif ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", ref="#/components/schemas/NominatifNew")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Nominatif not found"
     *     )
     * )
     */
    public function nominatifsShow()
    {
        // Documentation only
    }

    /**
     * @OA\Put(
     *     path="/api/nominatifs-new/{id}",
     *     tags={"Nominatif"},
     *     summary="Update nominatif",
     *     description="Update nominatif perjalanan dinas (only draft status)",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="deskripsi_perjalanan_dinas", type="string"),
     *             @OA\Property(property="tanggal_mulai", type="string", format="date"),
     *             @OA\Property(property="tanggal_selesai", type="string", format="date")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Nominatif updated successfully"
     *     )
     * )
     */
    public function nominatifsUpdate()
    {
        // Documentation only
    }

    /**
     * @OA\Delete(
     *     path="/api/nominatifs-new/{id}",
     *     tags={"Nominatif"},
     *     summary="Delete nominatif",
     *     description="Delete nominatif (only draft status)",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Nominatif deleted successfully"
     *     )
     * )
     */
    public function nominatifsDestroy()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/nominatifs-new/{id}/submit",
     *     tags={"Nominatif"},
     *     summary="Submit nominatif",
     *     description="Submit nominatif to change status from draft to submitted",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Nominatif submitted successfully"
     *     )
     * )
     */
    public function nominatifsSubmit()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/nominatifs-new/search",
     *     tags={"Nominatif"},
     *     summary="Search nominatifs",
     *     description="Search nominatifs by keyword",
     *     @OA\Parameter(
     *         name="q",
     *         in="query",
     *         required=true,
     *         description="Search keyword",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function nominatifsSearch()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/nominatifs-new/statistics",
     *     tags={"Nominatif"},
     *     summary="Get nominatif statistics",
     *     description="Get statistics about nominatifs",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function nominatifsStatistics()
    {
        // Documentation only
    }

    // ==================== DETAIL ROWS ENDPOINTS ====================

    /**
     * @OA\Get(
     *     path="/api/nominatifs/{nominatifId}/details",
     *     tags={"Nominatif"},
     *     summary="Get detail rows for nominatif",
     *     description="Get all person and route data rows for a nominatif",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/NominatifDetailRow")
     *             )
     *         )
     *     )
     * )
     */
    public function detailRowsIndex()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/nominatifs/{nominatifId}/details",
     *     tags={"Nominatif"},
     *     summary="Create detail row",
     *     description="Create a new person and route data row",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"person_name", "asal", "tujuan", "tanggal_pergi", "tanggal_sampai", "golongan", "jabatan", "eselon"},
     *             @OA\Property(property="person_type", type="string", enum={"main", "tambahan"}, example="main"),
     *             @OA\Property(property="person_name", type="string", example="Ahmad Sudrajat"),
     *             @OA\Property(property="row_order", type="integer", example=1),
     *             @OA\Property(property="asal", type="string", example="Jakarta"),
     *             @OA\Property(property="tujuan", type="string", example="Bandung"),
     *             @OA\Property(property="tanggal_pergi", type="string", format="date", example="2025-01-15"),
     *             @OA\Property(property="tanggal_sampai", type="string", format="date", example="2025-01-17"),
     *             @OA\Property(property="golongan", type="string", example="IV/e"),
     *             @OA\Property(property="jabatan", type="string", example="Kepala Bagian"),
     *             @OA\Property(property="eselon", type="string", example="IIb")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Detail row created successfully"
     *     )
     * )
     */
    public function detailRowsStore()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/nominatifs/{nominatifId}/details/validate",
     *     tags={"Nominatif"},
     *     summary="Validate draft data",
     *     description="Validate nominatif draft data before saving",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="details", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="biaya", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Validation successful"
     *     )
     * )
     */
    public function detailRowsValidate()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/nominatifs/{nominatifId}/details/execute",
     *     tags={"Nominatif"},
     *     summary="Execute draft",
     *     description="Execute validated draft data and save to database",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Draft executed successfully"
     *     )
     * )
     */
    public function detailRowsExecute()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/nominatifs/{nominatifId}/details/bulk",
     *     tags={"Nominatif"},
     *     summary="Bulk create detail rows",
     *     description="Create multiple detail rows at once",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Bulk create successful"
     *     )
     * )
     */
    public function detailRowsBulkStore()
    {
        // Documentation only
    }

    /**
     * @OA\Put(
     *     path="/api/nominatifs/{nominatifId}/details/bulk",
     *     tags={"Nominatif"},
     *     summary="Bulk update detail rows",
     *     description="Update multiple detail rows at once",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Bulk update successful"
     *     )
     * )
     */
    public function detailRowsBulkUpdate()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/nominatifs/{nominatifId}/details/{rowId}",
     *     tags={"Nominatif"},
     *     summary="Get detail row by ID",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="rowId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function detailRowsShow()
    {
        // Documentation only
    }

    /**
     * @OA\Put(
     *     path="/api/nominatifs/{nominatifId}/details/{rowId}",
     *     tags={"Nominatif"},
     *     summary="Update detail row",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="rowId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detail row updated successfully"
     *     )
     * )
     */
    public function detailRowsUpdate()
    {
        // Documentation only
    }

    /**
     * @OA\Delete(
     *     path="/api/nominatifs/{nominatifId}/details/{rowId}",
     *     tags={"Nominatif"},
     *     summary="Delete detail row",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="rowId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detail row deleted successfully"
     *     )
     * )
     */
    public function detailRowsDestroy()
    {
        // Documentation only
    }

    // ==================== BIAYA ROWS ENDPOINTS ====================

    /**
     * @OA\Get(
     *     path="/api/nominatifs/details/{detailRowId}/biaya",
     *     tags={"Nominatif"},
     *     summary="Get biaya rows for detail row",
     *     description="Get all financial data for a specific detail row",
     *     @OA\Parameter(
     *         name="detailRowId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", ref="#/components/schemas/NominatifBiayaRow")
     *         )
     *     )
     * )
     */
    public function biayaRowsIndex()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/nominatifs/details/{detailRowId}/biaya",
     *     tags={"Nominatif"},
     *     summary="Create biaya row",
     *     description="Create financial data for a detail row",
     *     @OA\Parameter(
     *         name="detailRowId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="transport_pesawat_non_pp_pagu", type="number", format="decimal", example=1500000.00),
     *             @OA\Property(property="transport_pesawat_non_pp_aktual", type="number", format="decimal", example=1350000.00),
     *             @OA\Property(property="transport_taksi_pagu", type="number", format="decimal", example=100000.00),
     *             @OA\Property(property="transport_taksi_aktual", type="number", format="decimal", example=95000.00),
     *             @OA\Property(property="penginapan_jumlah_malam", type="integer", example=2),
     *             @OA\Property(property="penginapan_pagu_perhari", type="number", format="decimal", example=500000.00),
     *             @OA\Property(property="penginapan_aktual_perhari", type="number", format="decimal", example=480000.00)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Biaya row created successfully"
     *     )
     * )
     */
    public function biayaRowsStore()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/nominatifs/details/{detailRowId}/biaya/{biayaId}",
     *     tags={"Nominatif"},
     *     summary="Get biaya row by ID",
     *     @OA\Parameter(
     *         name="detailRowId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="biayaId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function biayaRowsShow()
    {
        // Documentation only
    }

    /**
     * @OA\Put(
     *     path="/api/nominatifs/details/{detailRowId}/biaya/{biayaId}",
     *     tags={"Nominatif"},
     *     summary="Update biaya row",
     *     @OA\Parameter(
     *         name="detailRowId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="biayaId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Biaya row updated successfully"
     *     )
     * )
     */
    public function biayaRowsUpdate()
    {
        // Documentation only
    }

    /**
     * @OA\Put(
     *     path="/api/nominatifs/details/{detailRowId}/biaya/{biayaId}/simplified",
     *     tags={"Nominatif"},
     *     summary="Update biaya row (simplified)",
     *     description="Update only the essential fields of biaya row",
     *     @OA\Parameter(
     *         name="detailRowId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="biayaId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Biaya row updated successfully"
     *     )
     * )
     */
    public function biayaRowsUpdateSimplified()
    {
        // Documentation only
    }

    /**
     * @OA\Delete(
     *     path="/api/nominatifs/details/{detailRowId}/biaya/{biayaId}",
     *     tags={"Nominatif"},
     *     summary="Delete biaya row",
     *     @OA\Parameter(
     *         name="detailRowId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="biayaId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Biaya row deleted successfully"
     *     )
     * )
     */
    public function biayaRowsDestroy()
    {
        // Documentation only
    }

    // ==================== EVIDENCE ENDPOINTS ====================

    /**
     * @OA\Get(
     *     path="/api/nominatifs/{nominatifId}/evidence",
     *     tags={"Nominatif"},
     *     summary="Get evidence for nominatif",
     *     description="Get all evidence files for a nominatif",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/NominatifEvidence")
     *             )
     *         )
     *     )
     * )
     */
    public function evidenceIndex()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/nominatifs/{nominatifId}/evidence/all",
     *     tags={"Nominatif"},
     *     summary="Get all evidence with file type info",
     *     description="Get all evidence files with file type information",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function evidenceGetAll()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/nominatifs/{nominatifId}/evidence/{evidenceId}",
     *     tags={"Nominatif"},
     *     summary="Get evidence by ID",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="evidenceId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function evidenceShow()
    {
        // Documentation only
    }

    /**
     * @OA\Put(
     *     path="/api/nominatifs/{nominatifId}/evidence/{evidenceId}",
     *     tags={"Nominatif"},
     *     summary="Update evidence",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="evidenceId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Evidence updated successfully"
     *     )
     * )
     */
    public function evidenceUpdate()
    {
        // Documentation only
    }

    /**
     * @OA\Delete(
     *     path="/api/nominatifs/{nominatifId}/evidence/{evidenceId}",
     *     tags={"Nominatif"},
     *     summary="Delete evidence",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="evidenceId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Evidence deleted successfully"
     *     )
     * )
     */
    public function evidenceDestroy()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/nominatifs/{nominatifId}/evidence/{evidenceId}/download",
     *     tags={"Nominatif"},
     *     summary="Download evidence",
     *     description="Download or get evidence file",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="evidenceId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Evidence file"
     *     )
     * )
     */
    public function evidenceDownload()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/nominatifs/{nominatifId}/details/{detailRowId}/evidence",
     *     tags={"Nominatif"},
     *     summary="Create evidence for detail row",
     *     description="Create evidence file for a specific detail row",
     *     @OA\Parameter(
     *         name="nominatifId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="detailRowId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"evidence_link", "evidence_name"},
     *             @OA\Property(property="evidence_link", type="string", example="https://drive.google.com/file/d/1ABCxyz/view?usp=sharing"),
     *             @OA\Property(property="evidence_name", type="string", example="Tiket Pesawat PDF"),
     *             @OA\Property(property="keterangan", type="string", example="Tiket pesawat PP")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Evidence created successfully"
     *     )
     * )
     */
    public function evidenceStoreWithDetailRow()
    {
        // Documentation only
    }

    // ==================== NON-NOMINATIF ENDPOINTS ====================

    /**
     * @OA\Get(
     *     path="/api/non-nominatifs",
     *     tags={"NonNominatif"},
     *     summary="Get all non-nominatifs",
     *     description="Get list of all non-nominatif pengeluaran for the authenticated user",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/NonNominatif")
     *             )
     *         )
     *     )
     * )
     */
    public function nonNominatifsIndex()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/non-nominatifs",
     *     tags={"NonNominatif"},
     *     summary="Create new non-nominatif",
     *     description="Create a new non-nominatif pengeluaran",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"rka_detail_id", "deskripsi_kegiatan", "tanggal", "total_anggaran_terpakai", "evidence_link"},
     *             @OA\Property(property="rka_detail_id", type="integer", example=5),
     *             @OA\Property(property="deskripsi_kegiatan", type="string", example="Pembelian ATK Bulanan"),
     *             @OA\Property(property="tanggal", type="string", format="date", example="2025-01-15"),
     *             @OA\Property(property="total_anggaran_terpakai", type="number", format="decimal", example=5000000.00),
     *             @OA\Property(property="evidence_link", type="string", example="https://drive.google.com/file/d/1ABCxyz/view?usp=sharing")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Non-nominatif created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", ref="#/components/schemas/NonNominatif"),
     *             @OA\Property(property="message", type="string", example="Non-nominatif created successfully")
     *         )
     *     )
     * )
     */
    public function nonNominatifsStore()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/non-nominatifs/{id}",
     *     tags={"NonNominatif"},
     *     summary="Get non-nominatif by ID",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", ref="#/components/schemas/NonNominatif")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Non-nominatif not found"
     *     )
     * )
     */
    public function nonNominatifsShow()
    {
        // Documentation only
    }

    /**
     * @OA\Put(
     *     path="/api/non-nominatifs/{id}",
     *     tags={"NonNominatif"},
     *     summary="Update non-nominatif",
     *     description="Update non-nominatif (only draft status)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="deskripsi_kegiatan", type="string"),
     *             @OA\Property(property="tanggal", type="string", format="date"),
     *             @OA\Property(property="total_anggaran_terpakai", type="number", format="decimal"),
     *             @OA\Property(property="evidence_link", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Non-nominatif updated successfully"
     *     )
     * )
     */
    public function nonNominatifsUpdate()
    {
        // Documentation only
    }

    /**
     * @OA\Delete(
     *     path="/api/non-nominatifs/{id}",
     *     tags={"NonNominatif"},
     *     summary="Delete non-nominatif",
     *     description="Delete non-nominatif (only draft status)",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Non-nominatif deleted successfully"
     *     )
     * )
     */
    public function nonNominatifsDestroy()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/non-nominatifs/{id}/submit",
     *     tags={"NonNominatif"},
     *     summary="Submit non-nominatif",
     *     description="Submit non-nominatif to change status from draft to submitted",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Non-nominatif submitted successfully"
     *     )
     * )
     */
    public function nonNominatifsSubmit()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/rka-details",
     *     tags={"RKA"},
     *     summary="Get all RKA details",
     *     description="Get list of RKA (Rencana Kerja dan Anggaran) details with optional search and filter",
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         required=false,
     *         description="Search by layanan, code_rka, wilayah, or arti_kode",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="kategori",
     *         in="query",
     *         required=false,
     *         description="Filter by kategori (A/B/C)",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/RKADetail")
     *         )
     *     )
     * )
     */
    public function rkaDetailsIndex()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/rka-details/import",
     *     tags={"RKA"},
     *     summary="Import RKA details from Excel",
     *     description="Import RKA details data from Excel file (xlsx/xls/csv)",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="excel_file",
     *                     type="string",
     *                     format="binary",
     *                     description="Excel file (max 10MB)"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Import successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Data berhasil diimport!"),
     *             @OA\Property(property="imported_count", type="integer", example=65),
     *             @OA\Property(
     *                 property="errors",
     *                 type="array",
     *                 @OA\Items(type="string"),
     *                 example={}
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function rkaDetailsImport()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/rka-details/kategori",
     *     tags={"RKA"},
     *     summary="Get all kategori anggaran",
     *     description="Get list of kategori anggaran (A/B/C) with budget information",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/KategoriAnggaran")
     *         )
     *     )
     * )
     */
    public function rkaDetailsKategori()
    {
        // Documentation only
    }

    // ============================================================
    // SECURE ROUTES (PRODUCTION) - Laravel Sanctum Authentication
    // ============================================================

    /**
     * @OA\Get(
     *     path="/api/secure/sbm/categories",
     *     tags={"SBM"},
     *     summary="Get all SBM categories (Secure)",
     *     description="Get all 31 SBM categories with record counts",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     */
    public function secureSbmCategories()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/secure/sbm/{category}",
     *     tags={"SBM"},
     *     summary="Get SBM data by category (Secure)",
     *     description="Get SBM data for specific category with optional filters",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         description="Category name (e.g., transportasi_provinsi, honorarium_28)",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         required=false,
     *         @OA\Schema(type="integer", example=20)
     *     ),
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureSbmShow()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/secure/sbm/summary",
     *     tags={"SBM"},
     *     summary="Get SBM summary statistics (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureSbmSummary()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/secure/sbm/filters/options",
     *     tags={"SBM"},
     *     summary="Get SBM filter options (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureSbmFilters()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/secure/sbm/filters/{category}",
     *     tags={"SBM"},
     *     summary="Get SBM filter options by category (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureSbmFiltersByCategory()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/secure/sbm/detail/{id}",
     *     tags={"SBM"},
     *     summary="Get SBM record by ID (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureSbmDetail()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/secure/nominatifs-new",
     *     tags={"Nominatif"},
     *     summary="Get all nominatifs (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureNominatifsIndex()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/secure/nominatifs-new",
     *     tags={"Nominatif"},
     *     summary="Create nominatif (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureNominatifsStore()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/secure/nominatifs-new/{id}",
     *     tags={"Nominatif"},
     *     summary="Get nominatif by ID (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureNominatifsShow()
    {
        // Documentation only
    }

    /**
     * @OA\Put(
     *     path="/api/secure/nominatifs-new/{id}",
     *     tags={"Nominatif"},
     *     summary="Update nominatif (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureNominatifsUpdate()
    {
        // Documentation only
    }

    /**
     * @OA\Delete(
     *     path="/api/secure/nominatifs-new/{id}",
     *     tags={"Nominatif"},
     *     summary="Delete nominatif (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureNominatifsDestroy()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/secure/nominatifs-new/{id}/submit",
     *     tags={"Nominatif"},
     *     summary="Submit nominatif (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureNominatifsSubmit()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/secure/dashboard",
     *     tags={"Dashboard"},
     *     summary="Get dashboard data (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureDashboardIndex()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/secure/dashboard/{tahun}",
     *     tags={"Dashboard"},
     *     summary="Get dashboard data by year (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureDashboardByYear()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/secure/dashboard/kpi",
     *     tags={"Dashboard"},
     *     summary="Get KPI metrics (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureDashboardKpi()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/secure/dashboard/charts",
     *     tags={"Dashboard"},
     *     summary="Get chart data (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureDashboardCharts()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/secure/kategori/{tahun}",
     *     tags={"Dashboard"},
     *     summary="Get kategori by year (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureKategoriByTahun()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/secure/kategori/{tahun}/{kategori}/update-terpakai",
     *     tags={"Dashboard"},
     *     summary="Update anggaran terpakai (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureUpdateTerpakai()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/secure/kategori/{tahun}/{kategori}/update-sp2d",
     *     tags={"Dashboard"},
     *     summary="Update SP2D (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureUpdateSp2d()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/secure/kategori/{tahun}/sync",
     *     tags={"Dashboard"},
     *     summary="Sync main anggaran (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureSyncMainAnggaran()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/secure/rka-details",
     *     tags={"RKA"},
     *     summary="Get all RKA details (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureRkaDetailsIndex()
    {
        // Documentation only
    }

    /**
     * @OA\Post(
     *     path="/api/secure/rka-details/import",
     *     tags={"RKA"},
     *     summary="Import RKA details from Excel (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureRkaDetailsImport()
    {
        // Documentation only
    }

    /**
     * @OA\Get(
     *     path="/api/secure/rka-details/kategori",
     *     tags={"RKA"},
     *     summary="Get all kategori anggaran (Secure)",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function secureRkaDetailsKategori()
    {
        // Documentation only
    }
}
