/** Типы тел запросов и ответов сервера. */

export type ApiUserRole = 'office_head' | 'admin' | 'employee' | 'guest'

export interface TokenOut {
  access_token: string
  token_type?: string
}

export interface OfficeOut {
  id: number
  name: string
  address: string
  city: string
  is_active: boolean
  work_start_time: string
  iana_timezone: string
  created_by_user_id: number
  created_at: string
}

export interface UserOut {
  id: number
  full_name: string
  email: string
  login: string
  role: ApiUserRole
  office_id?: number | null
  account_expires_at: string | null
  pass_limit_total: number | null
  passes_created_count: number
  referral_count: number
  created_by_user_id: number | null
  created_at: string
  /** Должность сотрудника */
  job_title: string | null
  /** Цель гостевого аккаунта */
  account_creation_purpose: string | null
  /** Сводное поле (например, должность) */
  position: string | null
  /** Вложенный офис (если отдаёт API) */
  office?: OfficeOut | null
  /** Опоздание сегодня, минуты */
  late_minutes_today?: number | null
  /** Переработка сегодня, минуты */
  overtime_minutes_today?: number | null
  /** Последний проход «вход» по всей истории access_events (UTC) */
  last_in_at?: string | null
  /** Последний проход «выход» по всей истории (UTC) */
  last_out_at?: string | null
  /** Выход на последний завершённый перекур сегодня (UTC) */
  last_break_out_at?: string | null
  /** Вход после этого перекура (UTC) */
  last_break_in_at?: string | null
  /** Длительность этого перекура, сек */
  last_break_duration_seconds?: number | null
}

export interface LoginIn {
  login: string
  pwd: string
}

export interface OfficeCreateIn {
  name: string
  address: string
  city: string
  is_active?: boolean
}

export interface OfficeUpdateIn {
  work_start_time?: string | null
  iana_timezone?: string | null
}

export interface AdminCreateIn {
  full_name: string
  email: string
  login: string
  pwd: string
  role?: ApiUserRole
  office_id: number
}

/** Создание сотрудника */
export interface EmployeeCreateIn {
  full_name: string
  email: string
  login: string
  pwd: string
  office_id: number
  job_title: string
  account_expires_at?: string | null
  pass_limit_total?: number | null
}

/** Создание гостевого аккаунта */
export interface GuestCreateIn {
  full_name: string
  email: string
  login: string
  pwd: string
  office_id: number
  creation_purpose: string
  account_expires_at?: string | null
  pass_limit_total?: number | null
}

export interface UserUpdateIn {
  full_name?: string | null
  email?: string | null
  role?: ApiUserRole | null
  office_id?: number | null
  account_expires_at?: string | null
  pass_limit_total?: number | null
  referral_count?: number | null
  job_title?: string | null
  account_creation_purpose?: string | null
}

export interface PassOut {
  qr_token: string
  status: string
  expires_at: string
  office_id: number
}

export interface ScanIn {
  qr_token: string
  office_id?: number | null
}

export interface ScanOut {
  ok: boolean
  status: string
  msg: string
  direction: string
  user_id: number
  user_full_name: string
  office_id: number
}

export interface AttendanceDayOut {
  date: string
  status: 'on_time' | 'late' | 'absent'
  first_in_at?: string | null
}

export interface AttendanceOut {
  iana_timezone: string
  work_start_time: string
  punctual_days_total: number
  days: AttendanceDayOut[]
}

export interface AccessEventOut {
  id: number
  user_id: number
  user_full_name: string
  office_id: number
  direction: string
  scanned_by_user_id: number
  created_at: string
}

export interface PresentInOfficeOut {
  user_id: number
  user_full_name: string
  last_event_at: string
}

export interface BootstrapOfficeHeadIn {
  full_name: string
  email: string
  login: string
  pwd: string
  office_name: string
  office_address: string
  office_city: string
  office_is_active?: boolean
}

export interface GuestSelfUpdateIn {
  full_name: string
  email: string
  login: string
  pwd?: string | null
}
