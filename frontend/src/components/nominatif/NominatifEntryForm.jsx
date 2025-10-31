import React, { useState, useEffect } from 'react';
import { initialNominatifData } from '../../data/nominatifDummy.js';
import DetailPerjalananDinasSection from './DetailPerjalananDinasSection.jsx';
import KodeAnggaranSection from './KodeAnggaranSection.jsx';
import DetailPerjalananSection from './DetailPerjalananSection.jsx';
import TransportasiPergiSection from './TransportasiPergiSection.jsx';
import TransportasiPulangSection from './TransportasiPulangSection.jsx';
import PenginapanSection from './PenginapanSection.jsx';
import UangHarianSection from './UangHarianSection.jsx';
import UangRepresentasiSection from './UangRepresentasiSection.jsx';
import RingkasanTotalSection from './RingkasanTotalSection.jsx';

const NominatifEntryForm = () => {
  const [formData, setFormData] = useState(initialNominatifData);
  const [loading, setLoading] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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
    if (!formData.detailPerjalananDinas?.deskripsi?.trim()) {
      return 'Deskripsi perjalanan dinas harus diisi untuk menyimpan draft.';
    }
    return null;
  };

  
  const validateSubmit = () => {
    // Strict validation for submit
    const errors = [];

    if (!formData.detailPerjalananDinas?.deskripsi?.trim()) {
      errors.push('Deskripsi perjalanan dinas harus diisi');
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

    if (!formData.jumlahHari) {
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

  // Page navigation functions
  const handleNextPage = () => {
    if (currentPage === 1) {
      // Validate page 1 before proceeding
      const error = validatePage1();
      if (error) {
        alert(error);
        return;
      }
      setCurrentPage(2);
    }
  };

  const handlePrevPage = () => {
    if (currentPage === 2) {
      setCurrentPage(1);
    }
  };

  const validatePage1 = () => {
    // Validate required fields for page 1
    if (!formData.detailPerjalananDinas?.deskripsi?.trim()) {
      return 'Mohon lengkapi deskripsi perjalanan dinas terlebih dahulu.';
    }
    if (!formData.kodeAnggaranRKA) {
      return 'Mohon pilih kode anggaran RKA terlebih dahulu.';
    }
    return null;
  };

  const validatePage2 = () => {
    // Validate required fields for page 2
    if (!formData.jumlahHari || formData.jumlahHari <= 0) {
      return 'Mohon lengkapi detail perjalanan dengan benar.';
    }
    if (!formData.rutePerjalanan || formData.rutePerjalanan.length === 0) {
      return 'Mohon lengkapi rute perjalanan.';
    }
    // Check if all routes have destinations
    const emptyDestinations = formData.rutePerjalanan.filter(rute => !rute.ke?.trim());
    if (emptyDestinations.length > 0) {
      return 'Semua tujuan perjalanan harus diisi.';
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Page Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 1
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Page 1: Detail & Kode Anggaran
            </button>
            <button
              onClick={() => currentPage === 3 ? setCurrentPage(2) : handleNextPage()}
              disabled={!isEditable && currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 2
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              Page 2: Rincian Perjalanan
            </button>
            <button
              onClick={() => {
                if (currentPage === 1) {
                  const error = validatePage1();
                  if (error) {
                    alert(error);
                    return;
                  }
                } else if (currentPage === 2) {
                  const error = validatePage2();
                  if (error) {
                    alert(error);
                    return;
                  }
                }
                setCurrentPage(3);
              }}
              disabled={!isEditable && currentPage === 2}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 3
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              Page 3: Ringkasan Biaya
            </button>
          </div>
        </div>
      </div>

      {/* Page 1: Detail Perjalanan & Kode Anggaran */}
      {currentPage === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Section 1-2: Detail Perjalanan & Kode Anggaran</h2>
          </div>
          <div className="flex gap-6">
            {/* Section 1: Detail Perjalanan Dinas */}
            <div className="flex-1 min-w-[550px]">
              <DetailPerjalananDinasSection
                data={formData.detailPerjalananDinas || {}}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>

            {/* Section 2: Kode Anggaran */}
            <div className="flex-1 min-w-[500px]">
              <KodeAnggaranSection
                kodeAnggaranRKA={formData.kodeAnggaranRKA}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>
          </div>
        </div>
      )}

      {/* Page 2: Section 3-8 - Rincian Perjalanan */}
      {currentPage === 2 && (
        <div className="space-y-6">
          {/* Save Draft Button - Top */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : 'Simpan Draft'}
              </button>
            </div>
          </div>
          {/* Section 3-8: Rincian Lengkap Perjalanan */}
          <div className="flex gap-6 overflow-x-auto">
            {/* Section 3: Detail Perjalanan */}
            <div className="flex-shrink-0 w-[500px]">
              <DetailPerjalananSection
                jumlahHari={formData.jumlahHari}
                rutePerjalanan={formData.rutePerjalanan}
                tanggalPerjalanan={formData.tanggalPerjalanan}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>

            {/* Section 4: Transportasi Pergi */}
            <div className="flex-shrink-0 w-[500px]">
              <TransportasiPergiSection
                jumlahHari={formData.jumlahHari}
                transportasiPerHari={formData.transportasiPerHari}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>

            {/* Section 5: Transportasi Pulang */}
            <div className="flex-shrink-0 w-[500px]">
              <TransportasiPulangSection
                jumlahHari={formData.jumlahHari}
                transportasiPerHari={formData.transportasiPerHari}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>

            {/* Section 6: Penginapan */}
            <div className="flex-shrink-0 w-[500px]">
              <PenginapanSection
                data={formData.penginapan}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>

            {/* Section 7: Uang Harian */}
            <div className="flex-shrink-0 w-[500px]">
              <UangHarianSection
                data={formData.uangHarian}
                lamaDinas={formData.jumlahHari}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>

            {/* Section 8: Uang Representasi */}
            <div className="flex-shrink-0 w-[500px]">
              <UangRepresentasiSection
                data={formData.uangRepresentasi}
                lamaDinas={formData.jumlahHari}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>
          </div>
        </div>
      )}

      {/* Page 3: Ringkasan Total Biaya */}
      {currentPage === 3 && (
        <div className="space-y-6">
          {/* Ringkasan Total */}
          <RingkasanTotalSection
            transportasiPerHari={formData.transportasiPerHari}
            penginapan={formData.penginapan}
            uangHarian={formData.uangHarian}
            uangRepresentasi={formData.uangRepresentasi}
            totalPagu={formData.totalPagu}
            onChange={handleChange}
          />

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : 'Simpan Draft'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

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