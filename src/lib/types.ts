export type AdminRole = 'main' | 'admin'
export type EmployeeRole = 'employee' | 'manager' | 'guest'
export type AttendanceStatus = 'on_time' | 'late' | 'absent'

export interface SessionUser {
  id: string
  email: string
  login: string
  name: string
  role: AdminRole
}

export interface Office {
  id: string
  name: string
  city: string
  address: string
  regionLabel: string
  description: string
  employees: number
  activeToday: number
  pointsPresence: number
  lat: number
  lon: number
  isActive?: boolean
  workStartTime?: string
  ianaTimezone?: string
}

export interface AttendanceRecord {
  date: string
  status: AttendanceStatus
}

/** Legacy mock types (mock-data); not used by HTTP API. */
export interface Complaint {
  id: string
  officeId: string
  body: string
  createdAt: string
  status: 'new' | 'in_progress' | 'resolved'
}

export interface GuestVisit {
  id: string
  fullName: string
  phone: string
  entryAt: string
  exitAt: string | null
  breaks: { start: string; end: string }[]
}

export interface UserRecord {
  id: string
  email: string
  officeId: string
  /** «Город — офис» из вложенного `office` в API; иначе пусто */
  officeDisplay: string
  fullName: string
  jobTitle: string
  /** Цель гостевого визита */
  accountPurpose: string | null
  employeeRole: EmployeeRole
  deletionDate: string | null
  /** Опоздание сегодня, мин (API: late_minutes_today) */
  lateMinutesToday: number
  /** Переработка сегодня, мин (API: overtime_minutes_today) */
  overtimeMinutesToday: number
  /** Подпись для таблицы: последний вход (UTC) */
  arrivalTime: string
  /** Подпись для таблицы: последний выход (UTC) */
  departureTime: string
  /** Устаревшее поле моков; при наличии API смотри lastBreakDurationSeconds */
  breakMinutes: number
  lastBreakOutAt: string | null
  lastBreakInAt: string | null
  lastBreakDurationSeconds: number | null
  attendanceStreak: number
  merchThreshold: number
  referralCode: string
  referralCount: number
  referralUserIds: string[]
  attendance: AttendanceRecord[]
}
