export const formatDate = (dateStr, format = 'full') => {
  const date = new Date(dateStr);
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  
  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  if (format === 'full') return `${dayName} ${dayNum} ${month}`;
  if (format === 'short') return `${dayNum} ${month}`;
  if (format === 'month') return `${month} ${year}`;
  if (format === 'year') return `${year}`;
  if (format === 'monthOnly') return month;
  return `${dayNum}/${date.getMonth() + 1}`;
};

export const formatWeekRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = start.getMonth() + 1;
  const endMonth = end.getMonth() + 1;
  
  if (startMonth === endMonth) {
    return `${startDay} - ${endDay}/${startMonth}`;
  }
  return `${startDay}/${startMonth} - ${endDay}/${endMonth}`;
};

export const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

export const getMonthStartEnd = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start, end };
};

export const getWeeksInMonth = (year, month) => {
  const { start, end } = getMonthStartEnd(year, month);
  const weeks = [];
  let current = new Date(start);
  
  while (current <= end) {
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const finalEnd = weekEnd > end ? end : weekEnd;
    weeks.push({ start: new Date(current), end: finalEnd });
    current = new Date(weekEnd);
    current.setDate(current.getDate() + 1);
  }
  return weeks;
};

export const isToday = (dateStr) => {
  const today = new Date();
  const date = new Date(dateStr);
  return date.toDateString() === today.toDateString();
};

export const isCurrentMonth = (year, month) => {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() + 1 === month;
};
