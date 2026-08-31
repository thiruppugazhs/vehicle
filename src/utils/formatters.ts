export const formatCurrency = (amount: number, currency = '₹'): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return `${currency}0`;
  
  if (currency === '₹') {
    // Indian numbering format (e.g. 1,50,000)
    return `${currency}${amount.toLocaleString('en-IN')}`;
  }
  return `${currency}${amount.toLocaleString('en-US')}`;
};

export const formatDistance = (km: number, unit: 'km' | 'miles' = 'km'): string => {
  if (isNaN(km) || km === null || km === undefined) return `0 ${unit}`;
  const value = unit === 'miles' ? Math.round(km * 0.621371) : Math.round(km);
  return `${value.toLocaleString()} ${unit}`;
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const getDaysDifference = (targetDateStr: string): number => {
  const target = new Date(targetDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
