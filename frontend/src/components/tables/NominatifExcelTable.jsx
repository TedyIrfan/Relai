import React, { useState, useRef, forwardRef } from "react";
import { Plus, Trash2, Save, Send, CheckCircle, Search } from "lucide-react";
import SBMReferensiModal from "../modals/SBMReferensiModal";

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

const NominatifExcelTable = forwardRef(
  ({ rkaDetail, initialData = [], onSave, onSubmit }, ref) => {
    const processedInitialData = initialData;

    // Removed excessive logging to prevent console spam

    const [rows, setRows] = useState(processedInitialData);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [deletedRows, setDeletedRows] = useState([]); // Track rows to delete on save
    const [originalRows, setOriginalRows] = useState([]); // Track original data from database
    const [searchModal, setSearchModal] = useState({
      isOpen: false,
      rowIndex: null,
      fieldName: null,
      fieldLabel: null,
    });
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
    }, []); // Remove dependency to prevent infinite loop

    // Initial validation for required fields (show errors immediately when fields are empty)
    React.useEffect(() => {
      const initialErrors = {};
      rows.forEach((row, index) => {
        const rowErrors = {};
        if (!row.nama_lengkap || row.nama_lengkap.trim() === "") {
          rowErrors.nama_lengkap = "Nama Lengkap harus diisi";
        }
        if (!row.golongan || row.golongan.trim() === "") {
          rowErrors.golongan = "Golongan harus diisi";
        }
        if (!row.jabatan || row.jabatan.trim() === "") {
          rowErrors.jabatan = "Jabatan harus diisi";
        }
        if (!row.eselon || row.eselon.trim() === "") {
          rowErrors.eselon = "Eselon harus diisi";
        }
        if (!row.asal || row.asal.trim() === "") {
          rowErrors.asal = "Asal harus diisi";
        }
        if (!row.tujuan || row.tujuan.trim() === "") {
          rowErrors.tujuan = "Tujuan harus diisi";
        }
        if (!row.tanggal_pergi || row.tanggal_pergi.trim() === "") {
          rowErrors.tanggal_pergi = "Tanggal Pergi harus diisi";
        }
        if (!row.tanggal_sampai || row.tanggal_sampai.trim() === "") {
          rowErrors.tanggal_sampai = "Tanggal Sampai harus diisi";
        }
        if (Object.keys(rowErrors).length > 0) {
          initialErrors[index] = rowErrors;
        }
      });
      // Only update if errors actually changed to prevent infinite loop
      setValidationErrors((prev) => {
        const prevStr = JSON.stringify(prev);
        const newStr = JSON.stringify(initialErrors);
        if (prevStr !== newStr) {
          return initialErrors;
        }
        return prev;
      });
    }, [rows.length]); // Back to length dependency to prevent infinite loop

    // Update rows when initialData changes (for edit mode)
    React.useEffect(() => {
      if (processedInitialData.length > 0) {
        console.log("🔄 ProcessedInitialData changed, preserving evidence...");
        console.log(
          "🔍 DEBUG - First row evidence data:",
          processedInitialData[0]
        );

        // Store original data from database
        setOriginalRows(JSON.parse(JSON.stringify(processedInitialData)));

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
                hasEvidenceFiles: !!mergedRow.evidence_files,
                firstEvidence:
                  mergedRow.evidence_files?.[0]?.evidence_link || "NO EVIDENCE",
              });
              return mergedRow;
            }
            console.log("🔄 New row created:", initialRow.id, {
              hasEvidenceFiles: !!initialRow.evidence_files,
              evidenceCount: initialRow.evidence_files?.length || 0,
              firstEvidence:
                initialRow.evidence_files?.[0]?.evidence_link || "NO EVIDENCE",
            });
            return initialRow;
          });
          return newRows;
        });

        // Reset deletedRows when data changes
        setDeletedRows([]);
      }
    }, [processedInitialData]);

    // Validation function for required fields
    const validateRows = () => {
      const errors = {};

      rows.forEach((row, index) => {
        const rowErrors = {};

        // Validate Nama Lengkap - required field
        if (!row.nama_lengkap || row.nama_lengkap.trim() === "") {
          rowErrors.nama_lengkap = "Nama Lengkap harus diisi";
        }

        // Validate Golongan - required field
        if (!row.golongan || row.golongan.trim() === "") {
          rowErrors.golongan = "Golongan harus diisi";
        }

        // Validate Jabatan - required field
        if (!row.jabatan || row.jabatan.trim() === "") {
          rowErrors.jabatan = "Jabatan harus diisi";
        }

        // Validate Eselon - required field
        if (!row.eselon || row.eselon.trim() === "") {
          rowErrors.eselon = "Eselon harus diisi";
        }

        // Validate Asal - required field
        if (!row.asal || row.asal.trim() === "") {
          rowErrors.asal = "Asal harus diisi";
        }

        // Validate Tujuan - required field
        if (!row.tujuan || row.tujuan.trim() === "") {
          rowErrors.tujuan = "Tujuan harus diisi";
        }

        // Validate Tgl Pergi - required field
        if (!row.tanggal_pergi || row.tanggal_pergi.trim() === "") {
          rowErrors.tanggal_pergi = "Tanggal Pergi harus diisi";
        }

        // Validate Tgl Sampai - required field
        if (!row.tanggal_sampai || row.tanggal_sampai.trim() === "") {
          rowErrors.tanggal_sampai = "Tanggal Sampai harus diisi";
        }

        // Only add errors object if there are actual errors
        if (Object.keys(rowErrors).length > 0) {
          errors[index] = rowErrors;
        }
      });

      setValidationErrors(errors);
      return Object.keys(errors).length === 0; // Return true if no errors
    };

    // Add new row - always create empty row (fix edit mode bug)
    const addRow = () => {
      console.log("➕ Adding new empty row - all fields should be blank");

      const newRow = {
        id: "temp_" + Date.now(),
        // All fields should be empty for new rows (both create and edit mode)
        nama_lengkap: "",
        golongan: "",
        jabatan: "",
        eselon: "",
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

      // Real-time validation for required fields
      const requiredFields = [
        "nama_lengkap",
        "golongan",
        "jabatan",
        "eselon",
        "asal",
        "tujuan",
        "tanggal_pergi",
        "tanggal_sampai"
      ];

      if (requiredFields.includes(field)) {
        const rowIndex = rows.findIndex((row) => row.id === id);
        if (rowIndex !== -1) {
          setValidationErrors((prev) => {
            const newErrors = { ...prev };
            if (!value || value.trim() === "") {
              const fieldLabels = {
                nama_lengkap: "Nama Lengkap",
                golongan: "Golongan",
                jabatan: "Jabatan",
                eselon: "Eselon",
                asal: "Asal",
                tujuan: "Tujuan",
                tanggal_pergi: "Tanggal Pergi",
                tanggal_sampai: "Tanggal Sampai"
              };
              newErrors[rowIndex] = {
                ...newErrors[rowIndex],
                [field]: `${fieldLabels[field]} harus diisi`,
              };
            } else {
              // Remove error if field is filled
              if (newErrors[rowIndex]) {
                const { [field]: removed, ...rest } = newErrors[rowIndex];
                newErrors[rowIndex] =
                  Object.keys(rest).length > 0 ? rest : undefined;
              }
            }
            return newErrors;
          });
        }
      }

      // Debug: Show current state before update
      if (field.startsWith("evidence_")) {
        console.log(
          "🔍 Before evidence update - current row state:",
          rows.find((r) => r.id === id)
        );
      }

      const updatedRows = rows.map((row) => {
        if (row.id === id) {
          if (field === "evidence_link") {
            // Handle evidence_link field specially
            const evidenceFiles = value
              ? [
                  {
                    id: Date.now(),
                    evidence_link: value,
                    evidence_name:
                      value.split("/").pop() || "Link Google Drive",
                    keterangan: "",
                  },
                ]
              : [];

            console.log("🔧 Updating evidence_link field:", {
              id,
              newLink: value,
              evidenceFiles,
            });

            return { ...row, evidence_files: evidenceFiles };
          } else {
            // Always update the target row for other fields
            return { ...row, [field]: value };
          }
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

    // Handler functions for SBM Reference Modal
    const openSearchModal = (rowId, fieldName, fieldLabel) => {
      setSearchModal({
        isOpen: true,
        rowIndex: rowId,
        fieldName: fieldName,
        fieldLabel: fieldLabel,
      });
    };

    const closeSearchModal = () => {
      setSearchModal((prev) => ({ ...prev, isOpen: false }));
    };

    // Delete row - optimistic delete (frontend only, database update on save)
    const deleteRow = (id) => {
      if (rows.length <= 1) {
        alert("Minimal harus ada satu baris");
        return;
      }

      // Find the row to be deleted
      const rowToDelete = rows.find((row) => row.id === id);

      if (rowToDelete) {
        // 🔥 DEBUG: Log exact row data being deleted
        console.log("🎯 DELETE TARGET:", {
          clickedId: id,
          rowToDeleteData: rowToDelete,
          namaLengkap: rowToDelete.nama_lengkap,
          allRows: rows.map((r) => ({ id: r.id, nama: r.nama_lengkap })),
        });

        // Check if this is a database row (has numeric ID from database, not temp_id)
        const isDatabaseRow = !isNaN(id) && !id.toString().startsWith("temp_");

        if (isDatabaseRow) {
          // Mark database row for deletion on save
          setDeletedRows((prev) => [...prev, id]);
          console.log(
            `🔄 Row ${id} (${rowToDelete.nama_lengkap}) marked for deletion on save`
          );
        } else {
          // This is a new row, just remove from local state
          console.log(
            `🔄 New row ${id} (${rowToDelete.nama_lengkap}) removed from frontend`
          );
        }

        // Remove from frontend state immediately (optimistic delete)
        setRows(rows.filter((row) => row.id !== id));

        // Clear validation errors for deleted row
        const rowIndex = rows.findIndex((row) => row.id === id);
        if (rowIndex !== -1 && validationErrors[rowIndex]) {
          const newErrors = { ...validationErrors };
          delete newErrors[rowIndex];
          // Reindex remaining errors
          const reindexedErrors = {};
          Object.keys(newErrors).forEach((key) => {
            const newKey = parseInt(key) > rowIndex ? parseInt(key) - 1 : key;
            reindexedErrors[newKey] = newErrors[key];
          });
          setValidationErrors(reindexedErrors);
        }
      }
    };

    // Handle auto evidence input (on paste)
    const handleAutoEvidenceInput = (rowId, link) => {
      console.log("🔄 Auto evidence input (paste detected):", {
        rowId,
        link: link,
      });

      if (link && isGoogleDriveLink(link)) {
        const fileId = Date.now() + Math.random();
        const autoName = generateAutoName(link);

        const newEvidence = {
          id: fileId,
          evidence_link: link,
          evidence_name: autoName,
          keterangan: "",
          preview_url: generatePreviewUrl(link),
          thumbnail_url: generateThumbnailUrl(link),
          document_type: getDocumentType(link),
          is_google_drive: true,
        };

        console.log("📤 Auto-adding evidence from paste:", {
          rowId,
          fileId,
          autoName,
          documentType: newEvidence.document_type,
        });

        // Add new evidence to array immediately
        setRows((prevRows) =>
          prevRows.map((row) => {
            if (row.id === rowId) {
              const updatedEvidence = [
                ...(row.evidence_files || []),
                newEvidence,
              ];
              return {
                ...row,
                evidence_files: updatedEvidence,
                evidence_uploaded: true, // Show success indicator
              };
            }
            return row;
          })
        );

        // Clear success indicator after 2 seconds
        setTimeout(() => {
          setRows((prevRows) =>
            prevRows.map((row) =>
              row.id === rowId ? { ...row, evidence_uploaded: false } : row
            )
          );
        }, 2000);

        return true; // Success
      } else if (link) {
        console.log("⚠️ Not a Google Drive link, ignoring:", link);
        return false;
      }
      return false;
    };

    // Add evidence manually (if needed)
    const handleAddEvidence = (rowId, link) => {
      if (link) {
        handleAutoEvidenceInput(rowId, link);
      }
    };

    // Toggle evidence edit mode
    const toggleEditMode = (rowId, evidenceId) => {
      setRows((prevRows) =>
        prevRows.map((row) => {
          if (row.id === rowId) {
            const updatedEvidence = (row.evidence_files || []).map((evidence) =>
              evidence.id === evidenceId
                ? { ...evidence, isEditing: true }
                : evidence
            );
            return { ...row, evidence_files: updatedEvidence };
          }
          return row;
        })
      );
    };

    // Cancel evidence edit mode
    const cancelEdit = (rowId, evidenceId) => {
      setRows((prevRows) =>
        prevRows.map((row) => {
          if (row.id === rowId) {
            const updatedEvidence = (row.evidence_files || []).map((evidence) =>
              evidence.id === evidenceId
                ? { ...evidence, isEditing: false }
                : evidence
            );
            return { ...row, evidence_files: updatedEvidence };
          }
          return row;
        })
      );
    };

    // Update evidence link
    const updateEvidenceLink = (rowId, evidenceId, newLink) => {
      setRows((prevRows) =>
        prevRows.map((row) => {
          if (row.id === rowId) {
            const updatedEvidence = (row.evidence_files || []).map((evidence) =>
              evidence.id === evidenceId
                ? {
                    ...evidence,
                    evidence_link: newLink,
                    preview_url: generatePreviewUrl(newLink),
                    thumbnail_url: generateThumbnailUrl(newLink),
                    document_type: getDocumentType(newLink),
                    is_google_drive: isGoogleDriveLink(newLink),
                    evidence_name: generateAutoName(newLink),
                  }
                : evidence
            );
            return { ...row, evidence_files: updatedEvidence };
          }
          return row;
        })
      );
    };

    // Auto-generate evidence name from URL
    const generateAutoName = (link) => {
      const docType = getDocumentType(link);
      const timestamp = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${docType} - ${timestamp}`;
    };

    // Helper functions for Google Drive links
    const generatePreviewUrl = (link) => {
      if (isGoogleDriveLink(link)) {
        const match = link.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
          return `https://drive.google.com/file/d/${match[1]}/preview`;
        }
      }
      return link;
    };

    const generateThumbnailUrl = (link) => {
      if (isGoogleDriveLink(link)) {
        const match = link.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
          return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200`;
        }
      }
      return null;
    };

    const getDocumentType = (link) => {
      if (link.includes("docs.google.com")) {
        if (link.includes("/document/")) return "Google Docs";
        if (link.includes("/spreadsheets/")) return "Google Sheets";
        if (link.includes("/presentation/")) return "Google Slides";
        if (link.includes("/forms/")) return "Google Forms";
      }
      if (link.includes("drive.google.com")) return "Google Drive File";
      return "Web Link";
    };

    const isGoogleDriveLink = (link) => {
      return (
        link.includes("drive.google.com") || link.includes("docs.google.com")
      );
    };

    // Collect evidence from input fields
    const collectEvidenceFromInputs = () => {
      console.log("🔍 COLLECT EVIDENCE - Starting collection...");
      console.log("📊 Total rows:", rows.length);

      const result = rows.map((row) => {
        const inputElement = document.getElementById(
          `evidence-input-${row.id}`
        );
        const evidenceLink = inputElement ? inputElement.value.trim() : "";

        console.log(`🔍 Row ${row.id} - Evidence input found:`, !!inputElement);
        console.log(`🔍 Row ${row.id} - Evidence link value:`, evidenceLink);

        if (evidenceLink) {
          console.log(`✅ Row ${row.id} - Adding evidence:`, evidenceLink);
          return {
            ...row,
            evidence_files: [
              {
                id: 1,
                evidence_link: evidenceLink,
                evidence_name:
                  evidenceLink.split("/").pop() || "Link Google Drive",
                keterangan: "",
              },
            ],
          };
        } else {
          console.log(`❌ Row ${row.id} - No evidence found`);
          return {
            ...row,
            evidence_files: [],
          };
        }
      });

      console.log("🎯 FINAL EVIDENCE RESULT:", result);
      return result;
    };

    // Expose function to parent
    React.useImperativeHandle(ref, () => ({
      collectEvidenceFromInputs,
      getDeletedRows: () => deletedRows, // 🔥 EXPOSE deletedRows to parent
    }));

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
              (parseFloat(row.uang_harian_meeting_fullboard_aktual_perhari) ||
                0);

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
            total_pagu: total_pagu_row,
            total_aktual: total_aktual_row,
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

    // Process rows marked for deletion
    const processDeletedRows = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token || localStorage.getItem("token");

      const urlParams = new URLSearchParams(window.location.search);
      const nominatifId = urlParams.get("id") || rkaDetail?.nominatifId;

      if (!nominatifId) {
        console.error("Cannot find nominatif ID for deletion");
        return false;
      }

      console.log(
        `🗑️ Processing ${deletedRows.length} rows for deletion:`,
        deletedRows
      );

      // 🔥 DISABLED: Delete each marked row from database - handled by executeDraft
      for (const rowId of deletedRows) {
        try {
          const response = await fetch(
            `http://localhost/api/nominatifs/${nominatifId}/details/${rowId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            console.log(`✅ Successfully deleted row ${rowId} from database`);
          } else if (response.status === 404) {
            console.log(
              `ℹ️ Row ${rowId} already deleted or doesn't exist, skipping...`
            );
            // Continue processing even if row doesn't exist
          } else {
            const errorText = await response.text();
            console.error(
              `Failed to delete row ${rowId}:`,
              response.status,
              errorText
            );

            // Show error to user but continue with other deletions
            if (response.status === 422) {
              try {
                const errorData = JSON.parse(errorText);
                if (
                  errorData.message ===
                  "Cannot delete rows in submitted nominatif"
                ) {
                  console.warn(
                    `Cannot delete row ${rowId}: nominatif already submitted`
                  );
                  alert(
                    "Tidak dapat menghapus baris pada nominatif yang sudah disubmit"
                  );
                  return false; // Stop processing
                }
              } catch {
                console.warn(`Failed to parse error for row ${rowId}`);
              }
            }
          }
        } catch (error) {
          console.error(`Error deleting row ${rowId}:`, error);
          alert(`Terjadi kesalahan saat menghapus baris: ${error.message}`);
          return false; // Stop processing
        }
      }

      // Clear deleted rows after successful processing
      setDeletedRows([]);
      return true; // Success
    };

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
        // Process deleted rows first (before updating existing data)
        if (deletedRows.length > 0) {
          console.log(
            `🗑️ Processing ${deletedRows.length} marked for deletion:`,
            deletedRows
          );

          // 🔥 DISABLED: Direct database deletion - causes double deletion bug
          // Backend executeDraft handles all deletions properly
          console.log(
            `ℹ️ SKIPPING DIRECT DELETION - backend executeDraft will handle ${deletedRows.length} marked rows`
          );
          const deleteSuccess = true; // Always succeed - backend handles actual deletion

          if (!deleteSuccess) {
            // Stop if deletion failed
            return;
          }
        }

        // Then save/update current rows
        if (onSave) {
          await onSave(rows);
          // Parent component will handle redirect logic
          console.log(
            "📝 Draft saved successfully - parent component will handle redirect"
          );
        }
      } catch (error) {
        console.error("Error saving draft:", error);

        // Check if it's just a row not found error (which is okay for deleted rows)
        if (error.message && error.message.includes("not found")) {
          console.log(
            "ℹ️ Some rows not found (likely already deleted) - this is okay"
          );
          alert(
            "Beberapa row tidak ditemukan (mungkin sudah dihapus sebelumnya). Data berhasil disimpan!"
          );

          // Still redirect even with not found errors since deletion succeeded
          const currentPath = window.location.pathname;
          const hasIdParameter = window.location.search.includes("id=");
          const isCreateMode = !hasIdParameter;

          console.log("📝 Error case - Redirecting to nominatif list");
          setTimeout(() => {
            window.location.href = "/nominatif";
          }, 1000);
        } else {
          alert(`Gagal menyimpan draft: ${error.message}`);
        }
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
      <>
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
                className="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Tambah Row</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={saveDraft}
                disabled={loading || saving}
                className="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Menyimpan..." : "Simpan Draft"}</span>
              </button>
              <button
                onClick={submitNominatif}
                disabled={loading || submitting}
                className="px-4 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submitting ? "Mengirim..." : "Submit"}</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-gray-200 rounded-lg">
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
                    colSpan="4"
                  >
                    Transportasi
                  </th>
                  <th
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50"
                    colSpan="3"
                  >
                    Penginapan
                  </th>
                  <th
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50"
                    colSpan="6"
                  >
                    Uang Harian Meeting
                  </th>
                  <th
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50"
                    colSpan="6"
                  >
                    Uang Harian
                  </th>
                  <th
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50"
                    colSpan="6"
                  >
                    Uang Representasi
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                    colSpan="1"
                  >
                    Evidence
                  </th>
                </tr>
                {/* Subcategories Row */}
                <tr className="bg-gray-100 border-b border-gray-300">
                  <td
                    colSpan="9"
                    className="px-4 py-2 border-r border-gray-200"
                  ></td>
                  <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                    Pagu Tiket Pesawat NON PP
                  </th>
                  <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                    Aktual Tiket Pesawat NON PP
                  </th>
                  <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                    Pagu Taksi
                  </th>
                  <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                    Aktual Taksi
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
                    Jumlah Hari
                  </th>
                  <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                    Pagu/Hari
                  </th>
                  <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                    Aktual/Hari
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
                    Jumlah Hari
                  </th>
                  <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                    Pagu/Hari
                  </th>
                  <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                    Aktual/Hari
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
                    Jumlah Hari
                  </th>
                  <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                    Pagu/Hari
                  </th>
                  <th className="px-2 py-2 text-xs font-medium text-gray-600 text-center border-r border-gray-200">
                    Aktual/Hari
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
                    colSpan="5"
                  ></th>
                  <th
                    className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                    colSpan="1"
                  ></th>
                  <th
                    className="pl-1 pr-3 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                    colSpan="3"
                  >
                    Meeting Fullboard
                  </th>
                  <th
                    className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                    colSpan="3"
                  >
                    Meeting Fullday
                  </th>
                  <th
                    className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                    colSpan="3"
                  >
                    Luar Kota
                  </th>
                  <th
                    className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                    colSpan="3"
                  >
                    Dalam Kota
                  </th>
                  <th
                    className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                    colSpan="3"
                  >
                    Representasi Luar Kota
                  </th>
                  <th
                    className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200"
                    colSpan="3"
                  >
                    Representasi Dalam Kota
                  </th>
                  <th className="px-2 py-2 text-xs font-bold text-gray-700 text-center border-r border-gray-200 bg-gray-100">
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
                          className={`transition-all duration-200 ${
                            rows.length <= 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-red-600 hover:text-red-800 hover:scale-110 active:scale-95"
                          }`}
                          title="Hapus Baris"
                          disabled={rows.length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 w-56">
                      <div className="space-y-1">
                        {validationErrors[index]?.nama_lengkap && (
                          <div className="text-xs text-red-600 font-medium">
                            {validationErrors[index].nama_lengkap}
                          </div>
                        )}
                        <input
                          type="text"
                          value={row.nama_lengkap || ""}
                          onChange={(e) =>
                            updateRow(row.id, "nama_lengkap", e.target.value)
                          }
                          className={`w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                            validationErrors[index]?.nama_lengkap
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                          }`}
                          placeholder="Nama lengkap"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 w-56">
                      <div className="space-y-1">
                        {validationErrors[index]?.golongan && (
                          <div className="text-xs text-red-600 font-medium">
                            {validationErrors[index].golongan}
                          </div>
                        )}
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
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 w-56">
                      <div className="space-y-1">
                        {validationErrors[index]?.jabatan && (
                          <div className="text-xs text-red-600 font-medium">
                            {validationErrors[index].jabatan}
                          </div>
                        )}
                        <input
                          type="text"
                          value={row.jabatan || ""}
                          onChange={(e) =>
                            updateRow(row.id, "jabatan", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                            validationErrors[index]?.jabatan
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                          }`}
                          placeholder="Jabatan"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 w-56">
                      <div className="space-y-1">
                        {validationErrors[index]?.eselon && (
                          <div className="text-xs text-red-600 font-medium">
                            {validationErrors[index].eselon}
                          </div>
                        )}
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
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 w-56">
                      <div className="space-y-1">
                        {validationErrors[index]?.asal && (
                          <div className="text-xs text-red-600 font-medium">
                            {validationErrors[index].asal}
                          </div>
                        )}
                        <input
                          type="text"
                          value={row.asal || ""}
                          onChange={(e) =>
                            updateRow(row.id, "asal", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                            validationErrors[index]?.asal
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                          }`}
                          placeholder="Asal"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 w-56">
                      <div className="space-y-1">
                        {validationErrors[index]?.tujuan && (
                          <div className="text-xs text-red-600 font-medium">
                            {validationErrors[index].tujuan}
                          </div>
                        )}
                        <input
                          type="text"
                          value={row.tujuan || ""}
                          onChange={(e) =>
                            updateRow(row.id, "tujuan", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                            validationErrors[index]?.tujuan
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                          }`}
                          placeholder="Tujuan"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 w-32">
                      <div className="space-y-1">
                        {validationErrors[index]?.tanggal_pergi && (
                          <div className="text-xs text-red-600 font-medium">
                            {validationErrors[index].tanggal_pergi}
                          </div>
                        )}
                        <input
                          type="date"
                          value={row.tanggal_pergi || ""}
                          onChange={(e) =>
                            updateRow(row.id, "tanggal_pergi", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                            validationErrors[index]?.tanggal_pergi
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                          }`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 w-32">
                      <div className="space-y-1">
                        {validationErrors[index]?.tanggal_sampai && (
                          <div className="text-xs text-red-600 font-medium">
                            {validationErrors[index].tanggal_sampai}
                          </div>
                        )}
                        <input
                          type="date"
                          value={row.tanggal_sampai || ""}
                          onChange={(e) =>
                            updateRow(row.id, "tanggal_sampai", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                            validationErrors[index]?.tanggal_sampai
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                          }`}
                        />
                      </div>
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

                    {/* Transportasi - Taksi */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                      <div className="flex items-center gap-2">
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
                        <button
                          onClick={() =>
                            openSearchModal(
                              row.id,
                              "transport_taksi_pagu",
                              "Pagu Taksi"
                            )
                          }
                          className="ml-2 p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Cari referensi Master SBM"
                          tabIndex={-1}
                        >
                          <Search className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
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
                      <div className="flex items-center gap-2">
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
                        <button
                          onClick={() =>
                            openSearchModal(
                              row.id,
                              "penginapan_pagu_perhari",
                              "Pagu/Hari Penginapan"
                            )
                          }
                          className="ml-2 p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Cari referensi Master SBM"
                          tabIndex={-1}
                        >
                          <Search className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
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

                    {/* Uang Harian Fullboard */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                      <input
                        type="number"
                        min="0"
                        value={
                          row.uang_harian_meeting_fullboard_jumlah_hari || ""
                        }
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
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={
                            row.uang_harian_meeting_fullboard_pagu_perhari
                              ? `Rp ${parseFloat(
                                  row.uang_harian_meeting_fullboard_pagu_perhari ||
                                    0
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
                        <button
                          onClick={() =>
                            openSearchModal(
                              row.id,
                              "uang_harian_meeting_fullboard_pagu_perhari",
                              "Pagu/Hari Fullboard"
                            )
                          }
                          className="ml-2 p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Cari referensi Master SBM"
                          tabIndex={-1}
                        >
                          <Search className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
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

                    {/* Uang Harian Meeting Fullday */}
                    <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                      <input
                        type="number"
                        min="0"
                        value={
                          row.uang_harian_meeting_fullday_jumlah_hari || ""
                        }
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
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={
                            row.uang_harian_meeting_fullday_pagu_perhari
                              ? `Rp ${parseFloat(
                                  row.uang_harian_meeting_fullday_pagu_perhari ||
                                    0
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
                        <button
                          onClick={() =>
                            openSearchModal(
                              row.id,
                              "uang_harian_meeting_fullday_pagu_perhari",
                              "Pagu/Hari Fullday"
                            )
                          }
                          className="ml-2 p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Cari referensi Master SBM"
                          tabIndex={-1}
                        >
                          <Search className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                      <input
                        type="text"
                        value={
                          row.uang_harian_meeting_fullday_aktual_perhari
                            ? `Rp ${parseFloat(
                                row.uang_harian_meeting_fullday_aktual_perhari ||
                                  0
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
                      <div className="flex items-center gap-2">
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
                        <button
                          onClick={() =>
                            openSearchModal(
                              row.id,
                              "uang_harian_luar_kota_pagu_perhari",
                              "Pagu/Hari Luar Kota"
                            )
                          }
                          className="ml-2 p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Cari referensi Master SBM"
                          tabIndex={-1}
                        >
                          <Search className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
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
                      <div className="flex items-center gap-2">
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
                        <button
                          onClick={() =>
                            openSearchModal(
                              row.id,
                              "uang_harian_dalam_kota_pagu_perhari",
                              "Pagu/Hari Dalam Kota"
                            )
                          }
                          className="ml-2 p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Cari referensi Master SBM"
                          tabIndex={-1}
                        >
                          <Search className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
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
                      <div className="flex items-center gap-2">
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
                        <button
                          onClick={() =>
                            openSearchModal(
                              row.id,
                              "representasi_luar_kota_pagu_perhari",
                              "Pagu/Hari Representasi Luar Kota"
                            )
                          }
                          className="ml-2 p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Cari referensi Master SBM"
                          tabIndex={-1}
                        >
                          <Search className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
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
                      <div className="flex items-center gap-2">
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
                        <button
                          onClick={() =>
                            openSearchModal(
                              row.id,
                              "representasi_dalam_kota_pagu_perhari",
                              "Pagu/Hari Representasi Dalam Kota"
                            )
                          }
                          className="ml-2 p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Cari referensi Master SBM"
                          tabIndex={-1}
                        >
                          <Search className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
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

                    {/* Evidence Column - Direct Input */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200 bg-white-50">
                      {/* Auto Evidence Input Area */}
                      <div className="w-full max-w-64">
                        {/* Auto-Processing Input Field */}
                        <div className="mb-2">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Masukan Link Google Drive"
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                              id={`evidence-input-${row.id}`}
                              value={
                                row.evidence_files &&
                                row.evidence_files.length > 0
                                  ? row.evidence_files[0].evidence_link
                                  : ""
                              }
                              onChange={(e) => {
                                const newLink = e.target.value;
                                console.log(
                                  `🔧 EVIDENCE INPUT CHANGE - Row ${row.id}:`,
                                  {
                                    newLink,
                                    oldValue:
                                      row.evidence_files?.[0]?.evidence_link ||
                                      "",
                                  }
                                );

                                // Update row state with new evidence link
                                updateRow(row.id, "evidence_link", newLink);
                              }}
                            />
                          </div>
                        </div>
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
                  <span className="font-medium">Total Baris:</span>{" "}
                  {rows.length}
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

        <SBMReferensiModal
          isOpen={searchModal.isOpen}
          onClose={closeSearchModal}
          fieldName={searchModal.fieldName}
          fieldLabel={searchModal.fieldLabel}
        />
      </>
    );
  }
);

NominatifExcelTable.displayName = "NominatifExcelTable";

export default NominatifExcelTable;
