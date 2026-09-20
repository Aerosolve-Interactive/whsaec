// Shared helpers for the volunteer-hours clock in / clock out feature.
// Used by both the member "My Hours" page and the admin "Hours" panel so
// the session-type labels and hour-rounding logic can never drift apart.

export const SESSION_TYPES = [
  { value: 'club-session', label: 'Club Meeting' },
  { value: 'build-session', label: 'Build Session' },
  { value: 'quarterly-build', label: 'Quarterly Build' },
  { value: 'summer-session', label: 'Summer Session' },
  { value: 'volunteer-event', label: 'Volunteer Event' },
] as const

export const SESSION_LABELS: Record<string, string> = Object.fromEntries(
  SESSION_TYPES.map((s) => [s.value, s.label])
)

export function isSessionTypeValue(value: string): boolean {
  return Object.prototype.hasOwnProperty.call(SESSION_LABELS, value)
}

/**
 * Converts a clock-in/clock-out pair into decimal hours, rounded to the
 * nearest quarter hour (0.25). Any session with elapsed time is floored at
 * 0.25 hours rather than rounding down to 0, so a real clock-in never
 * produces a zero-hour entry.
 */
export function computeSessionHours(clockInIso: string, clockOut: Date): number {
  const ms = clockOut.getTime() - new Date(clockInIso).getTime()
  const rawHours = ms / (1000 * 60 * 60)
  const rounded = Math.round(rawHours * 100) / 100
  if (rawHours > 0 && rounded <= 0) return 0.01
  return Math.max(rounded, 0)
}

/** "1h 23m" / "42m" style elapsed-time label for a still-active session. */
export function formatElapsed(clockInIso: string, now: Date = new Date()): string {
  const ms = now.getTime() - new Date(clockInIso).getTime()
  const totalMinutes = Math.max(0, Math.floor(ms / 60000))
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

/** "6:03 PM" style clock-in time-of-day label. */
export function formatClockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/**
 * Formats a totals number so quarter-hour precision (.25/.5/.75) is never
 * lost to rounding, while whole numbers still print cleanly (14, not
 * 14.00). Use this anywhere a Total/Verified/Pending stat is displayed.
 */
export function formatHours(hours: number): string {
  return (Math.round(hours * 100) / 100).toString()
}

/** Largest number of hours an admin can grant in a single entry. */
export const MAX_GRANT_HOURS = 24

/**
 * Builds clock-in/clock-out timestamps for an admin-granted entry so granted
 * hours still read like a real session ("9:00 AM - 12:00 PM") on a member's
 * record. `date` is "YYYY-MM-DD" and `time` is "HH:MM", both straight from the
 * form's native inputs, and both interpreted in the admin's local timezone --
 * the timezone the event actually happened in.
 *
 * Returns null if the date/time pair does not parse, so the caller can show a
 * validation error instead of writing an invalid row.
 */
export function buildGrantTimestamps(
  date: string,
  time: string,
  hours: number,
): { clockIn: string; clockOut: string } | null {
  const start = new Date(`${date}T${time || '00:00'}`)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start.getTime() + hours * 60 * 60 * 1000)
  return { clockIn: start.toISOString(), clockOut: end.toISOString() }
}

/** Today as "YYYY-MM-DD" in local time, for defaulting a date input. */
export function todayInputValue(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}
