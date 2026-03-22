/** Отображение ISO datetime с сервера (хранится в UTC). */
export function formatUtcIsoForUi(iso: string | null | undefined): string {
  if (iso == null || String(iso).trim() === '') return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.toLocaleString('ru-RU', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })} UTC`
}

/** Минуты → «2 ч 15 мин» / «40 мин» / «—» */
export function formatWorkMinutesForUi(min: number | null | undefined): string {
  if (min == null || min <= 0) return '—'
  const m = Math.floor(min)
  const h = Math.floor(m / 60)
  const rest = m % 60
  if (h === 0) return `${rest} мин`
  if (rest === 0) return `${h} ч`
  return `${h} ч ${rest} мин`
}

export function formatDurationSeconds(sec: number | null | undefined): string {
  if (sec == null || sec < 0) return '—'
  if (sec === 0) return '0 с'
  if (sec < 60) return `${sec} с`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s ? `${m} мин ${s} с` : `${m} мин`
}
