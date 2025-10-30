import React from 'react';

const DeskripsiSection = ({ deskripsiTugas, onChange, isEditable }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Section 1: Deskripsi Tugas Dinas
      </h3>

      {/* Deskripsi Tugas Details */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        {/* Deskripsi */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Deskripsi Tugas Dinas</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Deskripsi Tugas <span className="text-red-500">*</span>
              </label>
              <textarea
                value={deskripsiTugas}
                onChange={(e) => onChange('deskripsiTugas', e.target.value)}
                disabled={!isEditable}
                placeholder="Contoh: Rapat koordinasi dengan Pemda Jabar terkait proyek infrastruktur jalan tol dan pembahasan APBD 2025"
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 resize-none text-sm"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Info</label>
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-500">
                *Required untuk Submit, opsional untuk Save
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-700">
            💡 <strong>Info:</strong> Jelaskan secara rinci tujuan dan kegiatan perjalanan dinas
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeskripsiSection;