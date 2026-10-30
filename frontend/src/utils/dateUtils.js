/**
 * Formats a Date object as a local timezone string 'YYYY-MM-DD'.
 * This avoids timezone shift issues caused by using .toISOString()
 * which uses UTC and can shift the date by +1/-1 day.
 * 
 * @param {Date} d - The Date object to format. Defaults to current date.
 * @returns {string} The formatted local date string 'YYYY-MM-DD'.
 */
export const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
