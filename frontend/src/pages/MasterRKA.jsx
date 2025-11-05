import React from 'react';
import { Calculator, Database, CheckCircle } from 'lucide-react';
import MasterRKATable from '../components/tables/MasterRKATable';

const MasterRKA = ({ selectedYear, onYearChange, loading }) => {

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master RKA</h1>
          <p className="text-gray-600 mt-2">Master Rencana Kerja Anggaran - Tahun {selectedYear}</p>
        </div>
      </div>

      {/* Master RKA Section */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg p-3">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Semua Data Anggaran</h2>
                <p className="text-sm text-gray-500 mt-1">Data lengkap Anggaran A, B, dan C tahun {selectedYear}</p>
              </div>
            </div>

            {/* Data Status */}
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700 text-sm">Data Pre-Seeded</span>
            </div>
          </div>
        </div>

        {/* Master RKA Table */}
        <MasterRKATable />
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-start gap-4">
          <div className="bg-green-100 rounded-lg p-2">
            <Calculator className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Tentang Master RKA</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              Master Rencana Kerja Anggaran (RKA) adalah database yang berisi informasi lengkap mengenai
              perencanaan dan penganggaran untuk berbagai jenis program dan kegiatan. Data ini mencakup
              informasi program, layanan, wilayah, dan rincian anggaran yang digunakan untuk perencanaan
              keuangan tahun berjalan.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Anggaran A: Dinas Pimpinan
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Anggaran B: Pengelolaan Tata Usaha Sekretaris Menko
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Anggaran C: Konferensi Infrastruktur Internasional
              </span>
            </div>
          </div>
        </div>
      </div>

      </div>
  );
};

export default MasterRKA;