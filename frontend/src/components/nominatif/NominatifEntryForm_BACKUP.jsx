import React, { useState, useEffect } from 'react';
import { initialNominatifData } from '../../data/nominatifDummy.js';
import DeskripsiSection from './DeskripsiSection.jsx';
import KodeAnggaranSection from './KodeAnggaranSection.jsx';
import PerjalananSection from './PerjalananSection.jsx';
import TransportasiSection, { BerangkatIcon, PulangIcon } from './TransportasiSection.jsx';
import PenginapanSection from './PenginapanSection.jsx';
import UangHarianSection from './UangHarianSection.jsx';
import UangRepresentasiSection from './UangRepresentasiSection.jsx';
import RingkasanTotalSection from './RingkasanTotalSection.jsx';

const NominatifEntryForm = () => {
  const [formData, setFormData] = useState(initialNominatifData);
  const [loading, setLoading] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // 1: Section 1+2, 2: Section 3-8

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
    // Validate page 1 before proceeding
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
      errors.push('Kode anggaran harus dipilih');
    }
    if (!formData.tujuan.trim()) {
      errors.push('Tujuan harus diisi');
    }
    if (!formData.tanggalPergi || !formData.tanggalPulang) {
      errors.push('Tanggal pergi dan pulang harus diisi');
    }
    if (formData.lamaDinas <= 0) {
      errors.push('Lama dinas harus valid');
    }
    if (!formData.transportasiBerangkat.jenis.trim()) {
      errors.push('Jenis transportasi berangkat harus diisi');
    }
    if (formData.transportasiBerangkat.paguTransportasi <= 0) {
      errors.push('Pagu transportasi berangkat harus diisi');
    }
    if (!formData.transportasiPulang.jenis.trim()) {
      errors.push('Jenis transportasi pulang harus diisi');
    }
    if (formData.transportasiPulang.paguTransportasi <= 0) {
      errors.push('Pagu transportasi pulang harus diisi');
    }
    if (formData.penginapan.menginap) {
      if (formData.penginapan.jumlahMalam <= 0) {
        errors.push('Jumlah malam harus diisi');
      }
      if (formData.penginapan.paguPerMalam <= 0) {
        errors.push('Pagu per malam harus diisi');
      }
    }
    if (formData.uangHarian.paguPerHari <= 0) {
      errors.push('Pagu uang harian harus diisi');
    }
    if (formData.uangRepresentasi.paguPerHari <= 0) {
      errors.push('Pagu uang representasi harus diisi');
    }
    if (formData.totalPagu <= 0) {
      errors.push('Total pagu harus lebih dari 0');
    }

    return errors.length > 0 ? errors.join(', ') + '.' : null;
  };

  // Save draft functionality
  const handleSave = async () => {
    const validationError = validateSave();
    if (validationError) {
      alert(validationError);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update status to draft
      setFormData(prev => ({
        ...prev,
        status: 'draft',
        isEditable: true
      }));

      alert('✓ Draft berhasil disimpan!');
    } catch (error) {
      alert('❌ Gagal menyimpan draft. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Submit functionality
  const handleSubmit = async () => {
    const validationError = validateSubmit();
    if (validationError) {
      alert('❌ Validasi gagal:\n' + validationError);
      return;
    }

    setShowSubmitDialog(true);
  };

  // Confirm submit
  const confirmSubmit = async () => {
    setShowSubmitDialog(false);
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update status to submitted and lock editing
      setFormData(prev => ({
        ...prev,
        status: 'submitted',
        isEditable: false
      }));

      alert('✓ Nominatif berhasil disubmit!\nData tidak bisa diedit lagi.');
    } catch (error) {
      alert('❌ Gagal submit nominatif. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Form Header dengan Progress */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Entry Nominatif</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            formData.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {formData.status === 'draft' ? 'Draft (Bisa Edit)' : 'Submitted (Tidak Bisa Edit)'}
          </span>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center">
          <div className="flex items-center">
            {/* Step 1 */}
            <div className={`flex items-center ${
              currentPage === 1 ? 'text-blue-600' : currentPage === 2 ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentPage === 1 ? 'bg-blue-600 text-white' :
                currentPage === 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentPage === 2 ? '✓' : '1'}
              </div>
              <span className="ml-2 font-medium">Informasi Utama</span>
            </div>

            {/* Connector */}
            <div className={`w-16 h-1 mx-2 ${
              currentPage === 2 ? 'bg-green-600' : 'bg-gray-300'
            }`}></div>

            {/* Step 2 */}
            <div className={`flex items-center ${
              currentPage === 2 ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentPage === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Detail Perjalanan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Section 1 + 2: Gabung Deskripsi Tugas dan Kode Anggaran */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <DeskripsiSection
              deskripsiTugas={formData.deskripsiTugas}
              onChange={handleChange}
              isEditable={formData.isEditable}
            />
          </div>
          <div className="lg:col-span-1">
            <KodeAnggaranSection
              kodeAnggaranRKA={formData.kodeAnggaranRKA}
              onChange={handleChange}
              isEditable={formData.isEditable}
            />
          </div>
        </div>

        {/* Section 3-8: Layout Side-by-Side (Horizontal Scroll) */}
        <div>
          {/* Section Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Detail Perjalanan & Komponen Biaya
            </h2>
            <span className="text-sm text-gray-500">
              <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Scroll horizontal untuk melihat semua section
            </span>
          </div>

          <div className="relative">
            {/* Scroll Indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10 flex items-center justify-center">
              <span className="text-gray-400 text-sm font-semibold">→ scroll →</span>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
            {/* Section 3: Perjalanan */}
            <div className="flex-shrink-0 w-80">
              <PerjalananSection
                asal={formData.asal}
                tujuan={formData.tujuan}
                tanggalPergi={formData.tanggalPergi}
                tanggalPulang={formData.tanggalPulang}
                lamaDinas={formData.lamaDinas}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>

            {/* Section 4: Transportasi Berangkat */}
            <div className="flex-shrink-0 w-80">
              <TransportasiSection
                title="Transportasi Berangkat"
                icon={<BerangkatIcon />}
                type="berangkat"
                data={formData.transportasiBerangkat}
                onChange={handleChange}
                isEditable={formData.isEditable}
              />
            </div>

            {/* Section 5: Transportasi Pulang */}
            <div className="flex-shrink-0 w-80">
              <TransportasiSection
                title="Transportasi Pulang"
                icon={<PulangIcon />}
                type="pulang"
                data={formData.transportasiPulang}
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

        {/* Ringkasan Total */}
        <RingkasanTotalSection
          transportasiBerangkat={formData.transportasiBerangkat}
          transportasiPulang={formData.transportasiPulang}
          penginapan={formData.penginapan}
          uangHarian={formData.uangHarian}
          uangRepresentasi={formData.uangRepresentasi}
          totalPagu={formData.totalPagu}
          onChange={handleChange}
        />

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={loading || !formData.isEditable}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </span>
              ) : (
                '💾 Save Draft'
              )}
            </button>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.isEditable}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mengirim...
                </span>
              ) : (
                '📤 Submit Final'
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-4 text-sm text-gray-500">
            <p><strong>Save:</strong> Simpan draft, masih bisa diedit. Minimal deskripsi tugas harus diisi.</p>
            <p><strong>Submit:</strong> Simpan final, tidak bisa diedit lagi. Semua field wajib diisi.</p>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Konfirmasi Submit</h3>
            <div className="space-y-3 mb-6">
              <p className="text-gray-600">
                Setelah submit, data <strong>TIDAK</strong> bisa diedit lagi.
              </p>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Total Pagu:</p>
                <p className="text-lg font-bold text-green-600">
                  {formData.totalPagu.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  })}
                </p>
              </div>
              <p className="text-sm text-gray-600">Apakah Anda yakin?</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Batal
              </button>
              <button
                onClick={confirmSubmit}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Ya, Submit
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default NominatifEntryForm;