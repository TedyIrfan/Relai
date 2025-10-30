import React, { useState, useEffect } from 'react';
import { initialNominatifData } from '../../data/nominatifDummy.js';
import DeskripsiSection from './DeskripsiSection.jsx';
import KodeAnggaranSection from './KodeAnggaranSection.jsx';
import PerjalananSection from './PerjalananSection.jsx';
import TransportasiMultiHariSection from './TransportasiMultiHariSection.jsx';
import PenginapanSection from './PenginapanSection.jsx';
import UangHarianSection from './UangHarianSection.jsx';
import UangRepresentasiSection from './UangRepresentasiSection.jsx';
import RingkasanTotalSection from './RingkasanTotalSection.jsx';

const NominatifEntryForm = () => {
  const [formData, setFormData] = useState(initialNominatifData);
  const [loading, setLoading] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // 1: Section 1+2, 2: Section 3-8

  const isEdit = !!formData.id; // Check if has ID for edit mode
  const isEditable = formData.isEditable; // Get editable status from form data

  // Handle field changes
  const handleChange = (field, value) => {
    setFormData(prev => {
      // Handle nested object updates
      if (field.includes('.')) {
        const [section, subfield] = field.split('.');
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subfield]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Validation functions
  const validateSave = () => {
    // Minimal validation for save
    if (!formData.deskripsiTugas.trim()) {
      return 'Deskripsi tugas harus diisi untuk menyimpan draft.';
    }
    return null;
  };

  // Navigation functions
  const handleNextPage = () => {
    // For preview mode, allow navigation without validation
    // Only validate when in edit mode and status is draft
    if (formData.isEditable && formData.status === 'draft') {
      const errors = [];
      if (!formData.deskripsiTugas.trim()) {
        errors.push('Deskripsi tugas harus diisi');
      }
      if (!formData.kodeAnggaranRKA) {
        errors.push('Kode anggaran RKA harus dipilih');
      }

      if (errors.length > 0) {
        alert('Mohon lengkapi data berikut:\n' + errors.join('\n'));
        return;
      }
    }

    setCurrentPage(2);
  };

  const handlePrevPage = () => {
    setCurrentPage(1);
  };

  const validateSubmit = () => {
    // Strict validation for submit
    const errors = [];

    if (!formData.deskripsiTugas.trim()) {
      errors.push('Deskripsi tugas harus diisi');
    }
    if (!formData.kodeAnggaranRKA) {
      errors.push('Kode anggaran RKA harus dipilih');
    }

    // Validate rute perjalanan
    if (!formData.rutePerjalanan || formData.rutePerjalanan.length === 0) {
      errors.push('Rute perjalanan harus diisi');
    } else {
      formData.rutePerjalanan.forEach((rute, index) => {
        if (!rute.dari.trim()) {
          errors.push(`Lokasi "dari" untuk hari ke-${rute.hari} harus diisi`);
        }
        if (!rute.ke.trim()) {
          errors.push(`Lokasi "ke" untuk hari ke-${rute.hari} harus diisi`);
        }
        if (!rute.tanggal) {
          errors.push(`Tanggal untuk hari ke-${rute.hari} harus diisi`);
        }
      });
    }

    if (!formData.lamaDinas) {
      errors.push('Lama dinas harus diisi');
    }

    return errors.length > 0 ? errors.join(', ') + '.' : null;
  };

  const handleSave = async () => {
    const error = validateSave();
    if (error) {
      alert(error);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update status to draft
      setFormData(prev => ({
        ...prev,
        status: 'draft'
      }));

      alert('Draft berhasil disimpan!');
    } catch (error) {
      alert('Gagal menyimpan draft. Silakan coba lagi.');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const error = validateSubmit();
    if (error) {
      alert('Mohon lengkapi data berikut:\n' + error);
      return;
    }

    setShowSubmitDialog(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    setShowSubmitDialog(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update status to submitted and make non-editable
      setFormData(prev => ({
        ...prev,
        status: 'submitted',
        isEditable: false
      }));

      alert('Nominatif berhasil disubmit!');
    } catch (error) {
      alert('Gagal submit nominatif. Silakan coba lagi.');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header with Document Info and Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isEdit ? 'Edit' : 'Buat'} Nominatif {isEdit && '(Mode Edit)'}

            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Nomor Dokumen: {formData.nomorDokumen || 'Auto-generate'}</p>
              <p>Period: 01-10-2025 s/d 31-12-2025</p>
              <p>KPPN: {formData.kppn || 'Belum ditentukan'}</p>
              {isEdit && (
                <p className={`font-semibold ${
                  formData.status === 'submit' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  Status: {formData.status === 'submit' ? 'Submitted' : 'Draft'}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {isEdit && (
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Kembali
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Simpan Draft
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {isEdit ? 'Update' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Page 1: Deskripsi & Kode Anggaran
            </button>
            <button
              onClick={() => handleNextPage()}
              disabled={!isEditable && currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 2
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              Page 2: Rincian Biaya
            </button>
          </div>
          {isEdit && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              formData.status === 'submit'
                ? 'bg-green-100 text-green-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {formData.status === 'submit' ? 'Submitted' : 'Draft'}
            </div>
          )}
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        {/* Page 1: Section 1 + 2 */}
        {currentPage === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <DeskripsiSection
                deskripsiTugas={formData.deskripsiTugas}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>
            <div>
              <KodeAnggaranSection
                kodeAnggaranRKA={formData.kodeAnggaranRKA}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>
          </div>
        )}

        {/* Page 2: Section 3-8 */}
        {currentPage === 2 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Section 3-8: Rincian Perjalanan</h2>
              <p className="text-sm text-gray-600">Scroll horizontal untuk melihat semua section</p>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-6 min-w-max pb-4">
                {/* Section 3: Perjalanan */}
                <div className="flex-shrink-0 w-96">
                  <PerjalananSection
                    jumlahHari={formData.jumlahHari}
                    rutePerjalanan={formData.rutePerjalanan}
                    tanggalPulang={formData.tanggalPulang}
                    lamaDinas={formData.lamaDinas}
                    onChange={handleChange}
                    isEditable={formData.isEditable}
                  />
                </div>

                {/* Section 4-5: Transportasi Per Hari */}
                <div className="flex-shrink-0 w-[500px]">
                  <TransportasiMultiHariSection
                    jumlahHari={formData.jumlahHari}
                    transportasiPerHari={formData.transportasiPerHari}
                    onChange={handleChange}
                    isEditable={formData.isEditable}
                  />
                </div>

                {/* Section 6: Penginapan */}
                <div className="flex-shrink-0 w-80">
                  <PenginapanSection
                    data={formData.penginapan}
                    onChange={handleChange}
                    isEditable={formData.isEditable}
                  />
                </div>

                {/* Section 7: Uang Harian */}
                <div className="flex-shrink-0 w-80">
                  <UangHarianSection
                    data={formData.uangHarian}
                    lamaDinas={formData.lamaDinas}
                    onChange={handleChange}
                    isEditable={formData.isEditable}
                  />
                </div>

                {/* Section 8: Uang Representasi */}
                <div className="flex-shrink-0 w-80">
                  <UangRepresentasiSection
                    data={formData.uangRepresentasi}
                    lamaDinas={formData.lamaDinas}
                    onChange={handleChange}
                    isEditable={formData.isEditable}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ringkasan Total (tampil di kedua halaman) */}
        <RingkasanTotalSection
          transportasiPerHari={formData.transportasiPerHari}
          penginapan={formData.penginapan}
          uangHarian={formData.uangHarian}
          uangRepresentasi={formData.uangRepresentasi}
          totalPagu={formData.totalPagu}
          onChange={handleChange}
        />
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Submit</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin submit nominatif ini? Setelah di-submit, data tidak dapat diubah lagi.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSubmitDialog(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={confirmSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Ya, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NominatifEntryForm;