/**
 * Parse a "YYYY-MM-DD" date string into a local Date object.
 * Avoids the UTC timezone bug where `new Date("2026-05-01")` is interpreted
 * as UTC midnight and shifts to the previous day in negative-UTC timezones.
 */
export function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Format a "YYYY-MM-DD" date string for human-readable display.
 * Returns e.g. "5/1/2026" without any timezone conversion.
 */
export function formatDisplayDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString()
}
