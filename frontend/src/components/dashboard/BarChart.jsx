import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { formatBarData } from '../../utils/chartConfig';
import { formatCurrency } from '../../utils/currency';

const BarChart = ({ categories, loading = false }) => {
  const data = formatBarData(categories);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
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
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
            formatter={(value) => <span className="text-xs">{value}</span>}
          />
          <Bar dataKey="anggaran" fill="#3B82F6" name="Total Anggaran" radius={[4, 4, 0, 0]} />
          <Bar dataKey="berjalan" fill="#F59E0B" name="Anggaran Berjalan" radius={[4, 4, 0, 0]} />
          <Bar dataKey="sp2d" fill="#10B981" name="Anggaran SP2D" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-6 pt-6 border-t border-gray-300">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Total Anggaran</p>
            <p className="text-sm font-semibold text-blue-600">
              {formatCurrency(data.reduce((sum, item) => sum + item.anggaran, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Berjalan</p>
            <p className="text-sm font-semibold text-orange-600">
              {formatCurrency(data.reduce((sum, item) => sum + (item.berjalan || 0), 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total SP2D</p>
            <p className="text-sm font-semibold text-green-600">
              {formatCurrency(data.reduce((sum, item) => sum + (item.sp2d || 0), 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bars per kategori */}
      <div className="mt-6 pt-6 border-t border-gray-300">
        <h4 className="text-sm font-semibold text-gray-700 mb-4 text-center">
          Progress Penggunaan per Kategori
        </h4>
        <div className="space-y-4">
          {data.map((category, index) => {
            const usagePercentage = category.anggaran > 0 ? (category.berjalan / category.anggaran) * 100 : 0;
            const sp2dPercentage = category.anggaran > 0 ? (category.sp2d / category.anggaran) * 100 : 0;
            const remainingPercentage = Math.max(0, 100 - usagePercentage - sp2dPercentage);

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  <span className="text-xs text-gray-500">
                    {formatCurrency(category.berjalan + category.sp2d)} / {formatCurrency(category.anggaran)}
                  </span>
                </div>
                <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                  {/* Anggaran Berjalan Progress */}
                  <div
                    className="absolute left-0 top-0 h-full bg-orange-500 transition-all duration-500 ease-out"
                    style={{ width: `${usagePercentage}%` }}
                  />
                  {/* SP2D Progress */}
                  <div
                    className="absolute top-0 h-full bg-green-500 transition-all duration-500 ease-out"
                    style={{
                      left: `${usagePercentage}%`,
                      width: `${sp2dPercentage}%`
                    }}
                  />
                  {/* Remaining */}
                  <div
                    className="absolute top-0 h-full bg-gray-300"
                    style={{
                      left: `${usagePercentage + sp2dPercentage}%`,
                      width: `${remainingPercentage}%`
                    }}
                  />
                  {/* Percentage Labels */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700 mix-blend-difference">
                      {(usagePercentage + sp2dPercentage).toFixed(1)}% Terpakai
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Berjalan: {usagePercentage.toFixed(1)}%</span>
                  <span>SP2D: {sp2dPercentage.toFixed(1)}%</span>
                  <span>Sisa: {remainingPercentage.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BarChart;