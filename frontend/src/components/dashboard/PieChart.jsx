import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatPieData, getLabelProps, CHART_COLORS } from '../../utils/chartConfig';
import { formatCurrency } from '../../utils/currency';

const PieChart = ({ total, berjalan, sp2d, sisa, loading = false }) => {
  const data = formatPieData(total, berjalan, sp2d, sisa);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      // Cari data item yang sesuai untuk mendapatkan persentase yang benar
      const currentData = data.find(item => item.name === payload[0].name);
      const percentage = currentData ? currentData.percentage : 0;

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-800">
          <p className="font-medium text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-gray-500">
            {percentage.toFixed(1)}%
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
          <p className="text-sm">Belum ada realisasi anggaran</p>
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
              // Cari data item yang sesuai dengan current index
              const currentData = data[props.index];
              const labelProps = getLabelProps(props.cx, props.cy, props.midAngle, props.innerRadius, props.outerRadius, props.percent, currentData);
              return (
                <text
                  x={labelProps.x}
                  y={labelProps.y}
                  fill={labelProps.fill}
                  textAnchor={labelProps.textAnchor}
                  dominantBaseline={labelProps.dominantBaseline}
                  className={labelProps.className}
                >
                  {labelProps.children}
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
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Total Realisasi</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatCurrency((parseFloat(berjalan) || 0) + (parseFloat(sp2d) || 0))}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sisa Anggaran</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatCurrency(parseFloat(sisa) || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChart;