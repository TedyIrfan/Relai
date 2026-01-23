import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CHART_COLORS } from '../../utils/chartConfig';
import { formatCurrency } from '../../utils/currency';

const PieChart = ({ budgetUsage = [], total = 0, anggaranBerjalan = 0, anggaranSP2D = 0, loading = false, categories = null }) => {
  // Support both old (categories) and new (budgetUsage) props for backward compatibility
  const data = Array.isArray(budgetUsage) && budgetUsage.length > 0
    ? budgetUsage.map((item, index) => {
        const value = parseFloat(item.value) || 0;
        const totalValue = parseFloat(total) || 0;

        // Color scheme: Terpakai = orange, Sisa = green
        const color = item.type === 'terpakai'
          ? '#f97316' // orange for terpakai
          : '#22c55e'; // green for sisa

        return {
          name: item.name,
          value: value,
          percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
          color: color,
          type: item.type
        };
      })
    : (categories || []).map((category, index) => {
        // Fallback to original category-based logic if budgetUsage not provided
        const anggaranValue = parseFloat(category.anggaran) || 0;
        const totalValue = parseFloat(total) || 0;

        return {
          name: category.nama || `Kategori ${index + 1}`,
          value: anggaranValue,
          percentage: totalValue > 0 ? (anggaranValue / totalValue) * 100 : 0,
          color: CHART_COLORS.primary[index % CHART_COLORS.primary.length]
        };
      });

  // Check if we have valid data
  if (data.length === 0 && (!categories || categories.length === 0)) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Tidak ada data</p>
          <p className="text-sm">Data anggaran tidak tersedia</p>
        </div>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const currentData = data.find(item => item.name === payload[0].name);
      const percentage = currentData ? currentData.percentage : 0;

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-800">
          <p className="font-medium text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{formatCurrency(payload[0].value)}</p>
          {currentData && currentData.type === 'terpakai' && (
            <p className="text-xs text-gray-500">
              (Berjalan: {formatCurrency(anggaranBerjalan || 0)} + SP2D: {formatCurrency(anggaranSP2D || 0)})
            </p>
          )}
          <p className="text-xs text-gray-500">
            {percentage.toFixed(4)}% dari total anggaran
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm text-gray-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
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
          <p className="text-lg font-medium">Tidak ada data</p>
          <p className="text-sm">Data anggaran tidak tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-2xl shadow-lg bg-gradient-to-b from-white to-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
        Distribusi Anggaran
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props) => {
              const currentData = data[props.index];
              const RADIAN = Math.PI / 180;
              const radius = props.innerRadius + (props.outerRadius - props.innerRadius) * 0.5;
              const x = props.cx + radius * Math.cos(-props.midAngle * RADIAN);
              const y = props.cy + radius * Math.sin(-props.midAngle * RADIAN);

              return (
                <text
                  x={x}
                  y={y}
                  fill="white"
                  textAnchor={x > props.cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  className="text-xs font-medium"
                >
                  {currentData ? currentData.percentage.toFixed(0) + '%' : '0%'}
                </text>
              );
            }}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </RechartsPieChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-6 pt-6 border-t border-gray-300">
        <div className="text-center">
          <p className="text-sm text-gray-500">Total Anggaran</p>
          <p className="text-lg font-semibold text-gray-800">
            {formatCurrency(total || 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PieChart;