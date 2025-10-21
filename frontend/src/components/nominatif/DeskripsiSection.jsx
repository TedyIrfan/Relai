import React from 'react';

const DeskripsiSection = ({ deskripsiTugas, onChange, isEditable }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Section 1: Deskripsi Tugas Dinas
      </h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Deskripsi Tugas <span className="text-red-500">*</span>
        </label>
        <textarea
          value={deskripsiTugas}
          onChange={(e) => onChange('deskripsiTugas', e.target.value)}
          disabled={!isEditable}
          placeholder="Contoh: Rapat koordinasi dengan Pemda Jabar terkait proyek infrastruktur jalan tol dan pembahasan APBD 2025"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 resize-none"
          rows={4}
        />
        <p className="text-xs text-gray-500">
          *Required untuk Submit, opsional untuk Save
        </p>
      </div>
    </div>
  );
};

export default DeskripsiSection;