/**
 * Dynamically calculates the present value of an asset based on time elapsed and growth rate.
 */
export const calculateRealTimeValue = (principal, annualRatePercent, purchaseDateStr, compoundingType = 'annual') => {
  const p = Number(principal || 0);
  
  if (!p || !purchaseDateStr || isNaN(annualRatePercent)) {
    return { currentValue: p, profit: 0, roiPercentage: "0.00", yearsElapsed: "0.0" };
  }

  const purchaseDate = new Date(purchaseDateStr);
  const today = new Date();
  
  // Exact elapsed time in years
  const diffTime = Math.max(0, today - purchaseDate);
  const t = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  const r = Number(annualRatePercent) / 100;

  let currentValue = p;
  if (compoundingType === 'annual') {
    // Real Estate Annual Appreciation
    currentValue = p * Math.pow(1 + r, t);
  } else if (compoundingType === 'quarterly') {
    // Fixed Deposit Quarterly Compounding
    currentValue = p * Math.pow(1 + (r / 4), 4 * t);
  }

  const profit = currentValue - p;
  const roiPercentage = p > 0 ? (profit / p) * 100 : 0;

  return {
    currentValue: Math.round(currentValue),
    profit: Math.round(profit),
    roiPercentage: roiPercentage.toFixed(2),
    yearsElapsed: t.toFixed(1)
  };
};