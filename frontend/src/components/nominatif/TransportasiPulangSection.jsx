import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const TransportasiPulangSection = ({
  jumlahHari,
  transportasiPerHari,
  onChange,
  isEditable
}) => {
  // Update transportasi per hari when jumlahHari changes
  useEffect(() => {
    if (!transportasiPerHari || transportasiPerHari.length === 0 || transportasiPerHari.length !== jumlahHari) {
      const newTransportasiPerHari = [];
      for (let i = 1; i <= jumlahHari; i++) {
        const existingTransport = transportasiPerHari?.find(t => t.hari === i);
        newTransportasiPerHari.push({
          hari: i,
          jenisPulang: existingTransport ? existingTransport.jenisPulang : '',
          paguTransportasiPulang: existingTransport ? existingTransport.paguTransportasiPulang : 0,
          paguTaksiPulang: existingTransport ? existingTransport.paguTaksiPulang : 0,
          biayaAktualTransportasiPulang: existingTransport ? existingTransport.biayaAktualTransportasiPulang : 0,
          biayaAktualTaksiPulang: existingTransport ? existingTransport.biayaAktualTaksiPulang : 0,
          subtotalPulang: existingTransport ? existingTransport.subtotalPulang : 0,
          anggaranRealisasiPulang: existingTransport ? existingTransport.anggaranRealisasiPulang : 0
        });
      }
      onChange('transportasiPerHari', newTransportasiPerHari);
    }
  }, [jumlahHari]);

  // Handle perubahan transportasi per hari
  const handleTransportasiChange = (hari, field, value) => {
    if (!transportasiPerHari || transportasiPerHari.length === 0) return;

    const newTransportasiPerHari = transportasiPerHari.map(transport => {
      if (transport.hari === hari) {
        // Convert to number if it's a numeric field
        if (field.includes('pagu') || field.includes('subtotal') || field.includes('biayaAktual')) {
          value = parseFloat(value) || 0;
        }
        return { ...transport, [field]: value };
      }
      return transport;
    });

    // Auto-calculate subtotal dan anggaran realisasi
    const updatedTransport = newTransportasiPerHari.find(t => t.hari === hari);
    if (updatedTransport) {
      // Subtotal = Total biaya aktual
      updatedTransport.subtotalPulang = (updatedTransport.biayaAktualTransportasiPulang || 0) + (updatedTransport.biayaAktualTaksiPulang || 0);

      // Anggaran Realisasi = Pagu - Biaya Aktual
      const totalPagu = (updatedTransport.paguTransportasiPulang || 0) + (updatedTransport.paguTaksiPulang || 0);
      const totalBiayaAktual = (updatedTransport.biayaAktualTransportasiPulang || 0) + (updatedTransport.biayaAktualTaksiPulang || 0);
      updatedTransport.anggaranRealisasiPulang = totalPagu - totalBiayaAktual;
    }

    onChange('transportasiPerHari', newTransportasiPerHari);
  };

  // Calculate total pulang (menggunakan anggaran realisasi)
  const totalPulang = transportasiPerHari.reduce((total, transport) => total + (transport.anggaranRealisasiPulang || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-normal text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-5 5-5-5M7 17l5-5 5 5" />
        </svg>
        Section 5: Transportasi Pulang
      </h3>

      <div className="space-y-6">
        {transportasiPerHari.map((transport) => (
          <div key={transport.hari} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-normal text-sm">
                {transport.hari}
              </div>
              <span className="ml-2 font-normal text-gray-700">Transportasi Pulang Hari ke-{transport.hari}</span>
            </div>

            {/* Jenis Transportasi */}
            <div className="mb-4">
              <label className="block text-sm font-normal text-gray-700 mb-2">Jenis Transportasi</label>
              <input
                type="text"
                value={transport.jenisPulang}
                onChange={(e) => handleTransportasiChange(transport.hari, 'jenisPulang', e.target.value)}
                disabled={!isEditable}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 rounded-lg"
              />
            </div>

            {/* Transportasi Utama */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">Pagu Transportasi</label>
                <input
                  type="number"
                  value={transport.paguTransportasiPulang}
                  onChange={(e) => handleTransportasiChange(transport.hari, 'paguTransportasiPulang', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 rounded-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">Biaya Aktual</label>
                <input
                  type="number"
                  value={transport.biayaAktualTransportasiPulang}
                  onChange={(e) => handleTransportasiChange(transport.hari, 'biayaAktualTransportasiPulang', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500 rounded-lg"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Taxi */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">Pagu Taxi</label>
                <input
                  type="number"
                  value={transport.paguTaksiPulang}
                  onChange={(e) => handleTransportasiChange(transport.hari, 'paguTaksiPulang', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 rounded-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">Biaya Aktual</label>
                <input
                  type="number"
                  value={transport.biayaAktualTaksiPulang}
                  onChange={(e) => handleTransportasiChange(transport.hari, 'biayaAktualTaksiPulang', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500 rounded-lg"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Anggaran Realisasi */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Anggaran Realisasi:</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatRupiah((transport.paguTransportasiPulang || 0) + (transport.paguTaksiPulang || 0) - (transport.biayaAktualTransportasiPulang || 0) - (transport.biayaAktualTaksiPulang || 0))}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pagu ({formatRupiah((transport.paguTransportasiPulang || 0) + (transport.paguTaksiPulang || 0))}) - Biaya Aktual ({formatRupiah((transport.biayaAktualTransportasiPulang || 0) + (transport.biayaAktualTaksiPulang || 0))})
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportasiPulangSection;