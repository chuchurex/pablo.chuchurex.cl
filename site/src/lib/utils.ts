const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/**
 * Format a date string as "DD de Month, YYYY" in Spanish.
 * Accepts ISO date strings (YYYY-MM-DD) or any Date-parseable string.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  const day = date.getDate()
  const month = MONTHS_ES[date.getMonth()]
  const year = date.getFullYear()
  return `${day} de ${month}, ${year}`
}
