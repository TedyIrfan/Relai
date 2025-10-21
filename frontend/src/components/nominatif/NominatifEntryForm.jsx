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
      {/* Form Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Entry Nominatif</h1>
        <p className="text-gray-600">
          Status: <span className={`font-medium ${formData.status === 'draft' ? 'text-yellow-600' : 'text-green-600'}`}>
            {formData.status === 'draft' ? 'Draft (Bisa Edit)' : 'Submitted (Tidak Bisa Edit)'}
          </span>
        </p>
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        {/* Section 1: Deskripsi Tugas */}
        <DeskripsiSection
          deskripsiTugas={formData.deskripsiTugas}
          onChange={handleChange}
          isEditable={formData.isEditable}
        />

        {/* Section 2: Kode Anggaran */}
        <KodeAnggaranSection
          kodeAnggaranRKA={formData.kodeAnggaranRKA}
          onChange={handleChange}
          isEditable={formData.isEditable}
        />

        {/* Section 3: Perjalanan */}
        <PerjalananSection
          asal={formData.asal}
          tujuan={formData.tujuan}
          tanggalPergi={formData.tanggalPergi}
          tanggalPulang={formData.tanggalPulang}
          lamaDinas={formData.lamaDinas}
          onChange={handleChange}
          isEditable={formData.isEditable}
        />

        {/* Section 4: Transportasi Berangkat */}
        <TransportasiSection
          title="Transportasi Berangkat"
          icon={<BerangkatIcon />}
          type="berangkat"
          data={formData.transportasiBerangkat}
          onChange={handleChange}
          isEditable={formData.isEditable}
        />

        {/* Section 5: Transportasi Pulang */}
        <TransportasiSection
          title="Transportasi Pulang"
          icon={<PulangIcon />}
          type="pulang"
          data={formData.transportasiPulang}
          onChange={handleChange}
          isEditable={formData.isEditable}
        />

        {/* Section 6: Penginapan */}
        <PenginapanSection
          data={formData.penginapan}
          onChange={handleChange}
          isEditable={formData.isEditable}
        />

        {/* Section 7: Uang Harian */}
        <UangHarianSection
          data={formData.uangHarian}
          lamaDinas={formData.lamaDinas}
          onChange={handleChange}
          isEditable={formData.isEditable}
        />

        {/* Section 8: Uang Representasi */}
        <UangRepresentasiSection
          data={formData.uangRepresentasi}
          lamaDinas={formData.lamaDinas}
          onChange={handleChange}
          isEditable={formData.isEditable}
        />

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
  );
};

export default NominatifEntryForm;