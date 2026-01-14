// Utility functions for formatting and calculations

/**
 * Format number to currency (IDR or USD)
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code ('IDR' or 'USD'), defaults to 'IDR'
 */
export const formatCurrency = (amount, currency = 'IDR') => {
  // Handle null, undefined, or invalid values
  const numericAmount = parseFloat(amount) || 0;

  const currencyUpper = currency.toUpperCase();

  if (currencyUpper === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  }

  // Default to IDR
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  // Handle null, undefined, or invalid values
  const numericValue = parseFloat(value) || 0;
  const numericTotal = parseFloat(total) || 0;

  if (numericTotal === 0) return 0;
  return Math.round((numericValue / numericTotal) * 100);
};

/**
 * Format number with thousand separator
 */
export const formatNumber = (num) => {
  // Handle null, undefined, or invalid values
  const numericNum = parseFloat(num) || 0;
  return new Intl.NumberFormat('id-ID').format(numericNum);
};

/**
 * Get color based on percentage
 */
export const getProgressColor = (percentage) => {
  if (percentage <= 25) return 'bg-green-500';
  if (percentage <= 50) return 'bg-green-500';
  if (percentage <= 75) return 'bg-green-500';
  return 'bg-green-500';
};

/**
 * Get KPI card colors
 */
export const getKPIColors = (type) => {
  const colors = {
    total: {
      gradient: 'from-gray-100 to-gray-600',
      bg: 'bg-gray-50',
      text: 'text-blue-600',
      icon: 'Wallet'
    },
    berjalan: {
      gradient: 'from-gray-100 to-gray-600',
      bg: 'bg-gray-50',
      text: 'text-orange-600',
      icon: 'Activity'
    },
    sp2d: {
      gradient: 'from-gray-100 to-gray-600',
      bg: 'bg-gray-50',
      text: 'text-green-600',
      icon: 'CheckCircle'
    },
    sisa: {
      gradient: 'from-gray-100 to-gray-600',
      bg: 'bg-gray-50',
      text: 'text-purple-600',
      icon: 'Coins'
    }
  };

  return colors[type] || colors.total;
};