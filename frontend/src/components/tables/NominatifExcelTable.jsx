import React, { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Save,
  Send,
  CheckCircle,
  Upload,
  Eye,
  X,
  Upload as UploadIcon,
} from "lucide-react";

// Global CSS untuk menghilangkan arrow buttons dari currency inputs
const globalStyles = `
  /* Remove arrow buttons from currency inputs to prevent accidental scroll changes */
  input.currency-input::-webkit-outer-spin-button,
  input.currency-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input.currency-input {
    -moz-appearance: textfield;
  }

  /* Keep arrow buttons for number inputs (jumlah malam/hari) - default behavior */
  input[type="number"].keep-arrows {
    /* Tidak perlu override, biarkan default arrows */
  }
`;

const NominatifExcelTable = ({
  rkaDetail,
  initialData = [],
  onSave,
  onSubmit,
}) => {
  const processedInitialData = initialData;

  // Removed excessive logging to prevent console spam

  const [rows, setRows] = useState(processedInitialData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const tableRef = useRef(null);

  // Initialize with one empty row if no data (create mode only)
  React.useEffect(() => {
    // Only add empty row if we're in create mode (no initial data)
    if (
      rows.length === 0 &&
      processedInitialData.length === 0 &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("📊 NominatifExcelTable - Adding empty row (create mode)");
      addRow();
    }
  }, [processedInitialData.length]);

  // Update rows when initialData changes (for edit mode)
  React.useEffect(() => {
    if (processedInitialData.length > 0) {
      console.log("🔄 ProcessedInitialData changed, preserving evidence...");
      setRows((prevRows) => {
        // Preserve evidence data when updating from initialData
        const newRows = processedInitialData.map((initialRow) => {
          const existingRow = prevRows.find((r) => r.id === initialRow.id);
          if (existingRow) {
            // Merge initial data with existing evidence data
            const mergedRow = {
              ...initialRow,
              // Preserve evidence fields from existing row
              evidence_files: existingRow.evidence_files || [],
              evidence_uploading: existingRow.evidence_uploading,
              evidence_uploaded: existingRow.evidence_uploaded,
            };
            console.log("🔄 Merging row:", {
              id: initialRow.id,
              evidenceCount: existingRow.evidence_files?.length || 0,
            });
            return mergedRow;
          }
          console.log("🔄 New row created:", initialRow.id);
          return initialRow;
        });
        return newRows;
      });
    }
  }, [processedInitialData]);

  // Validation function for required fields
  const validateRows = () => {
    const errors = {};

    rows.forEach((row, index) => {
      const rowErrors = {};

      // Validate Golongan - required field
      if (!row.golongan || row.golongan.trim() === "") {
        rowErrors.golongan = "Golongan harus diisi";
      }

      // Validate Eselon - required field
      if (!row.eselon || row.eselon.trim() === "") {
        rowErrors.eselon = "Eselon harus diisi";
      }

      // Only add errors object if there are actual errors
      if (Object.keys(rowErrors).length > 0) {
        errors[index] = rowErrors;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  // Add new row
  const addRow = () => {
    // Find the first row to use as reference
    const firstRow = rows[0];

    const newRow = {
      id: Date.now(),
      // Copy reference fields if we have a reference row
      nama_lengkap: firstRow ? firstRow.nama_lengkap : "",
      golongan: firstRow ? firstRow.golongan : "",
      jabatan: firstRow ? firstRow.jabatan : "",
      eselon: firstRow ? firstRow.eselon : "",
      // Other fields are always empty for new rows
      asal: "",
      tujuan: "",
      tanggal_pergi: "",
      tanggal_sampai: "",
      // Transportasi (sesuai database yang ada)
      transport_pesawat_non_pp_pagu: "",
      transport_pesawat_non_pp_aktual: "",
      transport_taksi_pagu: "",
      transport_taksi_aktual: "",
      // Penginapan
      penginapan_jumlah_malam: "",
      penginapan_pagu_perhari: "",
      penginapan_aktual_perhari: "",
      // Uang Harian Meeting Fullboard (sesuai database)
      uang_harian_meeting_fullboard_jumlah_hari: "",
      uang_harian_meeting_fullboard_pagu_perhari: "",
      uang_harian_meeting_fullboard_aktual_perhari: "",
      // Uang Harian Meeting Fullday (sesuai database)
      uang_harian_meeting_fullday_jumlah_hari: "",
      uang_harian_meeting_fullday_pagu_perhari: "",
      uang_harian_meeting_fullday_aktual_perhari: "",
      // Uang Harian Luar Kota (3 fields)
      uang_harian_luar_kota_jumlah_hari: "",
      uang_harian_luar_kota_pagu_perhari: "",
      uang_harian_luar_kota_aktual_perhari: "",
      // Uang Harian Dalam Kota (3 fields)
      uang_harian_dalam_kota_jumlah_hari: "",
      uang_harian_dalam_kota_pagu_perhari: "",
      uang_harian_dalam_kota_aktual_perhari: "",
      // Representasi Luar Kota (3 fields)
      representasi_luar_kota_jumlah_hari: "",
      representasi_luar_kota_pagu_perhari: "",
      representasi_luar_kota_aktual_perhari: "",
      // Representasi Dalam Kota (3 fields)
      representasi_dalam_kota_jumlah_hari: "",
      representasi_dalam_kota_pagu_perhari: "",
      representasi_dalam_kota_aktual_perhari: "",
      // Evidence fields - Changed to array for multiple files
      evidence_files: [], // Array of { id, url, file, filename, filesize }
      evidence_uploading: false,
      evidence_uploaded: false,
    };

    setRows([...rows, newRow]);
  };

  // Update row data
  const updateRow = (id, field, value) => {
    console.log("🔄 Updating row:", { id, field, value });

    // Debug: Show current state before update
    if (field.startsWith("evidence_")) {
      console.log(
        "🔍 Before evidence update - current row state:",
        rows.find((r) => r.id === id)
      );
    }

    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        // Always update the target row
        return { ...row, [field]: value };
      }
      return row;
    });

    console.log(
      "📋 Setting new rows state:",
      updatedRows.map((r) => ({
        id: r.id,
        hasEvidence: !!r.evidence_url,
        filename: r.evidence_filename,
      }))
    );

    setRows(updatedRows);

    // Debug: Check state after setting
    if (field.startsWith("evidence_")) {
      setTimeout(() => {
        // Use the latest state from updatedRows instead of rows
        const latestState = updatedRows.find((r) => r.id === id);
        console.log("🔍 After setRows - evidence state:", {
          id,
          field,
          evidence_filename: latestState?.evidence_filename,
          evidence_url: latestState?.evidence_url,
          evidence_filesize: latestState?.evidence_filesize,
        });
      }, 100);
    }

    // Clear validation error for this field if it was previously invalid
    if (
      (field === "golongan" || field === "eselon") &&
      value &&
      value.trim() !== ""
    ) {
      const rowIndex = rows.findIndex((row) => row.id === id);
      if (rowIndex !== -1 && validationErrors[rowIndex]?.[field]) {
        const newErrors = { ...validationErrors };
        if (newErrors[rowIndex]) {
          delete newErrors[rowIndex][field];
          // If no more errors for this row, remove the entire row entry
          if (Object.keys(newErrors[rowIndex]).length === 0) {
            delete newErrors[rowIndex];
          }
          setValidationErrors(newErrors);
        }
      }
    }
  };

  // Delete row
  const deleteRow = (id) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));

      // Clear validation errors for deleted row
      const rowIndex = rows.findIndex((row) => row.id === id);
      if (rowIndex !== -1 && validationErrors[rowIndex]) {
        const newErrors = { ...validationErrors };
        delete newErrors[rowIndex];
        setValidationErrors(newErrors);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (rowId, file) => {
    console.log("🔄 File upload triggered:", {
      rowId,
      file: file?.name,
      size: file?.size,
    });

    if (file) {
      // Create file URL for preview
      const fileUrl = URL.createObjectURL(file);
      const fileSize = (file.size / 1024).toFixed(2) + " KB"; // Convert to KB
      const fileId = Date.now() + Math.random();

      const newFile = {
        id: fileId,
        url: fileUrl,
        file: file,
        filename: file.name,
        filesize: fileSize,
      };

      console.log("📤 Adding new evidence file:", {
        rowId,
        fileId,
        fileName: file.name,
        fileSize,
      });

      // Set uploading state first
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === rowId ? { ...row, evidence_uploading: true } : row
        )
      );

      // Simulate processing delay for better UX
      setTimeout(() => {
        // Add new file to evidence_files array
        setRows((prevRows) =>
          prevRows.map((row) => {
            if (row.id === rowId) {
              const updatedFiles = [...(row.evidence_files || []), newFile];
              return {
                ...row,
                evidence_uploading: false,
                evidence_files: updatedFiles,
                evidence_uploaded: true,
              };
            }
            return row;
          })
        );

        console.log("✅ Evidence upload completed for row:", rowId);

        // Clear upload success state after 3 seconds but keep file data
        setTimeout(() => {
          setRows((prevRows) => {
            const currentRow = prevRows.find((r) => r.id === rowId);
            console.log(
              "🔄 Evidence count for row:",
              rowId,
              currentRow?.evidence_files?.length || 0
            );

            return prevRows.map((row) =>
              row.id === rowId ? { ...row, evidence_uploaded: false } : row
            );
          });
          console.log(
            "🔄 Cleared upload success state but file data preserved"
          );
        }, 3000);
      }, 500); // 500ms delay
    } else {
      console.log("❌ No file provided for upload");
    }
  };

  // Calculate totals
  const totals = React.useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        // Transportasi (2 fields baru)
        const transport_pesawat_non_pp_pagu =
          acc.transport_pesawat_non_pp_pagu +
          (parseFloat(row.transport_pesawat_non_pp_pagu) || 0);
        const transport_pesawat_non_pp_aktual =
          acc.transport_pesawat_non_pp_aktual +
          (parseFloat(row.transport_pesawat_non_pp_aktual) || 0);
        const transport_taksi_pagu =
          acc.transport_taksi_pagu +
          (parseFloat(row.transport_taksi_pagu) || 0);
        const transport_taksi_aktual =
          acc.transport_taksi_aktual +
          (parseFloat(row.transport_taksi_aktual) || 0);

        // Penginapan - Hitung total dari jumlah_malam × perhari
        const penginapan_pagu =
          acc.penginapan_pagu +
          (parseFloat(row.penginapan_jumlah_malam) || 0) *
            (parseFloat(row.penginapan_pagu_perhari) || 0);
        const penginapan_aktual =
          acc.penginapan_aktual +
          (parseFloat(row.penginapan_jumlah_malam) || 0) *
            (parseFloat(row.penginapan_aktual_perhari) || 0);

        // Uang Harian Meeting Fullboard - Hitung total dari jumlah_hari × perhari
        const uang_harian_meeting_fullboard_pagu =
          acc.uang_harian_meeting_fullboard_pagu +
          (parseFloat(row.uang_harian_meeting_fullboard_jumlah_hari) || 0) *
            (parseFloat(row.uang_harian_meeting_fullboard_pagu_perhari) || 0);
        const uang_harian_meeting_fullboard_aktual =
          acc.uang_harian_meeting_fullboard_aktual +
          (parseFloat(row.uang_harian_meeting_fullboard_jumlah_hari) || 0) *
            (parseFloat(row.uang_harian_meeting_fullboard_aktual_perhari) || 0);

        // Uang Harian Meeting Fullday - Hitung total dari jumlah_hari × perhari
        const uang_harian_meeting_fullday_pagu =
          acc.uang_harian_meeting_fullday_pagu +
          (parseFloat(row.uang_harian_meeting_fullday_jumlah_hari) || 0) *
            (parseFloat(row.uang_harian_meeting_fullday_pagu_perhari) || 0);
        const uang_harian_meeting_fullday_aktual =
          acc.uang_harian_meeting_fullday_aktual +
          (parseFloat(row.uang_harian_meeting_fullday_jumlah_hari) || 0) *
            (parseFloat(row.uang_harian_meeting_fullday_aktual_perhari) || 0);

        // Uang Harian Luar Kota - Hitung total dari jumlah_hari × perhari
        const uang_harian_luar_kota_pagu =
          acc.uang_harian_luar_kota_pagu +
          (parseFloat(row.uang_harian_luar_kota_jumlah_hari) || 0) *
            (parseFloat(row.uang_harian_luar_kota_pagu_perhari) || 0);
        const uang_harian_luar_kota_aktual =
          acc.uang_harian_luar_kota_aktual +
          (parseFloat(row.uang_harian_luar_kota_jumlah_hari) || 0) *
            (parseFloat(row.uang_harian_luar_kota_aktual_perhari) || 0);

        // Uang Harian Dalam Kota - Hitung total dari jumlah_hari × perhari
        const uang_harian_dalam_kota_pagu =
          acc.uang_harian_dalam_kota_pagu +
          (parseFloat(row.uang_harian_dalam_kota_jumlah_hari) || 0) *
            (parseFloat(row.uang_harian_dalam_kota_pagu_perhari) || 0);
        const uang_harian_dalam_kota_aktual =
          acc.uang_harian_dalam_kota_aktual +
          (parseFloat(row.uang_harian_dalam_kota_jumlah_hari) || 0) *
            (parseFloat(row.uang_harian_dalam_kota_aktual_perhari) || 0);

        // Representasi Luar Kota - Hitung total dari jumlah_hari × perhari
        const representasi_luar_kota_pagu =
          acc.representasi_luar_kota_pagu +
          (parseFloat(row.representasi_luar_kota_jumlah_hari) || 0) *
            (parseFloat(row.representasi_luar_kota_pagu_perhari) || 0);
        const representasi_luar_kota_aktual =
          acc.representasi_luar_kota_aktual +
          (parseFloat(row.representasi_luar_kota_jumlah_hari) || 0) *
            (parseFloat(row.representasi_luar_kota_aktual_perhari) || 0);

        // Representasi Dalam Kota - Hitung total dari jumlah_hari × perhari
        const representasi_dalam_kota_pagu =
          acc.representasi_dalam_kota_pagu +
          (parseFloat(row.representasi_dalam_kota_jumlah_hari) || 0) *
            (parseFloat(row.representasi_dalam_kota_pagu_perhari) || 0);
        const representasi_dalam_kota_aktual =
          acc.representasi_dalam_kota_aktual +
          (parseFloat(row.representasi_dalam_kota_jumlah_hari) || 0) *
            (parseFloat(row.representasi_dalam_kota_aktual_perhari) || 0);

        // Total keseluruhan
        const total_pagu_row =
          transport_pesawat_non_pp_pagu +
          transport_taksi_pagu +
          penginapan_pagu +
          uang_harian_meeting_fullboard_pagu +
          uang_harian_meeting_fullday_pagu +
          uang_harian_luar_kota_pagu +
          uang_harian_dalam_kota_pagu +
          representasi_luar_kota_pagu +
          representasi_dalam_kota_pagu;
        const total_aktual_row =
          transport_pesawat_non_pp_aktual +
          transport_taksi_aktual +
          penginapan_aktual +
          uang_harian_meeting_fullboard_aktual +
          uang_harian_meeting_fullday_aktual +
          uang_harian_luar_kota_aktual +
          uang_harian_dalam_kota_aktual +
          representasi_luar_kota_aktual +
          representasi_dalam_kota_aktual;

        return {
          transport_pesawat_non_pp_pagu,
          transport_pesawat_non_pp_aktual,
          transport_taksi_pagu,
          transport_taksi_aktual,
          penginapan_pagu,
          penginapan_aktual,
          uang_harian_meeting_fullboard_pagu,
          uang_harian_meeting_fullboard_aktual,
          uang_harian_meeting_fullday_pagu,
          uang_harian_meeting_fullday_aktual,
          uang_harian_luar_kota_pagu,
          uang_harian_luar_kota_aktual,
          uang_harian_dalam_kota_pagu,
          uang_harian_dalam_kota_aktual,
          representasi_luar_kota_pagu,
          representasi_luar_kota_aktual,
          representasi_dalam_kota_pagu,
          representasi_dalam_kota_aktual,
          total_pagu_row,
          total_aktual_row,
          total_pagu: acc.total_pagu + total_pagu_row,
          total_aktual: acc.total_aktual + total_aktual_row,
          total_anggaran_berjalan:
            acc.total_anggaran_berjalan + (total_pagu_row - total_aktual_row),
        };
      },
      {
        transport_pesawat_non_pp_pagu: 0,
        transport_pesawat_non_pp_aktual: 0,
        transport_taksi_pagu: 0,
        transport_taksi_aktual: 0,
        penginapan_pagu: 0,
        penginapan_aktual: 0,
        uang_harian_meeting_fullboard_pagu: 0,
        uang_harian_meeting_fullboard_aktual: 0,
        uang_harian_meeting_fullday_pagu: 0,
        uang_harian_meeting_fullday_aktual: 0,
        uang_harian_luar_kota_pagu: 0,
        uang_harian_luar_kota_aktual: 0,
        uang_harian_dalam_kota_pagu: 0,
        uang_harian_dalam_kota_aktual: 0,
        representasi_luar_kota_pagu: 0,
        representasi_luar_kota_aktual: 0,
        representasi_dalam_kota_pagu: 0,
        representasi_dalam_kota_aktual: 0,
        total_pagu_row: 0,
        total_aktual_row: 0,
        total_pagu: 0,
        total_aktual: 0,
        total_anggaran_berjalan: 0,
      }
    );
  }, [rows]);

  // Save draft with auto-redirect
  const saveDraft = async () => {
    // Validate required fields before saving
    if (!validateRows()) {
      // If validation fails, show alert and stop saving
      const errorCount = Object.keys(validationErrors).length;
      const errorMessages = Object.values(validationErrors).flat().join("\n");
      alert(`Mohon lengkapi field yang wajib diisi:\n\n${errorMessages}`);
      return;
    }

    setSaving(true);
    try {
      if (onSave) {
        await onSave(rows);
        // Auto-redirect setelah save berhasil - conditional based on mode
        console.log("📝 Draft saved successfully");
        console.log("🔍 Checking current pathname:", window.location.pathname);

        // Check if we're in edit mode (single nominatif page) vs create mode
        const currentPath = window.location.pathname;
        const hasIdParameter = window.location.search.includes('id=');

        console.log("🔍 URL Analysis:", {
          pathname: currentPath,
          search: window.location.search,
          hasIdParameter: hasIdParameter
        });

        // EDIT MODE = ada ID parameter di URL
        // CREATE MODE = tidak ada ID parameter
        const isCreateMode = !hasIdParameter;

        // MATIKAN SEMUA REDIRECT UNTUK TESTING DATABASE UPDATE
        console.log("📝 Current Path:", currentPath);
        console.log("📝 Is Create Mode:", isCreateMode);

        console.log("🚫 ALL REDIRECTS DISABLED - Testing Database Update");

        // TIDAK REDIRECT DIMANAPUN MODE (CREATE/EDIT)
        if (false) { // DISABLED - ganti true untuk enable redirect
          if (isCreateMode) {
            console.log("🔄 Create mode detected, redirecting...");
            setTimeout(() => {
              window.location.href = "/nominatif"; // Redirect ke halaman awal nominatif
            }, 1000);
          } else {
            console.log("📝 Edit mode detected, staying on current page");
          }
        }
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setSaving(false);
    }
  };

  // Submit with auto-redirect
  const submitNominatif = async () => {
    // Validate required fields before submitting
    if (!validateRows()) {
      // If validation fails, show alert and stop submission
      const errorCount = Object.keys(validationErrors).length;
      const errorMessages = Object.values(validationErrors).flat().join("\n");
      alert(`Mohon lengkapi field yang wajib diisi:\n\n${errorMessages}`);
      return;
    }

    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(rows);
        // Auto-redirect setelah submit berhasil
        console.log("🎯 Nominatif submitted successfully, redirecting...");
        setTimeout(() => {
          window.location.href = "/nominatif"; // Redirect ke halaman awal nominatif
        }, 1000); // 1 detik delay untuk user melihat feedback
      }
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Inject CSS to remove arrow buttons from currency inputs
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg">
      {/* Mobile/Tablet Info */}
      <div className="md:hidden lg:hidden bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 text-blue-800">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium">
            Table best viewed on desktop. Swipe horizontally to view all
            columns.
          </p>
        </div>
      </div>
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => addRow()}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Tambah Row</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={saveDraft}
            disabled={loading || saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Menyimpan..." : "Simpan Draft"}</span>
          </button>
          <button
            onClick={submitNominatif}
            disabled={loading || submitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{submitting ? "Mengirim..." : "Submit"}</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-gray-200 rounded-lg overflow-x-auto overflow-y-visible max-h-[80vh]">
        <table className="w-full min-w-[9216px]" ref={tableRef}>
          {/* Header */}
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            {/* Main Categories Row */}
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50">
                Aksi
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56 bg-gray-50">
                Nama Lengkap
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56 bg-gray-50">
                Golongan
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56 bg-gray-50">
                Jabatan
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56 bg-gray-50">
                Eselon
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56 bg-gray-50">
                Asal
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56 bg-gray-50">
                Tujuan
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-32 bg-gray-50">
                Tgl Pergi
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-32 bg-gray-50">
                Tgl Sampai
              </th>
              <th
                className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50"
                colSpan="6"
              >
                Transportasi
              </th>
              <th
                className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50"
                colSpan="4"
              >
                Penginapan
              </th>
              <th
                className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50"
                colSpan="8"
              >
                Uang Harian Meeting
              </th>
              <th
                className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50"
                colSpan="8"
              >
                Uang Harian
              </th>
              <th
                className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50"
                colSpan="8"
              >
                Uang Representasi
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                colSpan="5"
              >
                Evidence
              </th>
            </tr>
            {/* Subcategories Row */}
            <tr className="bg-gray-100 border-b border-gray-300">
              <td
                colSpan="10"
                className="px-4 py-2 border-r border-gray-200"
              ></td>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Pagu Tiket Pesawat NON PP
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Aktual Tiket Pesawat NON PP
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Total
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Pagu Taksi
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Aktual Taksi
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Total
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Jumlah Malam
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Pagu/Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Aktual/Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Total
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Jumlah Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Pagu/Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Aktual/Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Total
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Jumlah Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Pagu/Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Aktual/Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Total
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Jumlah Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Pagu/Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Aktual/Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Total
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Jumlah Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Pagu/Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Aktual/Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Total
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Jumlah Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Pagu/Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Aktual/Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Total
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Jumlah Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Pagu/Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Aktual/Hari
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Total
              </th>
              <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                Eviden
              </th>
            </tr>
            {/* Meeting Types Row */}
            <tr className="bg-gray-100 border-b border-gray-300">
              <td
                colSpan="10"
                className="px-4 py-2 border-r border-gray-200"
              ></td>
              <th
                className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                colSpan="6"
              ></th>
              <th
                className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                colSpan="4"
              ></th>
              <th
                className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                colSpan="4"
              >
                Meeting Fullboard
              </th>
              <th
                className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                colSpan="4"
              >
                Meeting Fullday
              </th>
              <th
                className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                colSpan="4"
              >
                Luar Kota
              </th>
              <th
                className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                colSpan="4"
              >
                Dalam Kota
              </th>
              <th
                className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                colSpan="4"
              >
                Representasi Luar Kota
              </th>
              <th
                className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                colSpan="4"
              >
                Representasi Dalam Kota
              </th>
              <th className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200 bg-purple-100">
                EVIDENCE
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Hapus Baris"
                      disabled={rows.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-56">
                  <input
                    type="text"
                    value={row.nama_lengkap || ""}
                    onChange={(e) =>
                      updateRow(row.id, "nama_lengkap", e.target.value)
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Nama lengkap"
                  />
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-56">
                  <div className="relative">
                    <select
                      value={row.golongan || ""}
                      onChange={(e) =>
                        updateRow(row.id, "golongan", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:border-gray-500 bg-white ${
                        validationErrors[index]?.golongan
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-gray-500"
                      }`}
                    >
                      <option value="">Pilih Golongan</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                      <option value="Non Golongan">Non Golongan</option>
                    </select>
                    {validationErrors[index]?.golongan && (
                      <div className="absolute mt-1 text-xs text-red-600 whitespace-nowrap">
                        {validationErrors[index].golongan}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-56">
                  <input
                    type="text"
                    value={row.jabatan || ""}
                    onChange={(e) =>
                      updateRow(row.id, "jabatan", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Jabatan"
                  />
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-56">
                  <div className="relative">
                    <select
                      value={row.eselon || ""}
                      onChange={(e) =>
                        updateRow(row.id, "eselon", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:border-gray-500 bg-white ${
                        validationErrors[index]?.eselon
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-gray-500"
                      }`}
                    >
                      <option value="">Pilih Eselon</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                      <option value="Non Eselon">Non Eselon</option>
                    </select>
                    {validationErrors[index]?.eselon && (
                      <div className="absolute mt-1 text-xs text-red-600 whitespace-nowrap">
                        {validationErrors[index].eselon}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-56">
                  <input
                    type="text"
                    value={row.asal || ""}
                    onChange={(e) => updateRow(row.id, "asal", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Asal"
                  />
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-56">
                  <input
                    type="text"
                    value={row.tujuan || ""}
                    onChange={(e) =>
                      updateRow(row.id, "tujuan", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Tujuan"
                  />
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-32">
                  <input
                    type="date"
                    value={row.tanggal_pergi || ""}
                    onChange={(e) =>
                      updateRow(row.id, "tanggal_pergi", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                  />
                </td>
                <td className="px-4 py-3 border-r border-gray-200 w-32">
                  <input
                    type="date"
                    value={row.tanggal_sampai || ""}
                    onChange={(e) =>
                      updateRow(row.id, "tanggal_sampai", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                  />
                </td>

                {/* Transportasi - Pesawat Non-PP */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.transport_pesawat_non_pp_pagu
                        ? `Rp ${
                            parseFloat(
                              row.transport_pesawat_non_pp_pagu || 0
                            ).toLocaleString("id-ID") || ""
                          }`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "transport_pesawat_non_pp_pagu",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.transport_pesawat_non_pp_aktual
                        ? `Rp ${
                            parseFloat(
                              row.transport_pesawat_non_pp_aktual || 0
                            ).toLocaleString("id-ID") || ""
                          }`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "transport_pesawat_non_pp_aktual",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    Rp{" "}
                    {(
                      (parseFloat(row.transport_pesawat_non_pp_pagu) || 0) -
                      (parseFloat(row.transport_pesawat_non_pp_aktual) || 0)
                    ).toLocaleString("id-ID")}
                  </div>
                </td>

                {/* Transportasi - Taksi */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.transport_taksi_pagu
                        ? `Rp ${
                            parseFloat(
                              row.transport_taksi_pagu || 0
                            ).toLocaleString("id-ID") || ""
                          }`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "transport_taksi_pagu",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.transport_taksi_aktual
                        ? `Rp ${
                            parseFloat(
                              row.transport_taksi_aktual || 0
                            ).toLocaleString("id-ID") || ""
                          }`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "transport_taksi_aktual",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    Rp{" "}
                    {(
                      (parseFloat(row.transport_taksi_pagu) || 0) -
                      (parseFloat(row.transport_taksi_aktual) || 0)
                    ).toLocaleString("id-ID")}
                  </div>
                </td>

                {/* Penginapan */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    min="0"
                    value={row.penginapan_jumlah_malam || ""}
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "penginapan_jumlah_malam",
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.penginapan_pagu_perhari
                        ? `Rp ${parseFloat(
                            row.penginapan_pagu_perhari || 0
                          ).toLocaleString("id-ID")}`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "penginapan_pagu_perhari",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.penginapan_aktual_perhari
                        ? `Rp ${parseFloat(
                            row.penginapan_aktual_perhari || 0
                          ).toLocaleString("id-ID")}`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "penginapan_aktual_perhari",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    Rp{" "}
                    {(
                      (parseFloat(row.penginapan_jumlah_malam) || 0) *
                        (parseFloat(row.penginapan_pagu_perhari) || 0) -
                      (parseFloat(row.penginapan_jumlah_malam) || 0) *
                        (parseFloat(row.penginapan_aktual_perhari) || 0)
                    ).toLocaleString("id-ID")}
                  </div>
                </td>

                {/* Uang Harian Fullboard */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    min="0"
                    value={row.uang_harian_meeting_fullboard_jumlah_hari || ""}
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "uang_harian_meeting_fullboard_jumlah_hari",
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.uang_harian_meeting_fullboard_pagu_perhari
                        ? `Rp ${parseFloat(
                            row.uang_harian_meeting_fullboard_pagu_perhari || 0
                          ).toLocaleString("id-ID")}`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "uang_harian_meeting_fullboard_pagu_perhari",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.uang_harian_meeting_fullboard_aktual_perhari
                        ? `Rp ${parseFloat(
                            row.uang_harian_meeting_fullboard_aktual_perhari ||
                              0
                          ).toLocaleString("id-ID")}`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "uang_harian_meeting_fullboard_aktual_perhari",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    Rp{" "}
                    {(
                      (parseFloat(
                        row.uang_harian_meeting_fullboard_jumlah_hari
                      ) || 0) *
                        (parseFloat(
                          row.uang_harian_meeting_fullboard_pagu_perhari
                        ) || 0) -
                      (parseFloat(
                        row.uang_harian_meeting_fullboard_jumlah_hari
                      ) || 0) *
                        (parseFloat(
                          row.uang_harian_meeting_fullboard_aktual_perhari
                        ) || 0)
                    ).toLocaleString("id-ID")}
                  </div>
                </td>

                {/* Uang Harian Meeting Fullday */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    min="0"
                    value={row.uang_harian_meeting_fullday_jumlah_hari || ""}
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "uang_harian_meeting_fullday_jumlah_hari",
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.uang_harian_meeting_fullday_pagu_perhari
                        ? `Rp ${parseFloat(
                            row.uang_harian_meeting_fullday_pagu_perhari || 0
                          ).toLocaleString("id-ID")}`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "uang_harian_meeting_fullday_pagu_perhari",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.uang_harian_meeting_fullday_aktual_perhari
                        ? `Rp ${parseFloat(
                            row.uang_harian_meeting_fullday_aktual_perhari || 0
                          ).toLocaleString("id-ID")}`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "uang_harian_meeting_fullday_aktual_perhari",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    Rp{" "}
                    {(
                      (parseFloat(
                        row.uang_harian_meeting_fullday_jumlah_hari
                      ) || 0) *
                        (parseFloat(
                          row.uang_harian_meeting_fullday_pagu_perhari
                        ) || 0) -
                      (parseFloat(
                        row.uang_harian_meeting_fullday_jumlah_hari
                      ) || 0) *
                        (parseFloat(
                          row.uang_harian_meeting_fullday_aktual_perhari
                        ) || 0)
                    ).toLocaleString("id-ID")}
                  </div>
                </td>

                {/* Uang Harian Luar Kota */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    min="0"
                    value={row.uang_harian_luar_kota_jumlah_hari || ""}
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "uang_harian_luar_kota_jumlah_hari",
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.uang_harian_luar_kota_pagu_perhari
                        ? `Rp ${parseFloat(
                            row.uang_harian_luar_kota_pagu_perhari || 0
                          ).toLocaleString("id-ID")}`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "uang_harian_luar_kota_pagu_perhari",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.uang_harian_luar_kota_aktual_perhari
                        ? `Rp ${parseFloat(
                            row.uang_harian_luar_kota_aktual_perhari || 0
                          ).toLocaleString("id-ID")}`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "uang_harian_luar_kota_aktual_perhari",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    Rp{" "}
                    {(
                      (parseFloat(row.uang_harian_luar_kota_jumlah_hari) || 0) *
                        (parseFloat(row.uang_harian_luar_kota_pagu_perhari) ||
                          0) -
                      (parseFloat(row.uang_harian_luar_kota_jumlah_hari) || 0) *
                        (parseFloat(row.uang_harian_luar_kota_aktual_perhari) ||
                          0)
                    ).toLocaleString("id-ID")}
                  </div>
                </td>

                {/* Uang Harian Dalam Kota */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    min="0"
                    value={row.uang_harian_dalam_kota_jumlah_hari || ""}
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "uang_harian_dalam_kota_jumlah_hari",
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.uang_harian_dalam_kota_pagu_perhari
                        ? `Rp ${parseFloat(
                            row.uang_harian_dalam_kota_pagu_perhari || 0
                          ).toLocaleString("id-ID")}`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "uang_harian_dalam_kota_pagu_perhari",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.uang_harian_dalam_kota_aktual_perhari
                        ? `Rp ${parseFloat(
                            row.uang_harian_dalam_kota_aktual_perhari || 0
                          ).toLocaleString("id-ID")}`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "uang_harian_dalam_kota_aktual_perhari",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    Rp{" "}
                    {(
                      (parseFloat(row.uang_harian_dalam_kota_jumlah_hari) ||
                        0) *
                        (parseFloat(row.uang_harian_dalam_kota_pagu_perhari) ||
                          0) -
                      (parseFloat(row.uang_harian_dalam_kota_jumlah_hari) ||
                        0) *
                        (parseFloat(
                          row.uang_harian_dalam_kota_aktual_perhari
                        ) || 0)
                    ).toLocaleString("id-ID")}
                  </div>
                </td>

                {/* Representasi Luar Kota */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    min="0"
                    value={row.representasi_luar_kota_jumlah_hari || ""}
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "representasi_luar_kota_jumlah_hari",
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.representasi_luar_kota_pagu_perhari
                        ? `Rp ${parseFloat(
                            row.representasi_luar_kota_pagu_perhari || 0
                          ).toLocaleString("id-ID")}`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "representasi_luar_kota_pagu_perhari",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.representasi_luar_kota_aktual_perhari
                        ? `Rp ${parseFloat(
                            row.representasi_luar_kota_aktual_perhari || 0
                          ).toLocaleString("id-ID")}`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "representasi_luar_kota_aktual_perhari",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    Rp{" "}
                    {(
                      (parseFloat(row.representasi_luar_kota_jumlah_hari) ||
                        0) *
                        (parseFloat(row.representasi_luar_kota_pagu_perhari) ||
                          0) -
                      (parseFloat(row.representasi_luar_kota_jumlah_hari) ||
                        0) *
                        (parseFloat(
                          row.representasi_luar_kota_aktual_perhari
                        ) || 0)
                    ).toLocaleString("id-ID")}
                  </div>
                </td>

                {/* Representasi Dalam Kota */}
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="number"
                    min="0"
                    value={row.representasi_dalam_kota_jumlah_hari || ""}
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "representasi_dalam_kota_jumlah_hari",
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.representasi_dalam_kota_pagu_perhari
                        ? `Rp ${parseFloat(
                            row.representasi_dalam_kota_pagu_perhari || 0
                          ).toLocaleString("id-ID")}`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "representasi_dalam_kota_pagu_perhari",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                  <input
                    type="text"
                    value={
                      row.representasi_dalam_kota_aktual_perhari
                        ? `Rp ${parseFloat(
                            row.representasi_dalam_kota_aktual_perhari || 0
                          ).toLocaleString("id-ID")}`
                        : ""
                    }
                    onChange={(e) =>
                      updateRow(
                        row.id,
                        "representasi_dalam_kota_aktual_perhari",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-right"
                    placeholder="Rp 0"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right border-r border-gray-200 bg-gray-50">
                  <div className="text-right font-medium text-gray-700">
                    Rp{" "}
                    {(
                      (parseFloat(row.representasi_dalam_kota_jumlah_hari) ||
                        0) *
                        (parseFloat(row.representasi_dalam_kota_pagu_perhari) ||
                          0) -
                      (parseFloat(row.representasi_dalam_kota_jumlah_hari) ||
                        0) *
                        (parseFloat(
                          row.representasi_dalam_kota_aktual_perhari
                        ) || 0)
                    ).toLocaleString("id-ID")}
                  </div>
                </td>

                {/* Evidence Column - Add background color for consistency */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200 bg-purple-50">
                  {/* Simple Evidence Display */}
                  <div className="w-full max-w-52">
                    <div className="mb-1">
                      {/* Upload Button */}
                      <label className="cursor-pointer">
                        <input
                          key={`file-input-${row.id}-${
                            row.evidence_files?.length || 0
                          }`}
                          type="file"
                          onChange={(e) =>
                            handleFileUpload(row.id, e.target.files[0])
                          }
                          className="hidden"
                          accept="image/*"
                          disabled={row.evidence_uploading}
                        />
                        <div
                          className={`w-full px-2 py-1 border-2 border-dashed rounded-md flex items-center justify-center transition-colors text-xs ${
                            row.evidence_uploading
                              ? "border-gray-400 bg-gray-100 cursor-not-allowed"
                              : "border-purple-300 hover:border-purple-500"
                          }`}
                        >
                          {row.evidence_uploading ? (
                            <RefreshCw className="w-4 h-4 text-gray-500 animate-spin mr-1" />
                          ) : (
                            <Upload className="w-4 h-4 text-purple-500 mr-1" />
                          )}
                          <span className="text-gray-600">
                            {row.evidence_uploading
                              ? "Uploading..."
                              : "Upload Evidence"}
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Multiple Files List */}
                    {row.evidence_files && row.evidence_files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-gray-600 font-medium mb-1">
                          📎 Evidence Files ({row.evidence_files.length})
                        </div>
                        {row.evidence_files.map((file, index) => (
                          <div
                            key={file.id}
                            className="bg-white border border-gray-200 rounded p-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex-1 min-w-0">
                                <div
                                  className="truncate text-gray-700 font-medium"
                                  title={file.filename}
                                >
                                  📄 {file.filename}
                                </div>
                                <div className="text-gray-500">
                                  📏 {file.filesize}
                                </div>
                              </div>
                              <div className="flex space-x-1 ml-2">
                                <button
                                  className="text-blue-500 hover:text-blue-700 p-1"
                                  title="View file"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (file.url) {
                                      window.open(file.url, "_blank");
                                    }
                                  }}
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Remove file"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(
                                      "🗑️ Removing specific evidence file:",
                                      file.id
                                    );

                                    // Remove specific file from array
                                    setRows((prevRows) =>
                                      prevRows.map((r) =>
                                        r.id === row.id
                                          ? {
                                              ...r,
                                              evidence_files:
                                                r.evidence_files.filter(
                                                  (f) => f.id !== file.id
                                                ),
                                            }
                                          : r
                                      )
                                    );

                                    console.log(
                                      "✅ Evidence file removed:",
                                      file.id
                                    );
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {row.evidence_uploaded && (
                      <div className="mt-1 text-xs text-green-600 font-medium">
                        ✅ File uploaded!
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Belum ada data. Klik "Tambah Baris" untuk menambahkan data.</p>
        </div>
      )}

      {/* Summary Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total Baris:</span> {rows.length}
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-gray-600">
              <span className="font-medium">Total Pagu:</span>
              <span className="ml-2 font-semibold text-blue-600">
                Rp {totals.total_pagu.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Total Aktual:</span>
              <span className="ml-2 font-semibold text-green-600">
                Rp {totals.total_aktual.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NominatifExcelTable;
