/**
 * Formats a YYYY-MM-DD or ISO string into a human readable format: e.g. "Oct 28, 2026"
 */
export function formatDate(dateStr?: string | Date): string {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' && dateStr.length === 10
    ? new Date(dateStr + 'T00:00:00')
    : new Date(dateStr);

  if (isNaN(date.getTime())) return String(dateStr);

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns today's date in local YYYY-MM-DD format
 */
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns date offset by n days in YYYY-MM-DD format
 */
export function getOffsetDateString(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
