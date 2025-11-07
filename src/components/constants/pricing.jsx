export const PRICING = {
  india: {
    monthlyAmount: 499,
    yearlyAmount: 3499,
    yearlyOriginalAmount: 5988, // 499 * 12
    yearlyMonthlyEquivalent: 291,
    currency: 'INR',
    currencySymbol: '₹',
    yearlySavingsLabel: 'Save ₹2,489',
    yearlySavingsPercent: 42
  },
  global: {
    monthlyAmount: 15,
    yearlyAmount: 150,
    yearlyOriginalAmount: 180, // 15 * 12
    yearlyMonthlyEquivalent: 12.5,
    currency: 'USD',
    currencySymbol: '$',
    yearlySavingsLabel: 'Save $30',
    yearlySavingsPercent: 17
  }
};

export const formatCurrency = (amount, region = 'india') => {
  const pricing = PRICING[region];
  
  if (region === 'india') {
    return `${pricing.currencySymbol}${Number(amount).toLocaleString('en-IN')}`;
  } else {
    return `${pricing.currencySymbol}${Number(amount).toLocaleString('en-US')}`;
  }
};