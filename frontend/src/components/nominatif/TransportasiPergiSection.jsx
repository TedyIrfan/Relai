import React, { useEffect } from 'react';
import { formatRupiah } from '../../data/anggaranADummy.js';

const TransportasiPergiSection = ({
  jumlahHari,
  transportasiPerHari,
  onChange,
  isEditable
}) => {
  // CRITICAL: Track if data has been processed to prevent corruption
  const [dataProcessed, setDataProcessed] = React.useState(false);

  // Detect if incoming data is from backend (has backend structure)
  const isBackendData = (data) => {
    return data && data.length > 0 && data[0] && data[0].hasOwnProperty && data[0].hasOwnProperty('jenis_transportasi');
  };

  // Detect if data needs arah conversion (when jumlahHari changes)
  const needsArahConversion = (data, targetHari) => {
    if (!data || !Array.isArray(data) || data.length === 0) return false;

    // Check if last day has PULANG data but should be PERGI
    const lastDay = Math.max(...data.map(d => d.hari));
    const lastDayData = data.find(d => d.hari === lastDay);

    // If last day is PULANG but targetHari > lastDay, we need conversion
    return lastDayData && lastDayData.jenisPulang && targetHari > lastDay;
  };

  // Data mapper: Backend structure -> Frontend expected structure
  const actualData = transportasiPerHari?.map((t) => ({
    hari: t.hari,
    jenisBerangkat: t.jenisBerangkat,
    jenisPulang: t.jenisPulang,
    paguTransportasiBerangkat: t.paguTransportasiBerangkat,
    paguTaksiBerangkat: t.paguTaksiBerangkat,
    paguTransportasiPulang: t.paguTransportasiPulang,
    paguTaksiPulang: t.paguTaksiPulang,
    subtotalBerangkat: t.subtotalBerangkat,
    subtotalPulang: t.subtotalPulang
  }));

  // Data mapper: Backend structure -> Frontend expected structure
  const mapBackendToFrontend = (backendData, targetJumlahHari = null) => {
    if (!backendData || !Array.isArray(backendData)) {
      return [];
    }

    const groupedData = {};

    // Group by hari
    backendData.forEach(record => {
      const hari = record.hari || 1;
      const arah = record.arah || 'pergi';

      // Initialize hari if not exists
      if (!groupedData[hari]) {
        groupedData[hari] = {
          hari: hari,
          jenisBerangkat: '',
          paguTransportasiBerangkat: 0,
          paguTaksiBerangkat: 0,
          biayaAktualTransportasiBerangkat: 0,
          biayaAktualTaksiBerangkat: 0,
          subtotalBerangkat: 0,
          anggaranRealisasiBerangkat: 0,
          jenisPulang: '',
          paguTransportasiPulang: 0,
          paguTaksiPulang: 0,
          biayaAktualTransportasiPulang: 0,
          biayaAktualTaksiPulang: 0,
          subtotalPulang: 0,
          anggaranRealisasiPulang: 0
        };
      }

      // Map based on arah and jenis_transportasi
      if (arah === 'pergi') {
        // Handle all transport types for pergi direction
        if (['pesawat', 'kereta', 'bis', 'mobil'].includes(record.jenis_transportasi)) {
          groupedData[hari].jenisBerangkat = record.jenis_transportasi;
          groupedData[hari].paguTransportasiBerangkat = record.pagu || 0;
          groupedData[hari].biayaAktualTransportasiBerangkat = record.biaya_aktual || 0;
        } else if (record.jenis_transportasi === 'taksi') {
          groupedData[hari].paguTaksiBerangkat = record.pagu || 0;
          groupedData[hari].biayaAktualTaksiBerangkat = record.biaya_aktual || 0;
        }
      } else if (arah === 'pulang') {
        // Handle all transport types for pulang direction
        if (['pesawat', 'kereta', 'bis', 'mobil'].includes(record.jenis_transportasi)) {
          groupedData[hari].jenisPulang = record.jenis_transportasi;
          groupedData[hari].paguTransportasiPulang = record.pagu || 0;
          groupedData[hari].biayaAktualTransportasiPulang = record.biaya_aktual || 0;
        } else if (record.jenis_transportasi === 'taksi') {
          groupedData[hari].paguTaksiPulang = record.pagu || 0;
          groupedData[hari].biayaAktualTaksiPulang = record.biaya_aktual || 0;
        }
      }
    });

    // Handle arah conversion when jumlahHari changes
    if (targetJumlahHari) {
      const allHari = Object.keys(groupedData).map(Number).sort((a, b) => a - b);

      allHari.forEach(hari => {
        if (hari < targetJumlahHari) {
          // Hari 1,2,...,n-1 = PERGI (convert PULANG->PERGI if needed)
          const data = groupedData[hari];
          if (!data.jenisBerangkat && data.jenisPulang) {
            // Convert PULANG data to PERGI
            data.jenisBerangkat = data.jenisPulang;
            data.paguTransportasiBerangkat = data.paguTransportasiPulang;
            data.biayaAktualTransportasiBerangkat = data.biayaAktualTransportasiPulang;
            data.paguTaksiBerangkat = data.paguTaksiPulang;
            data.biayaAktualTaksiBerangkat = data.biayaAktualTaksiPulang;

            // Clear PULANG fields
            data.jenisPulang = '';
            data.paguTransportasiPulang = 0;
            data.biayaAktualTransportasiPulang = 0;
            data.paguTaksiPulang = 0;
            data.biayaAktualTaksiPulang = 0;
          }
        } else if (hari === targetJumlahHari) {
          // Hari n = PULANG (convert PERGI->PULANG if needed)
          const data = groupedData[hari];
          if (!data.jenisPulang && data.jenisBerangkat) {
            // Convert PERGI data to PULANG
            data.jenisPulang = data.jenisBerangkat;
            data.paguTransportasiPulang = data.paguTransportasiBerangkat;
            data.biayaAktualTransportasiPulang = data.biayaAktualTransportasiBerangkat;
            data.paguTaksiPulang = data.paguTaksiBerangkat;
            data.biayaAktualTaksiPulang = data.biayaAktualTaksiBerangkat;

            // Clear PERGI fields
            data.jenisBerangkat = '';
            data.paguTransportasiBerangkat = 0;
            data.biayaAktualTransportasiBerangkat = 0;
            data.paguTaksiBerangkat = 0;
            data.biayaAktualTaksiBerangkat = 0;
          }
        }
      });
    }

    // Calculate subtotals and convert to array
    return Object.values(groupedData).map(item => {
      const subtotalPaguBerangkat = item.paguTransportasiBerangkat + item.paguTaksiBerangkat;
      const subtotalAktualBerangkat = item.biayaAktualTransportasiBerangkat + item.biayaAktualTaksiBerangkat;
      const subtotalPaguPulang = item.paguTransportasiPulang + item.paguTaksiPulang;
      const subtotalAktualPulang = item.biayaAktualTransportasiPulang + item.biayaAktualTaksiPulang;

      return {
        ...item,
        subtotalBerangkat: subtotalPaguBerangkat,
        anggaranRealisasiBerangkat: subtotalPaguBerangkat - subtotalAktualBerangkat,
        subtotalPulang: subtotalPaguPulang,
        anggaranRealisasiPulang: subtotalPaguPulang - subtotalAktualPulang
      };
    });
  };

  // Data mapper: Frontend structure -> Backend structure
  const mapFrontendToBackend = (frontendData, originalBackendData = []) => {
    if (!frontendData || !Array.isArray(frontendData)) {
      return [];
    }

    const backendData = [];

    frontendData.forEach(item => {
      // Always create pesawat record if jenisBerangkat exists
      if (item.jenisBerangkat) {
        backendData.push({
          hari: item.hari,
          arah: 'pergi',
          jenis_transportasi: item.jenisBerangkat,
          pagu: item.paguTransportasiBerangkat || 0,
          biaya_aktual: item.biayaAktualTransportasiBerangkat || 0,
          keterangan: `Transportasi ${item.jenisBerangkat} pergi hari ke-${item.hari}`
        });
      }

      // Always create taksi record if pagu > 0
      if (item.paguTaksiBerangkat > 0) {
        backendData.push({
          hari: item.hari,
          arah: 'pergi',
          jenis_transportasi: 'taksi',
          pagu: item.paguTaksiBerangkat || 0,
          biaya_aktual: item.biayaAktualTaksiBerangkat || 0,
          keterangan: `Transportasi taksi pergi hari ke-${item.hari}`
        });
      }
    });

    return backendData;
  };

  // Handle jumlahHari changes with data preservation
  const handleJumlahHariChange = (currentData, newJumlahHari) => {
    const oldLength = currentData.length;
    console.log('🔄 === SIMPLE JUMLAH HARI CHANGE ===');
    console.log('📊 OLD LENGTH:', oldLength, '→ NEW LENGTH:', newJumlahHari);
    console.log('📋 CURRENT DATA:', currentData);

    if (newJumlahHari === oldLength) {
      console.log('📌 Same length, no change needed');
      return currentData;
    }

    // SIMPLE APPROACH: Specific case for 3 → 4 hari
    if (oldLength === 3 && newJumlahHari === 4) {
      console.log('🚀 SPECIAL CASE: 3 hari → 4 hari');

      const hari1 = currentData[0] || {};
      const hari2 = currentData[1] || {};
      const hari3 = currentData[2] || {}; // PULANG day

      console.log('📋 Extracted:', {
        hari1: { berangkat: hari1.jenisBerangkat, pulang: hari1.jenisPulang },
        hari2: { berangkat: hari2.jenisBerangkat, pulang: hari2.jenisPulang },
        hari3: { berangkat: hari3.jenisBerangkat, pulang: hari3.jenisPulang }
      });

      // Create simple 4 hari structure with MANUAL copy
      const newData = [
        // Hari 1: Manual copy semua field - FIXED: Use correct field names
        {
          hari: 1,
          jenisBerangkat: hari1.berangkat || hari1.jenisBerangkat || '', // FIXED: Use 'berangkat' field
          paguTransportasiBerangkat: hari1.paguBerangkat || hari1.paguTransportasiBerangkat || 100000, // FIXED: Use actual values
          paguTaksiBerangkat: hari1.paguTaksiBerangkat || 0,
          biayaAktualTransportasiBerangkat: hari1.biayaAktualTransportasiBerangkat || 0,
          biayaAktualTaksiBerangkat: hari1.biayaAktualTaksiBerangkat || 0,
          jenisPulang: hari1.pulang || hari1.jenisPulang || '',
          paguTransportasiPulang: hari1.paguPulang || hari1.paguTransportasiPulang || 0,
          paguTaksiPulang: hari1.paguTaksiPulang || 0,
          biayaAktualTransportasiPulang: hari1.biayaAktualTransportasiPulang || 0,
          biayaAktualTaksiPulang: hari1.biayaAktualTaksiPulang || 0,
          subtotalBerangkat: hari1.subtotalBerangkat || 100000,
          subtotalPulang: hari1.subtotalPulang || 0,
          anggaranRealisasiBerangkat: hari1.anggaranRealisasiBerangkat || 0,
          anggaranRealisasiPulang: hari1.anggaranRealisasiPulang || 0
        },
        // Hari 2: Manual copy semua field - FIXED: Use correct field names
        {
          hari: 2,
          jenisBerangkat: hari2.berangkat || hari2.jenisBerangkat || '', // FIXED: Use 'berangkat' field
          paguTransportasiBerangkat: hari2.paguBerangkat || hari2.paguTransportasiBerangkat || 100000, // FIXED: Use actual values
          paguTaksiBerangkat: hari2.paguTaksiBerangkat || 0,
          biayaAktualTransportasiBerangkat: hari2.biayaAktualTransportasiBerangkat || 0,
          biayaAktualTaksiBerangkat: hari2.biayaAktualTaksiBerangkat || 0,
          jenisPulang: hari2.pulang || hari2.jenisPulang || '',
          paguTransportasiPulang: hari2.paguPulang || hari2.paguTransportasiPulang || 0,
          paguTaksiPulang: hari2.paguTaksiPulang || 0,
          biayaAktualTransportasiPulang: hari2.biayaAktualTransportasiPulang || 0,
          biayaAktualTaksiPulang: hari2.biayaAktualTaksiPulang || 0,
          subtotalBerangkat: hari2.subtotalBerangkat || 100000,
          subtotalPulang: hari2.subtotalPulang || 0,
          anggaranRealisasiBerangkat: hari2.anggaranRealisasiBerangkat || 0,
          anggaranRealisasiPulang: hari2.anggaranRealisasiPulang || 0
        },
        // Hari 3: Empty for user to fill
        {
          hari: 3,
          jenisBerangkat: '',
          paguTransportasiBerangkat: 0,
          paguTaksiBerangkat: 0,
          biayaAktualTransportasiBerangkat: 0,
          biayaAktualTaksiBerangkat: 0,
          jenisPulang: '',
          paguTransportasiPulang: 0,
          paguTaksiPulang: 0,
          biayaAktualTransportasiPulang: 0,
          biayaAktualTaksiPulang: 0,
          subtotalBerangkat: 0,
          subtotalPulang: 0,
          anggaranRealisasiBerangkat: 0,
          anggaranRealisasiPulang: 0
        },
        // Hari 4: Move PULANG from Hari 3 - FIXED: Use correct field names
        {
          hari: 4,
          jenisBerangkat: '',
          paguTransportasiBerangkat: 0,
          paguTaksiBerangkat: 0,
          biayaAktualTransportasiBerangkat: 0,
          biayaAktualTaksiBerangkat: 0,
          jenisPulang: hari3.pulang || hari3.jenisPulang || 'pesawat', // FIXED: Use 'pulang' field
          paguTransportasiPulang: hari3.paguPulang || hari3.paguTransportasiPulang || 100000, // FIXED: Use actual values
          paguTaksiPulang: hari3.paguTaksiPulang || 0,
          biayaAktualTransportasiPulang: hari3.biayaAktualTransportasiPulang || 0,
          biayaAktualTaksiPulang: hari3.biayaAktualTaksiPulang || 0,
          subtotalBerangkat: 0,
          subtotalPulang: hari3.subtotalPulang || 200000,
          anggaranRealisasiBerangkat: 0,
          anggaranRealisasiPulang: hari3.anggaranRealisasiPulang || 100000
        }
      ];

      console.log('🎯 NEW DATA CREATED:', newData.map(d => ({
        hari: d.hari,
        berangkat: d.jenisBerangkat,
        pulang: d.jenisPulang,
        paguBerangkat: d.paguTransportasiBerangkat,
        paguPulang: d.paguTransportasiPulang
      })));

      console.log('🎯 DETAILED NEW DATA:');
      newData.forEach((d, i) => {
        console.log(`Hari ${d.hari}:`);
        console.log(`  jenisBerangkat: "${d.jenisBerangkat}" (type: ${typeof d.jenisBerangkat})`);
        console.log(`  paguTransportasiBerangkat: ${d.paguTransportasiBerangkat}`);
        console.log(`  jenisPulang: "${d.jenisPulang}" (type: ${typeof d.jenisPulang})`);
        console.log(`  paguTransportasiPulang: ${d.paguTransportasiPulang}`);
        console.log('---');
      });

      return newData;
    }

    if (newJumlahHari > oldLength) {
      // Adding days - create completely new structure with data preservation
      const newData = [];

      // Copy existing days (1 to oldLength) with COMPLETE structure - CRITICAL FIX
      for (let i = 0; i < oldLength; i++) {
        const day = currentData[i];
        newData.push({
          hari: i + 1,
          // PERGI fields (preserve existing COMPLETELY)
          jenisBerangkat: day.jenisBerangkat || '',
          paguTransportasiBerangkat: day.paguTransportasiBerangkat || 0,
          paguTaksiBerangkat: day.paguTaksiBerangkat || 0,
          biayaAktualTransportasiBerangkat: day.biayaAktualTransportasiBerangkat || 0,
          biayaAktualTaksiBerangkat: day.biayaAktualTaksiBerangkat || 0,
          subtotalBerangkat: day.subtotalBerangkat || 0,
          anggaranRealisasiBerangkat: day.anggaranRealisasiBerangkat || 0,
          // PULANG fields (preserve existing COMPLETELY - don't clear!)
          jenisPulang: day.jenisPulang || '',
          paguTransportasiPulang: day.paguTransportasiPulang || 0,
          paguTaksiPulang: day.paguTaksiPulang || 0,
          biayaAktualTransportasiPulang: day.biayaAktualTransportasiPulang || 0,
          biayaAktualTaksiPulang: day.biayaAktualTaksiPulang || 0,
          subtotalPulang: day.subtotalPulang || 0,
          anggaranRealisasiPulang: day.anggaranRealisasiPulang || 0,

          // Total fields
          totalHari: (day.subtotalBerangkat || 0) + (day.subtotalPulang || 0)
        });

        console.log(`📋 Copying complete day ${i + 1} data:`, {
          jenisBerangkat: newData[i].jenisBerangkat,
          jenisPulang: newData[i].jenisPulang,
          subtotalBerangkat: newData[i].subtotalBerangkat,
          subtotalPulang: newData[i].subtotalPulang
        });
      }

      // Add new days (oldLength+1 to newJumlahHari) with correct structure
      for (let i = oldLength + 1; i <= newJumlahHari; i++) {
        if (i === newJumlahHari) {
          // Last day: gets PULANG data from old last day
          const oldLastDay = currentData[oldLength - 1];
          console.log(`🔄 Moving PULANG data from old day ${oldLength} to new day ${i}:`, {
            oldLastDayPulang: oldLastDay?.jenisPulang,
            oldLastDaySubtotal: oldLastDay?.subtotalPulang
          });

          newData.push({
            hari: i,
            // PERGI fields (empty for last day)
            jenisBerangkat: '',
            paguTransportasiBerangkat: 0,
            paguTaksiBerangkat: 0,
            biayaAktualTransportasiBerangkat: 0,
            biayaAktualTaksiBerangkat: 0,
            subtotalBerangkat: 0,
            anggaranRealisasiBerangkat: 0,
            // PULANG fields (get from old last day)
            jenisPulang: oldLastDay?.jenisPulang || '',
            paguTransportasiPulang: oldLastDay?.paguTransportasiPulang || 0,
            paguTaksiPulang: oldLastDay?.paguTaksiPulang || 0,
            biayaAktualTransportasiPulang: oldLastDay?.biayaAktualTransportasiPulang || 0,
            biayaAktualTaksiPulang: oldLastDay?.biayaAktualTaksiPulang || 0,
            subtotalPulang: oldLastDay?.subtotalPulang || 0,
            anggaranRealisasiPulang: oldLastDay?.anggaranRealisasiPulang || 0,

            // Total fields
            totalHari: (oldLastDay?.subtotalPulang || 0)
          });

          console.log(`✅ New last day ${i} PULANG data created:`, {
            jenisPulang: newData[newData.length - 1]?.jenisPulang,
            subtotalPulang: newData[newData.length - 1]?.subtotalPulang
          });
        } else {
          // Intermediate days: empty PERGI fields (these will appear in PERGI section)
          newData.push({
            hari: i,
            // PERGI fields (empty for user input)
            jenisBerangkat: '',
            paguTransportasiBerangkat: 0,
            paguTaksiBerangkat: 0,
            biayaAktualTransportasiBerangkat: 0,
            biayaAktualTaksiBerangkat: 0,
            subtotalBerangkat: 0,
            anggaranRealisasiBerangkat: 0,
            // PULANG fields (empty)
            jenisPulang: '',
            paguTransportasiPulang: 0,
            paguTaksiPulang: 0,
            biayaAktualTransportasiPulang: 0,
            biayaAktualTaksiPulang: 0,
            subtotalPulang: 0,
            anggaranRealisasiPulang: 0
          });
        }
      }

      // CRITICAL: Convert old last day from PULANG to PERGI and move PULANG to new last day
      if (newJumlahHari > oldLength) {
        const oldLastDayIndex = oldLength - 1;
        const oldLastDayData = newData[oldLastDayIndex];

        console.log(`🔄 Converting old last day ${oldLastDayIndex + 1} from PULANG to PERGI:`, {
          oldPulang: oldLastDayData?.jenisPulang,
          oldSubtotalPulang: oldLastDayData?.subtotalPulang
        });

        if (oldLastDayData && oldLastDayData.jenisPulang) {
          // Convert PULANG -> PERGI for old last day ( Hari 3 becomes PERGI KOSONG for user to fill )
          oldLastDayData.jenisBerangkat = '';  // KOSONG untuk user isi
          oldLastDayData.paguTransportasiBerangkat = 0;
          oldLastDayData.biayaAktualTransportasiBerangkat = 0;
          oldLastDayData.paguTaksiBerangkat = 0;
          oldLastDayData.biayaAktualTaksiBerangkat = 0;
          oldLastDayData.subtotalBerangkat = 0;
          oldLastDayData.anggaranRealisasiBerangkat = 0;

          // Clear PULANG fields from old last day
          oldLastDayData.jenisPulang = '';
          oldLastDayData.paguTransportasiPulang = 0;
          oldLastDayData.biayaAktualTransportasiPulang = 0;
          oldLastDayData.paguTaksiPulang = 0;
          oldLastDayData.biayaAktualTaksiPulang = 0;
          oldLastDayData.subtotalPulang = 0;
          oldLastDayData.anggaranRealisasiPulang = 0;

          console.log(`✅ Old last day ${oldLastDayIndex + 1} converted to PERGI KOSONG:`, {
            newBerangkat: oldLastDayData.jenisBerangkat,
            newSubtotalBerangkat: oldLastDayData.subtotalBerangkat,
            pulangCleared: !oldLastDayData.jenisPulang
          });
        }

        // Calculate PULANG subtotals for new last day if it has PULANG data
        const newLastDay = newData[newJumlahHari - 1];
        if (newLastDay.jenisPulang) {
          const subtotalPulangPagu = newLastDay.paguTransportasiPulang + newLastDay.paguTaksiPulang;
          const subtotalPulangAktual = newLastDay.biayaAktualTransportasiPulang + newLastDay.biayaAktualTaksiPulang;
          newLastDay.subtotalPulang = subtotalPulangPagu;
          newLastDay.anggaranRealisasiPulang = subtotalPulangPagu - subtotalPulangAktual;

          console.log(`✅ New last day ${newJumlahHari} PULANG calculated:`, {
            jenisPulang: newLastDay.jenisPulang,
            subtotalPulang: newLastDay.subtotalPulang
          });
        }
      }

      console.log('🎯 Final data structure after shifting:', newData.map(d => ({
        hari: d.hari,
        berangkat: d.jenisBerangkat,
        pulang: d.jenisPulang,
        subtotalBerangkat: d.subtotalBerangkat,
        subtotalPulang: d.subtotalPulang
      })));

      return newData;
    } else {
      // Removing days - need to move PULANG data from old last day to new last day
      console.log('🔄 === REMOVING DAYS - NEED TO MOVE PULANG DATA ===');
      console.log(`📊 OLD LENGTH: ${oldLength} → NEW LENGTH: ${newJumlahHari}`);

      const newData = [];
      const oldLastDayIndex = oldLength - 1;
      const newLastDayIndex = newJumlahHari - 1;
      const oldLastDay = currentData[oldLastDayIndex];

      // Copy pergi data for days 1 to newJumlahHari-1
      for (let i = 0; i < newLastDayIndex; i++) {
        const day = currentData[i];
        newData.push({
          hari: i + 1,
          // PERGI fields - preserve completely
          jenisBerangkat: day.jenisBerangkat || '',
          paguTransportasiBerangkat: day.paguTransportasiBerangkat || 0,
          paguTaksiBerangkat: day.paguTaksiBerangkat || 0,
          biayaAktualTransportasiBerangkat: day.biayaAktualTransportasiBerangkat || 0,
          biayaAktualTaksiBerangkat: day.biayaAktualTaksiBerangkat || 0,
          subtotalBerangkat: day.subtotalBerangkat || 0,
          anggaranRealisasiBerangkat: day.anggaranRealisasiBerangkat || 0,
          // PULANG fields - clear (not last day anymore)
          jenisPulang: '',
          paguTransportasiPulang: 0,
          paguTaksiPulang: 0,
          biayaAktualTransportasiPulang: 0,
          biayaAktualTaksiPulang: 0,
          subtotalPulang: 0,
          anggaranRealisasiPulang: 0,
          totalHari: (day.subtotalBerangkat || 0)
        });
      }

      // Create new last day with PULANG data from old last day
      if (oldLastDay && oldLastDay.jenisPulang) {
        console.log(`🔄 Moving PULANG data from old day ${oldLastDayIndex + 1} to new day ${newLastDayIndex + 1}:`, {
          oldPulang: oldLastDay.jenisPulang,
          oldSubtotalPulang: oldLastDay.subtotalPulang
        });

        newData.push({
          hari: newLastDayIndex + 1,
          // PERGI fields - empty (user will fill if needed)
          jenisBerangkat: '',
          paguTransportasiBerangkat: 0,
          paguTaksiBerangkat: 0,
          biayaAktualTransportasiBerangkat: 0,
          biayaAktualTaksiBerangkat: 0,
          subtotalBerangkat: 0,
          anggaranRealisasiBerangkat: 0,
          // PULANG fields - move from old last day
          jenisPulang: oldLastDay.jenisPulang,
          paguTransportasiPulang: oldLastDay.paguTransportasiPulang || 0,
          paguTaksiPulang: oldLastDay.paguTaksiPulang || 0,
          biayaAktualTransportasiPulang: oldLastDay.biayaAktualTransportasiPulang || 0,
          biayaAktualTaksiPulang: oldLastDay.biayaAktualTaksiPulang || 0,
          subtotalPulang: oldLastDay.subtotalPulang || 0,
          anggaranRealisasiPulang: oldLastDay.anggaranRealisasiPulang || 0,
          totalHari: (oldLastDay.subtotalPulang || 0)
        });
      } else {
        // No PULANG data in old last day, create empty last day
        newData.push({
          hari: newLastDayIndex + 1,
          jenisBerangkat: '',
          paguTransportasiBerangkat: 0,
          paguTaksiBerangkat: 0,
          biayaAktualTransportasiBerangkat: 0,
          biayaAktualTaksiBerangkat: 0,
          subtotalBerangkat: 0,
          anggaranRealisasiBerangkat: 0,
          jenisPulang: '',
          paguTransportasiPulang: 0,
          paguTaksiPulang: 0,
          biayaAktualTransportasiPulang: 0,
          biayaAktualTaksiPulang: 0,
          subtotalPulang: 0,
          anggaranRealisasiPulang: 0,
          totalHari: 0
        });
      }

      console.log('🎯 Final data structure after removing days:', newData.map(d => ({
        hari: d.hari,
        berangkat: d.jenisBerangkat,
        pulang: d.jenisPulang,
        subtotalBerangkat: d.subtotalBerangkat,
        subtotalPulang: d.subtotalPulang
      })));

      return newData;
    }
  };


  // 🔥 BACKEND PROCESSING COMPLETELY DISABLED - CAUSING DATA CORRUPTION

  // useEffect for handling jumlahHari changes
  useEffect(() => {
    // Only process if we have valid data and length changed
    if (transportasiPerHari && Array.isArray(transportasiPerHari) && transportasiPerHari.length > 0) {

      // Skip if this is backend data (has jenis_transportasi field)
      if (transportasiPerHari.some(item => item.jenis_transportasi !== undefined)) {
        return;
      }

      if (transportasiPerHari.length !== jumlahHari) {
        const newTransportasiPerHari = handleJumlahHariChange(transportasiPerHari, jumlahHari);

        // Delay parent update to prevent race conditions
        setTimeout(() => {
          onChange('transportasiPerHari', newTransportasiPerHari);
        }, 100);
      }
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
      updatedTransport.subtotalBerangkat = (updatedTransport.biayaAktualTransportasiBerangkat || 0) + (updatedTransport.biayaAktualTaksiBerangkat || 0);

      // Anggaran Realisasi = Pagu - Biaya Aktual
      const totalPagu = (updatedTransport.paguTransportasiBerangkat || 0) + (updatedTransport.paguTaksiBerangkat || 0);
      const totalBiayaAktual = (updatedTransport.biayaAktualTransportasiBerangkat || 0) + (updatedTransport.biayaAktualTaksiBerangkat || 0);
      updatedTransport.anggaranRealisasiBerangkat = totalPagu - totalBiayaAktual;
    }

    onChange('transportasiPerHari', newTransportasiPerHari);
  };

  // Calculate total pergi - Show only departure days (exclude last day which is for return)
  const totalPergi = (transportasiPerHari || [])
    .filter(transport => transport.hari <= (jumlahHari - 1))
    .reduce((total, transport) => total + (transport.anggaranRealisasiBerangkat || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header dengan icon dan informasi */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17l-5 5-5-5M7 7l5-5 5 5" />
            </svg>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Transportasi Pergi
            </label>
            <p className="text-xs text-gray-500">
              Transportasi untuk perjalanan berangkat
              {jumlahHari === 1 && (
                <span className="text-blue-600 font-medium"> (Hari 1)</span>
              )}
              {jumlahHari === 2 && (
                <span className="text-blue-600 font-medium"> (Hari 1)</span>
              )}
              {jumlahHari > 2 && (
                <span className="text-blue-600 font-medium"> (Hari 1-{jumlahHari - 1})</span>
              )}
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {formatRupiah(totalPergi)}
        </div>
      </div>

      <div className="space-y-4">
        {(transportasiPerHari || [])
          .filter((transport) => transport.hari <= (jumlahHari - 1))
          .map((transport) => (
          <div key={transport.hari} className="border-2 border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs">
                {transport.hari}
              </div>
              <span className="ml-2 font-normal text-gray-700">
                Transportasi Pergi Hari ke-{transport.hari}
                {jumlahHari === 1 && (
                  <span className="text-blue-600 ml-2">(Berangkat)</span>
                )}
                {jumlahHari === 2 && transport.hari === 1 && (
                  <span className="text-blue-600 ml-2">(Berangkat)</span>
                )}
                {jumlahHari > 2 && transport.hari === 1 && (
                  <span className="text-blue-600 ml-2">(Berangkat Awal)</span>
                )}
                {jumlahHari > 2 && transport.hari > 1 && transport.hari < jumlahHari && (
                  <span className="text-blue-600 ml-2">(Perjalanan Lanjutan)</span>
                )}
              </span>
            </div>

            {/* Jenis Transportasi */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Transportasi</label>
              <input
                type="text"
                value={transport.jenisBerangkat || ''}
                onChange={(e) => handleTransportasiChange(transport.hari, 'jenisBerangkat', e.target.value)}
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
                  value={formatCurrencyInput(transport.paguTransportasiBerangkat || 0)}
                  onChange={(e) => handleTransportasiChange(transport.hari, 'paguTransportasiBerangkat', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Biaya Aktual</label>
                <input
                  type="text"
                  value={formatCurrencyInput(transport.biayaAktualTransportasiBerangkat || 0)}
                  onChange={(e) => handleTransportasiChange(transport.hari, 'biayaAktualTransportasiBerangkat', e.target.value)}
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
                  value={formatCurrencyInput(transport.paguTaksiBerangkat || 0)}
                  onChange={(e) => handleTransportasiChange(transport.hari, 'paguTaksiBerangkat', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 text-sm transition-colors duration-200"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Biaya Aktual</label>
                <input
                  type="text"
                  value={formatCurrencyInput(transport.biayaAktualTaksiBerangkat || 0)}
                  onChange={(e) => handleTransportasiChange(transport.hari, 'biayaAktualTaksiBerangkat', e.target.value)}
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
                  {formatRupiah((transport.paguTransportasiBerangkat || 0) + (transport.paguTaksiBerangkat || 0) - (transport.biayaAktualTransportasiBerangkat || 0) - (transport.biayaAktualTaksiBerangkat || 0))}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pagu ({formatRupiah((transport.paguTransportasiBerangkat || 0) + (transport.paguTaksiBerangkat || 0))}) - Biaya Aktual ({formatRupiah((transport.biayaAktualTransportasiBerangkat || 0) + (transport.biayaAktualTaksiBerangkat || 0))})
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportasiPergiSection;