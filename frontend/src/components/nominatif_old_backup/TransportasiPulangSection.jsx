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

  // Format currency untuk display
  const formatCurrencyInput = (value) => {
    if (value === undefined || value === null || value === '') return '';
    // Remove non-numeric characters
    const numberValue = String(value).replace(/[^\d]/g, '');
    if (numberValue === '') return '';
    // Format with dots
    return parseInt(numberValue).toLocaleString('id-ID');
  };

  // Parse currency value back to number
  const parseCurrencyValue = (value) => {
    if (!value) return 0;
    const numberValue = value.replace(/[^\d]/g, '');
    return parseInt(numberValue) || 0;
  };

  // Handle perubahan transportasi per hari
  const handleTransportasiChange = (hari, field, value) => {
    if (!transportasiPerHari || !Array.isArray(transportasiPerHari) || transportasiPerHari.length === 0) return;

    const newTransportasiPerHari = transportasiPerHari.map(transport => {
      if (transport.hari === hari) {
        // Convert to number if it's a numeric field
        if (field.includes('pagu') || field.includes('subtotal') || field.includes('biayaAktual')) {
          value = parseCurrencyValue(value) || 0;
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

  // Calculate total pulang (hanya hari terakhir)
  const totalPulang = (transportasiPerHari || [])
    .filter(transport => transport.hari === (jumlahHari || 1))
    .reduce((total, transport) => total + (transport.anggaranRealisasiPulang || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header dengan icon dan informasi */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-5 5-5-5M7 17l5-5 5 5" />
            </svg>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Transportasi Pulang
            </label>
            <p className="text-xs text-gray-500">
              Transportasi untuk perjalanan kembali ke kota asal
              <span className="text-green-600 font-medium"> (Hari {jumlahHari || 1})</span>
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {formatRupiah(totalPulang)}
        </div>
      </div>

      <div className="space-y-4">
        {(transportasiPerHari || [])
          .filter(transport => transport.hari === (jumlahHari || 1)) // Hari Terakhir (Pulang)
          .map((transport) => (
          <div key={transport.hari} className="">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-semibold text-xs">
                {transport.hari}
              </div>
              <span className="ml-2 font-normal text-gray-700">
                Transportasi Pulang Hari ke-{transport.hari}
                {jumlahHari > 1 && (
                  <span className="text-green-600 ml-2">(Kembali ke Asal)</span>
                )}
              </span>
            </div>

            {/* Jenis Transportasi */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Transportasi</label>
              <input
                type="text"
                value={transport.jenisPulang}
                onChange={(e) => handleTransportasiChange(transport.hari, 'jenisPulang', e.target.value)}
                disabled={!isEditable}
                className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
                placeholder="Contoh: Pesawat, Kereta Api, Bus"
              />
            </div>

            {/* Transportasi Utama */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pagu Transportasi</label>
                <input
                  type="text"
                  value={formatCurrencyInput(transport.paguTransportasiPulang)}
                  onChange={(e) => handleTransportasiChange(transport.hari, 'paguTransportasiPulang', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Biaya Aktual</label>
                <input
                  type="text"
                  value={formatCurrencyInput(transport.biayaAktualTransportasiPulang)}
                  onChange={(e) => handleTransportasiChange(transport.hari, 'biayaAktualTransportasiPulang', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Taxi */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pagu Taxi</label>
                <input
                  type="text"
                  value={formatCurrencyInput(transport.paguTaksiPulang)}
                  onChange={(e) => handleTransportasiChange(transport.hari, 'paguTaksiPulang', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Biaya Aktual</label>
                <input
                  type="text"
                  value={formatCurrencyInput(transport.biayaAktualTaksiPulang)}
                  onChange={(e) => handleTransportasiChange(transport.hari, 'biayaAktualTaksiPulang', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Anggaran Realisasi */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
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