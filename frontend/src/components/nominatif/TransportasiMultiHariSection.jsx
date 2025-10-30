import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const TransportasiMultiHariSection = ({
  jumlahHari,
  transportasiPerHari,
  onChange,
  isEditable
}) => {
  // Update transportasi per hari when jumlahHari changes
  useEffect(() => {
    const newTransportasiPerHari = [];
    for (let i = 1; i <= jumlahHari; i++) {
      const existingTransport = transportasiPerHari.find(t => t.hari === i);
      newTransportasiPerHari.push({
        hari: i,
        jenisBerangkat: existingTransport ? existingTransport.jenisBerangkat : '',
        paguTransportasiBerangkat: existingTransport ? existingTransport.paguTransportasiBerangkat : 0,
        paguTaksiBerangkat: existingTransport ? existingTransport.paguTaksiBerangkat : 0,
        biayaAktualTransportasiBerangkat: existingTransport ? existingTransport.biayaAktualTransportasiBerangkat : 0,
        biayaAktualTaksiBerangkat: existingTransport ? existingTransport.biayaAktualTaksiBerangkat : 0,
        subtotalBerangkat: existingTransport ? existingTransport.subtotalBerangkat : 0,
        jenisPulang: existingTransport ? existingTransport.jenisPulang : '',
        paguTransportasiPulang: existingTransport ? existingTransport.paguTransportasiPulang : 0,
        paguTaksiPulang: existingTransport ? existingTransport.paguTaksiPulang : 0,
        biayaAktualTransportasiPulang: existingTransport ? existingTransport.biayaAktualTransportasiPulang : 0,
        biayaAktualTaksiPulang: existingTransport ? existingTransport.biayaAktualTaksiPulang : 0,
        subtotalPulang: existingTransport ? existingTransport.subtotalPulang : 0,
        totalHari: existingTransport ? existingTransport.totalHari : 0
      });
    }
    onChange('transportasiPerHari', newTransportasiPerHari);
  }, [jumlahHari]);

  
  // Handle perubahan transportasi per hari
  const handleTransportasiChange = (hari, field, value) => {
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

    // Auto-calculate subtotals and totals
    const updatedTransport = newTransportasiPerHari.find(t => t.hari === hari);
    if (updatedTransport) {
      // Calculate berangkat subtotal
      const subtotalBerangkat = (updatedTransport.paguTransportasiBerangkat || 0) + (updatedTransport.paguTaksiBerangkat || 0);

      // Calculate pulang subtotal
      const subtotalPulang = (updatedTransport.paguTransportasiPulang || 0) + (updatedTransport.paguTaksiPulang || 0);

      // Calculate total hari
      const totalHari = subtotalBerangkat + subtotalPulang;

      // Update the transport with calculated values
      const finalTransport = { ...updatedTransport, subtotalBerangkat, subtotalPulang, totalHari };

      const finalTransportasiPerHari = newTransportasiPerHari.map(t =>
        t.hari === hari ? finalTransport : t
      );

      onChange('transportasiPerHari', finalTransportasiPerHari);
    }
  };

  // Calculate grand total
  const grandTotal = transportasiPerHari.reduce((total, transport) => total + (transport.totalHari || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Section 4-5: Transportasi Per Hari
      </h3>

      <div className="space-y-6">
        {transportasiPerHari.map((transport) => (
          <div key={transport.hari} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-semibold text-sm">
                {transport.hari}
              </div>
              <span className="ml-2 font-medium text-gray-700">Transportasi Hari ke-{transport.hari}</span>
            </div>

            {/* Transportasi Berangkat */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Transportasi Berangkat</h4>

              {/* Jenis Transportasi */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Transportasi</label>
                <input
                  type="text"
                  value={transport.jenisBerangkat}
                  onChange={(e) => handleTransportasiChange(transport.hari, 'jenisBerangkat', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                  placeholder="Pesawat, Kereta, Mobil"
                />
              </div>

              {/* Transportasi Utama */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Pagu Transportasi</label>
                  <input
                    type="number"
                    value={transport.paguTransportasiBerangkat}
                    onChange={(e) => handleTransportasiChange(transport.hari, 'paguTransportasiBerangkat', e.target.value)}
                    disabled={!isEditable}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Biaya Aktual</label>
                  <input
                    type="number"
                    value={transport.biayaAktualTransportasiBerangkat}
                    onChange={(e) => handleTransportasiChange(transport.hari, 'biayaAktualTransportasiBerangkat', e.target.value)}
                    disabled={!isEditable}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Taxi */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Pagu Taxi</label>
                  <input
                    type="number"
                    value={transport.paguTaksiBerangkat}
                    onChange={(e) => handleTransportasiChange(transport.hari, 'paguTaksiBerangkat', e.target.value)}
                    disabled={!isEditable}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Biaya Aktual Taxi</label>
                  <input
                    type="number"
                    value={transport.biayaAktualTaksiBerangkat}
                    onChange={(e) => handleTransportasiChange(transport.hari, 'biayaAktualTaksiBerangkat', e.target.value)}
                    disabled={!isEditable}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Subtotal */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Subtotal Berangkat:</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {formatRupiah(transport.subtotalBerangkat)}
                  </span>
                </div>
              </div>
            </div>

            {/* Transportasi Pulang */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Transportasi Pulang</h4>

              {/* Jenis Transportasi */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Transportasi</label>
                <input
                  type="text"
                  value={transport.jenisPulang}
                  onChange={(e) => handleTransportasiChange(transport.hari, 'jenisPulang', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                  placeholder="Pesawat, Kereta, Mobil"
                />
              </div>

              {/* Transportasi Utama */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Pagu Transportasi</label>
                  <input
                    type="number"
                    value={transport.paguTransportasiPulang}
                    onChange={(e) => handleTransportasiChange(transport.hari, 'paguTransportasiPulang', e.target.value)}
                    disabled={!isEditable}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Biaya Aktual</label>
                  <input
                    type="number"
                    value={transport.biayaAktualTransportasiPulang}
                    onChange={(e) => handleTransportasiChange(transport.hari, 'biayaAktualTransportasiPulang', e.target.value)}
                    disabled={!isEditable}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Taxi */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Pagu Taxi</label>
                  <input
                    type="number"
                    value={transport.paguTaksiPulang}
                    onChange={(e) => handleTransportasiChange(transport.hari, 'paguTaksiPulang', e.target.value)}
                    disabled={!isEditable}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Biaya Aktual Taxi</label>
                  <input
                    type="number"
                    value={transport.biayaAktualTaksiPulang}
                    onChange={(e) => handleTransportasiChange(transport.hari, 'biayaAktualTaksiPulang', e.target.value)}
                    disabled={!isEditable}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Subtotal */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Subtotal Pulang:</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {formatRupiah(transport.subtotalPulang)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Hari */}
            <div className="mt-4 pt-3 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Hari ke-{transport.hari}:</span>
                <span className="text-lg font-bold text-gray-700">
                  {formatRupiah(transport.totalHari)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Grand Total */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total Transportasi ({jumlahHari} hari):</span>
            <span className="text-xl font-bold text-gray-700">
              {formatRupiah(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        *Input transportasi akan muncul sesuai jumlah hari perjalanan
      </p>
    </div>
  );
};

export default TransportasiMultiHariSection;