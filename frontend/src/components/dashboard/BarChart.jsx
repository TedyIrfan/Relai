import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { formatBarData } from '../../utils/chartConfig';
import { formatCurrency } from '../../utils/currency';

const BarChart = ({ categories, loading = false }) => {
  // Format data for bar chart
  const rawData = formatBarData(categories);

  // Use cube root scale for better visualization of extreme values
  // Cube root preserves the relative proportions while compressing the range
  const transformValue = (val) => val === 0 ? 0 : Math.cbrt(val);

  // Get max value for scale calculation
  const allValues = rawData.flatMap(item => [item.anggaran, item.berjalan, item.sp2d]);
  const maxDataValue = Math.max(...allValues);

  // Transform data for visualization (using cube root scale)
  const data = rawData.map(category => ({
    ...category,
    // Keep original values for display
    _anggaran: category.anggaran,
    _berjalan: category.berjalan,
    _sp2d: category.sp2d,
    // Use transformed values for rendering
    anggaran: transformValue(category.anggaran),
    berjalan: transformValue(category.berjalan),
    sp2d: transformValue(category.sp2d)
  }));

  // Transformed max value for Y-axis domain
  const maxTransformedValue = transformValue(maxDataValue);

  // Check if data has actual values greater than 0
  const hasValidData = rawData.some(item => item.anggaran > 0 || item.berjalan > 0 || item.sp2d > 0);

  console.log('📊 BarChart data:', data);
  console.log('📊 Raw data:', rawData);
  console.log('📊 Max value:', maxDataValue);
  console.log('📊 Max transformed:', maxTransformedValue);
  console.log('📊 hasValidData:', hasValidData);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Find the original category data
      const originalCat = rawData.find(cat => cat.name === label);

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => {
            // Get real value from original data
            let realValue = entry.value;
            if (originalCat) {
              if (entry.dataKey === 'anggaran') realValue = originalCat._anggaran;
              else if (entry.dataKey === 'berjalan') realValue = originalCat._berjalan;
              else if (entry.dataKey === 'sp2d') realValue = originalCat._sp2d;
            }

            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {formatCurrency(realValue)}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Custom YAxis tick formatter - shows original scale labels
  const formatYAxis = (transformedValue) => {
    // Convert back from cube root to original value for display
    const originalValue = Math.pow(transformedValue, 3);

    if (originalValue >= 1000000000000) {
      return `${(originalValue / 1000000000000).toFixed(1)}T`;
    }
    if (originalValue >= 1000000000) {
      return `${(originalValue / 1000000000).toFixed(1)}M`;
    }
    if (originalValue >= 1000000) {
      return `${(originalValue / 1000000).toFixed(1)}JT`;
    }
    if (originalValue >= 1000) {
      return `${(originalValue / 1000).toFixed(1)}RB`;
    }
    return originalValue.toString();
  };

  console.log('📊 BarChart rendering:', {
    dataLength: data.length,
    hasValidData,
    maxDataValue,
    maxTransformedValue,
    firstItem: data[0]
  });

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
          <p className="text-lg font-medium">Tidak ada data</p>
          <p className="text-sm">Data anggaran tidak tersedia</p>
        </div>
      </div>
    );
  }

  if (!hasValidData) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Data belum tersedia</p>
          <p className="text-sm">Silakan input data anggaran terlebih dahulu</p>
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
          Cube Root Scale - {hasValidData ? `Max: ${(maxDataValue / 1000000000000).toFixed(1)}T` : 'Belum ada data'}
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
            scale="linear"
            domain={[0, maxTransformedValue * 1.1]}
            tickFormatter={formatYAxis}
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={{ stroke: '#E5E7EB' }}
            label={{ value: 'Anggaran (Cube Root Scale)' , angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 10 } }}
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
              {formatCurrency(rawData.reduce((sum, item) => sum + item.anggaran, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Berjalan</p>
            <p className="text-sm font-semibold text-orange-600">
              {formatCurrency(rawData.reduce((sum, item) => sum + item.berjalan, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total SP2D</p>
            <p className="text-sm font-semibold text-green-600">
              {formatCurrency(rawData.reduce((sum, item) => sum + item.sp2d, 0))}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BarChart;