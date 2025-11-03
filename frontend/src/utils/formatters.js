// Format currency to Indonesian Rupiah format
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rp 0';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date to Indonesian format
export const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Format date time to Indonesian format
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format number with thousand separator
export const formatNumber = (number) => {
  if (!number && number !== 0) return '0';

  return new Intl.NumberFormat('id-ID').format(number);
};