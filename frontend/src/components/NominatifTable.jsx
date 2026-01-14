import React, { useState, useEffect, useCallback } from 'react';
import NumberInput from './NumberInput';
import { calculateNominatifBiayaRow, getBudgetStatus, formatCurrency } from '../utils/calculations';
import { consoleError } from '../utils/logger';

/**
 * Excel-like Nominatif Biaya Table
 * Complete 53 fields implementation
 */
const NominatifTable = ({ data, onDataChange, onSave, loading = false }) => {
  const [tableData, setTableData] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Initialize table data
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setTableData(data);
    }
  }, [data]);

  // Auto-calculate when input fields change
  const handleCellChange = useCallback((rowIndex, field, value) => {
    if (calculating) return;

    setCalculating(true);

    try {
      const newData = [...tableData];
      const updatedRow = { ...newData[rowIndex], [field]: value };

      // Calculate ALL totals using SAME logic as backend
      const calculatedRow = calculateNominatifBiayaRow(updatedRow);
      newData[rowIndex] = calculatedRow;

      setTableData(newData);
      setHasChanges(true);
      onDataChange?.(newData);
    } catch (error) {
      consoleError('Calculation error:', error);
    } finally {
      setTimeout(() => setCalculating(false), 100); // Debounce calculations
    }
  }, [tableData, calculating, onDataChange]);

  // Column configuration for 53 fields
  const columns = [
    // TRANSPORTASI SECTION
    {
      field: 'transport_pesawat_non_pp_pagu',
      header: 'Pesawat Non-PP<br/>Pagu',
      type: 'currency',
      section: 'Transportasi',
      width: '120px'
    },
    {
      field: 'transport_pesawat_non_pp_aktual',
      header: 'Pesawat Non-PP<br/>Aktual',
      type: 'currency',
      width: '120px'
    },
    {
      field: 'transport_taksi_pagu',
      header: 'Taksi<br/>Pagu',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'transport_taksi_aktual',
      header: 'Taksi<br/>Aktual',
      type: 'currency',
      width: '100px'
    },

    // PENGINAPAN SECTION
    {
      field: 'penginapan_jumlah_malam',
      header: 'Jml<br/>Malam',
      type: 'number',
      section: 'Penginapan',
      width: '80px'
    },
    {
      field: 'penginapan_pagu_perhari',
      header: 'Pagu<br/>/Hari',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'penginapan_aktual_perhari',
      header: 'Aktual<br/>/Hari',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'penginapan_total_pagu',
      header: 'Total<br/>Pagu',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '100px'
    },
    {
      field: 'penginapan_total_aktual',
      header: 'Total<br/>Aktual',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '100px'
    },
    {
      field: 'penginapan_anggaran_berjalan',
      header: 'Anggaran<br/>Berjalan',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '120px'
    },

    // UANG HARIAN MEETING FULLBOARD
    {
      field: 'uang_harian_meeting_fullboard_jumlah_hari',
      header: 'Jml<br/>Hari',
      type: 'number',
      section: 'Uang Harian<br/>Meeting Fullboard',
      width: '80px'
    },
    {
      field: 'uang_harian_meeting_fullboard_pagu_perhari',
      header: 'Pagu<br/>/Hari',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'uang_harian_meeting_fullboard_aktual_perhari',
      header: 'Aktual<br/>/Hari',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'uang_harian_meeting_fullboard_total_pagu',
      header: 'Total<br/>Pagu',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '100px'
    },
    {
      field: 'uang_harian_meeting_fullboard_total_aktual',
      header: 'Total<br/>Aktual',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '100px'
    },
    {
      field: 'uang_harian_meeting_fullboard_anggaran_berjalan',
      header: 'Anggaran<br/>Berjalan',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '120px'
    },

    // UANG HARIAN MEETING FULLDAY
    {
      field: 'uang_harian_meeting_fullday_jumlah_hari',
      header: 'Jml<br/>Hari',
      type: 'number',
      section: 'Uang Harian<br/>Meeting Fullday',
      width: '80px'
    },
    {
      field: 'uang_harian_meeting_fullday_pagu_perhari',
      header: 'Pagu<br/>/Hari',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'uang_harian_meeting_fullday_aktual_perhari',
      header: 'Aktual<br/>/Hari',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'uang_harian_meeting_fullday_total_pagu',
      header: 'Total<br/>Pagu',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '100px'
    },
    {
      field: 'uang_harian_meeting_fullday_total_aktual',
      header: 'Total<br/>Aktual',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '100px'
    },
    {
      field: 'uang_harian_meeting_fullday_anggaran_berjalan',
      header: 'Anggaran<br/>Berjalan',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '120px'
    },

    // UANG HARIAN LUAR KOTA
    {
      field: 'uang_harian_luar_kota_jumlah_hari',
      header: 'Jml<br/>Hari',
      type: 'number',
      section: 'Uang Harian<br/>Luar Kota',
      width: '80px'
    },
    {
      field: 'uang_harian_luar_kota_pagu_perhari',
      header: 'Pagu<br/>/Hari',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'uang_harian_luar_kota_aktual_perhari',
      header: 'Aktual<br/>/Hari',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'uang_harian_luar_kota_total_pagu',
      header: 'Total<br/>Pagu',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '100px'
    },
    {
      field: 'uang_harian_luar_kota_total_aktual',
      header: 'Total<br/>Aktual',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '100px'
    },
    {
      field: 'uang_harian_luar_kota_anggaran_berjalan',
      header: 'Anggaran<br/>Berjalan',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '120px'
    },

    // UANG HARIAN DALAM KOTA
    {
      field: 'uang_harian_dalam_kota_jumlah_hari',
      header: 'Jml<br/>Hari',
      type: 'number',
      section: 'Uang Harian<br/>Dalam Kota',
      width: '80px'
    },
    {
      field: 'uang_harian_dalam_kota_pagu_perhari',
      header: 'Pagu<br/>/Hari',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'uang_harian_dalam_kota_aktual_perhari',
      header: 'Aktual<br/>/Hari',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'uang_harian_dalam_kota_total_pagu',
      header: 'Total<br/>Pagu',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '100px'
    },
    {
      field: 'uang_harian_dalam_kota_total_aktual',
      header: 'Total<br/>Aktual',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '100px'
    },
    {
      field: 'uang_harian_dalam_kota_anggaran_berjalan',
      header: 'Anggaran<br/>Berjalan',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '120px'
    },

    // REPRESENTASI LUAR KOTA
    {
      field: 'representasi_luar_kota_jumlah_hari',
      header: 'Jml<br/>Hari',
      type: 'number',
      section: 'Representasi<br/>Luar Kota',
      width: '80px'
    },
    {
      field: 'representasi_luar_kota_pagu_perhari',
      header: 'Pagu<br/>/Hari',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'representasi_luar_kota_aktual_perhari',
      header: 'Aktual<br/>/Hari',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'representasi_luar_kota_total_pagu',
      header: 'Total<br/>Pagu',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '100px'
    },
    {
      field: 'representasi_luar_kota_total_aktual',
      header: 'Total<br/>Aktual',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '100px'
    },
    {
      field: 'representasi_luar_kota_anggaran_berjalan',
      header: 'Anggaran<br/>Berjalan',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '120px'
    },

    // REPRESENTASI DALAM KOTA
    {
      field: 'representasi_dalam_kota_jumlah_hari',
      header: 'Jml<br/>Hari',
      type: 'number',
      section: 'Representasi<br/>Dalam Kota',
      width: '80px'
    },
    {
      field: 'representasi_dalam_kota_pagu_perhari',
      header: 'Pagu<br/>/Hari',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'representasi_dalam_kota_aktual_perhari',
      header: 'Aktual<br/>/Hari',
      type: 'currency',
      width: '100px'
    },
    {
      field: 'representasi_dalam_kota_total_pagu',
      header: 'Total<br/>Pagu',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '100px'
    },
    {
      field: 'representasi_dalam_kota_total_aktual',
      header: 'Total<br/>Aktual',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '100px'
    },
    {
      field: 'representasi_dalam_kota_anggaran_berjalan',
      header: 'Anggaran<br/>Berjalan',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '120px'
    },

    // GRAND TOTALS
    {
      field: 'total_pagu_row',
      header: 'TOTAL<br/>PAGU',
      type: 'currency',
      readOnly: true,
      calculated: true,
      section: 'Grand Totals',
      width: '120px'
    },
    {
      field: 'total_aktual_row',
      header: 'TOTAL<br/>AKTUAL',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '120px'
    },
    {
      field: 'total_anggaran_berjalan_row',
      header: 'TOTAL<br/>ANGGARAN<br/>BERJALAN',
      type: 'currency',
      readOnly: true,
      calculated: true,
      width: '140px'
    },
  ];

  // Render cell with NumberInput
  const renderCell = (row, column, rowIndex) => {
    const value = row[column.field] || 0;
    const isCalculated = column.calculated;

    let cellClassName = 'px-2 py-1 border relative ';

    // Add styling for calculated fields
    if (isCalculated) {
      cellClassName += 'bg-blue-50 ';
    }

    // Add styling for grand totals
    if (column.section === 'Grand Totals') {
      cellClassName += 'bg-green-100 font-bold ';
    }

    // Add styling for anggaran berjalan columns
    if (column.field.includes('anggaran_berjalan')) {
      const budgetStatus = getBudgetStatus(value);
      cellClassName += `${budgetStatus.bgColor} `;
    }

    return (
      <td
        key={column.field}
        className={cellClassName.trim()}
        style={{ width: column.width }}
      >
        <NumberInput
          value={value}
          onChange={(newValue) => handleCellChange(rowIndex, column.field, newValue)}
          type={column.type}
          readOnly={column.readOnly}
          showCurrency={column.type === 'currency'}
          field={column.field}
          showError={!isCalculated} // Don't show errors for calculated fields
        />

        {isCalculated && (
          <div className="absolute top-0 right-0 text-xs bg-blue-600 text-white px-1 rounded-bl">
            ⚡
          </div>
        )}
      </td>
    );
  };

  // Render header with sections
  const renderHeader = () => {
    return columns.map((column, index) => {
      let headerClassName = 'px-2 py-2 border text-center ';

      if (column.section) {
        headerClassName += 'bg-gray-100 ';
      } else {
        headerClassName += 'bg-gray-50 ';
      }

      return (
        <th
          key={column.field}
          className={headerClassName}
          style={{ width: column.width }}
        >
          {column.section && index === 0 || (index > 0 && columns[index-1].section !== column.section) ? (
            <div className="text-xs text-gray-600 font-semibold mb-1">
              {column.section}
            </div>
          ) : null}
          <div
            className={`font-medium ${column.calculated ? 'text-blue-700' : 'text-gray-800'} ${column.section === 'Grand Totals' ? 'text-lg' : ''}`}
            dangerouslySetInnerHTML={{ __html: column.header }}
          />
        </th>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Calculation indicator */}
      {calculating && (
        <div className="text-xs text-blue-600 mb-2 text-right">
          🔄 Calculating...
        </div>
      )}

      {/* Changes indicator */}
      {hasChanges && (
        <div className="text-xs text-orange-600 mb-2 text-right">
          ⚠️ You have unsaved changes
        </div>
      )}

      {/* Excel-like table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full bg-white">
          <thead>
            <tr>{renderHeader()}</tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => renderCell(row, column, rowIndex))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save button */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {tableData.length} rows | 53 fields | Real-time calculations enabled
        </div>

        <button
          onClick={() => onSave?.(tableData)}
          disabled={!hasChanges || loading}
          className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
            hasChanges && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-600">
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-white border rounded"></span> Input Field
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-50 border rounded"></span> Calculated Field
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-100 border rounded"></span> Grand Total
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-50 border rounded"></span> Over Budget
          </span>
        </div>
      </div>
    </div>
  );
};

export default NominatifTable;