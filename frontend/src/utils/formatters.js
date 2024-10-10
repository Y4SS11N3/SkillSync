export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-MA', {
    style: 'currency',
    currency: 'MAD',
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('ar-MA').format(number);
};

export const calculatePercentageChange = (current, previous) => {
  if (typeof current !== 'number' || typeof previous !== 'number' || isNaN(current) || isNaN(previous)) {
    return null;
  }
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return isFinite(change) ? change : null;
};