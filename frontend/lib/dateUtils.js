// Formats a Date object as YYYY-MM-DD using LOCAL date components (not UTC),
// avoiding the timezone day-shift that toISOString() causes for timezones
// ahead of UTC (e.g. UTC+5:30).
function toDateString(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Returns the Monday of the week containing the given date (or today),
// formatted as YYYY-MM-DD, to match the backend's weekStartDate convention.
export function getMondayOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = day === 0 ? -6 : 1 - day; // shift Sunday back to previous Monday
  d.setDate(d.getDate() + diff);
  return toDateString(d);
}

export function shiftWeek(weekStartDate, deltaWeeks) {
  // Parse as local time (not UTC) by appending T00:00:00
  const d = new Date(`${weekStartDate}T00:00:00`);
  d.setDate(d.getDate() + deltaWeeks * 7);
  return toDateString(d);
}

export function formatWeekLabel(weekStartDate) {
  const start = new Date(`${weekStartDate}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const opts = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}