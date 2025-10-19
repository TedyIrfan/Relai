import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatBarData } from '../../utils/chartConfig';
import { formatCurrency } from '../../utils/currency';

const BarChart = ({ categories, loading = false }) => {
  const data = formatBarData(categories);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // Custom YAxis tick formatter - Logarithmic Scale version
  const formatYAxis = (value) => {
    if (value >= 1000000000000) {
      return `${(value / 1000000000000).toFixed(1)}T`;
    }
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}M`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}JT`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}RB`;
    }
    return value.toString();
  };

  // Logarithmic scale tick formatter
  const formatYAxisLog = (value) => {
    // Untuk log scale, kita perlu format yang lebih detail
    if (value >= 1000000000000) {
      return `${(value / 1000000000000).toFixed(1)}T`;
    }
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}M`;
    }
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}M`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}JT`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}RB`;
    }
    if (value >= 1) {
      return value.toString();
    }
    return value.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Tidak ada data kategori</p>
          <p className="text-sm">Kategori anggaran belum tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-2xl shadow-lg bg-gradient-to-b from-white to-gray-200">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Anggaran per Kategori
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Logarithmic Scale - Semua data terlihat proporsional
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            scale="log"
            domain={[1, 'dataMax']}
            tickFormatter={formatYAxisLog}
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={{ stroke: '#E5E7EB' }}
            label={{ value: 'Anggaran (Log Scale)', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 10 } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="anggaran" radius={[12, 12, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-6 pt-6 border-t border-gray-300">
        <div className="text-center">
          <p className="text-sm text-gray-500">Total Anggaran Semua Kategori</p>
          <p className="text-lg font-semibold text-gray-800">
            {formatCurrency(data.reduce((sum, item) => sum + item.anggaran, 0))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarChart;