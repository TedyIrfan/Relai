import React from 'react';
import * as Icons from 'lucide-react';
import { formatCurrency, calculatePercentage, getKPIColors, getProgressColor } from '../../utils/currency';

const KPICard = ({
  type,
  title,
  value,
  total,
  showProgress = true,
  loading = false
}) => {
  const colors = getKPIColors(type);
  const percentage = showProgress && total ? calculatePercentage(value, total) : 0;
  const displayValue = loading ? '...' : formatCurrency(value);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-10`}></div>

      {/* Card content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {React.createElement(Icons[colors.icon] || Icons.Wallet, {
              className: `w-6 h-6 ${colors.text}`
            })}
            <div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {displayValue}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {showProgress && total && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs font-medium text-gray-700">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressColor(percentage)}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;