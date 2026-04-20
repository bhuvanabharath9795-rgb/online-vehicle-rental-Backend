export const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

export const calculateAmount = (pricePerDay, totalDays) => {
  return Number(pricePerDay) * Number(totalDays);
};
