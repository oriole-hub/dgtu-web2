/** Слой данных: вход, пользователи, офисы, пропуска, сканер. Базовый URL — `http.ts`. */
import type {
  AccessEventOut,
  AdminCreateIn,
  AttendanceOut,
  BootstrapOfficeHeadIn,
  EmployeeCreateIn,
  GuestCreateIn,
  GuestSelfUpdateIn,
  OfficeCreateIn,
  OfficeOut,
  OfficeUpdateIn,
  PassOut,
  PresentInOfficeOut,
  ScanIn,
  ScanOut,
  TokenOut,
  UserOut,
  UserUpdateIn,
} from '@/lib/api-schema'
import { formatUtcIsoForUi } from '@/lib/datetime-format'
import { apiRequest } from '@/lib/http'
import type {
  EmployeeRole,
  Office,
  SessionUser,
  UserRecord,
} from '@/lib/types'
import { useAuthStore } from '@/stores/auth-store'

function mapSessionUser(u: UserOut): SessionUser {
  const role: SessionUser['role'] =
    u.role === 'office_head' ? 'main' : 'admin'
  return {
    id: String(u.id),
    email: u.email,
    login: u.login,
    name: u.full_name,
    role,
  }
}

function displayJobTitle(u: UserOut): string {
  const j = u.job_title?.trim()
  if (j) return j
  const p = u.position?.trim()
  if (p) return p
  return '—'
}

function apiRoleToEmployeeRole(r: UserOut['role']): EmployeeRole {
  if (r === 'employee') return 'employee'
  if (r === 'guest') return 'guest'
  return 'manager'
}

function employeeRoleToApiRole(r: EmployeeRole): UserOut['role'] {
  if (r === 'guest') return 'guest'
  return 'employee'
}

function userOutToRecord(u: UserOut): UserRecord {
  const officeIdNum = u.office?.id ?? u.office_id
  return {
    id: String(u.id),
    email: u.email,
    officeId: officeIdNum != null ? String(officeIdNum) : '',
    officeDisplay: u.office
      ? `${u.office.city} — ${u.office.name}`
      : '',
    fullName: u.full_name,
    jobTitle: displayJobTitle(u),
    accountPurpose: u.account_creation_purpose ?? null,
    employeeRole: apiRoleToEmployeeRole(u.role),
    deletionDate: u.account_expires_at
      ? u.account_expires_at.slice(0, 10)
      : null,
    lateMinutesToday: u.late_minutes_today ?? 0,
    overtimeMinutesToday: u.overtime_minutes_today ?? 0,
    arrivalTime: formatUtcIsoForUi(u.last_in_at),
    departureTime: formatUtcIsoForUi(u.last_out_at),
    breakMinutes:
      u.last_break_duration_seconds != null
        ? Math.round(u.last_break_duration_seconds / 60)
        : 0,
    lastBreakOutAt: u.last_break_out_at ?? null,
    lastBreakInAt: u.last_break_in_at ?? null,
    lastBreakDurationSeconds: u.last_break_duration_seconds ?? null,
    attendanceStreak: 0,
    merchThreshold: 20,
    referralCode: `REF-${u.id}`,
    referralCount: u.referral_count,
    referralUserIds: [],
    attendance: [],
  }
}

function officeOutToOffice(o: OfficeOut): Office {
  return {
    id: String(o.id),
    name: o.name,
    city: o.city,
    address: o.address,
    regionLabel: '',
    description: '',
    employees: 0,
    activeToday: 0,
    pointsPresence: 0,
    lat: 55.75,
    lon: 37.62,
    isActive: o.is_active,
    workStartTime: o.work_start_time,
    ianaTimezone: o.iana_timezone,
  }
}

export async function loginRequest(
  login: string,
  pwd: string,
): Promise<SessionUser> {
  const tokenOut = await apiRequest<TokenOut>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login, pwd }),
    auth: false,
  })
  const accessToken = tokenOut.access_token
  useAuthStore.getState().setToken(accessToken)
  try {
    const me = await apiRequest<UserOut>('/auth/me')
    const session = mapSessionUser(me)
    useAuthStore.getState().setSession(accessToken, session)
    return session
  } catch (e) {
    useAuthStore.getState().logout()
    throw e
  }
}

export async function logoutRequest(): Promise<void> {
  try {
    await apiRequest<Record<string, unknown>>('/auth/logout', {
      method: 'POST',
    })
  } finally {
    useAuthStore.getState().logout()
  }
}

export async function fetchUsers(): Promise<UserRecord[]> {
  const role = useAuthStore.getState().user?.role
  const path =
    role === 'main' ? '/auth/users' : '/auth/office-users'
  const list = await apiRequest<UserOut[]>(path)
  return list.map(userOutToRecord)
}

export async function fetchUser(id: string): Promise<UserRecord | null> {
  const users = await fetchUsers()
  return users.find((u) => u.id === id) ?? null
}

export async function fetchUserAttendance(
  userId: string,
  from: string,
  to: string,
): Promise<AttendanceOut> {
  const q = new URLSearchParams({ from, to })
  return apiRequest<AttendanceOut>(
    `/auth/users/${userId}/attendance?${q}`,
  )
}

export async function saveUser(
  id: string,
  patch: Partial<UserRecord> & {
    fullName?: string
    email?: string
    employeeRole?: EmployeeRole
    officeId?: string
    deletionDate?: string | null
    referralCount?: number
    jobTitle?: string
    accountPurpose?: string | null
  },
): Promise<UserRecord> {
  const body: UserUpdateIn = {}
  if (patch.fullName != null) body.full_name = patch.fullName
  if (patch.email != null) body.email = patch.email
  if (patch.employeeRole != null)
    body.role = employeeRoleToApiRole(patch.employeeRole)
  if (patch.officeId != null) body.office_id = Number(patch.officeId)
  if (patch.deletionDate !== undefined) {
    body.account_expires_at = patch.deletionDate
      ? new Date(patch.deletionDate).toISOString()
      : null
  }
  if (patch.referralCount != null) body.referral_count = patch.referralCount
  if (patch.employeeRole === 'guest') {
    if (patch.accountPurpose !== undefined) {
      body.account_creation_purpose = patch.accountPurpose?.trim() || null
    }
    if (
      patch.jobTitle !== undefined ||
      patch.accountPurpose !== undefined
    ) {
      body.job_title = null
    }
  } else if (patch.employeeRole != null) {
    if (patch.jobTitle !== undefined) {
      body.job_title = patch.jobTitle?.trim() || null
    }
    if (patch.accountPurpose !== undefined) {
      body.account_creation_purpose = null
    }
  }

  const path =
    useAuthStore.getState().user?.role === 'admin'
      ? `/auth/workers/${id}`
      : `/auth/users/${id}`

  const out = await apiRequest<UserOut>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return userOutToRecord(out)
}

export async function createEmployeeAccount(data: {
  fullName: string
  email: string
  login: string
  pwd: string
  officeId: string
  position: string
  accountExpiresAt: string | null
}): Promise<UserRecord> {
  const body: EmployeeCreateIn = {
    full_name: data.fullName,
    email: data.email,
    login: data.login,
    pwd: data.pwd,
    office_id: Number(data.officeId),
    job_title: data.position,
    account_expires_at: data.accountExpiresAt
      ? new Date(data.accountExpiresAt).toISOString()
      : null,
    pass_limit_total: null,
  }
  const out = await apiRequest<UserOut>('/auth/employees', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return userOutToRecord(out)
}

export async function createGuestAccount(data: {
  fullName: string
  email: string
  login: string
  pwd: string
  officeId: string
  accountPurpose: string
  accountExpiresAt: string | null
}): Promise<UserRecord> {
  const body: GuestCreateIn = {
    full_name: data.fullName,
    email: data.email,
    login: data.login,
    pwd: data.pwd,
    office_id: Number(data.officeId),
    creation_purpose: data.accountPurpose,
    account_expires_at: data.accountExpiresAt
      ? new Date(data.accountExpiresAt).toISOString()
      : null,
    pass_limit_total: null,
  }
  const out = await apiRequest<UserOut>('/auth/guests', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return userOutToRecord(out)
}

export async function deleteUser(userId: string): Promise<void> {
  await apiRequest(`/auth/users/${userId}`, { method: 'DELETE' })
}

export async function fetchOffices(): Promise<Office[]> {
  const list = await apiRequest<OfficeOut[]>('/offices')
  return list.map(officeOutToOffice)
}

export async function fetchOffice(id: string): Promise<Office | null> {
  if (!id) return null
  try {
    const out = await apiRequest<OfficeOut>(`/offices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({} satisfies OfficeUpdateIn),
    })
    return officeOutToOffice(out)
  } catch {
    try {
      const list = await fetchOffices()
      return list.find((o) => o.id === id) ?? null
    } catch {
      return null
    }
  }
}

export async function createOffice(data: {
  name: string
  address: string
  city: string
  isActive?: boolean
}): Promise<Office> {
  const body: OfficeCreateIn = {
    name: data.name,
    address: data.address,
    city: data.city,
    is_active: data.isActive ?? true,
  }
  const out = await apiRequest<OfficeOut>('/offices', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return officeOutToOffice(out)
}

export async function saveOffice(
  id: string,
  patch: Partial<Office>,
): Promise<Office> {
  const body: OfficeUpdateIn = {}
  if (patch.workStartTime !== undefined)
    body.work_start_time = patch.workStartTime ?? null
  if (patch.ianaTimezone !== undefined)
    body.iana_timezone = patch.ianaTimezone ?? null

  const out = await apiRequest<OfficeOut>(`/offices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return officeOutToOffice(out)
}

export async function createAdmin(data: {
  fullName: string
  email: string
  login: string
  pwd: string
  officeId: string
}): Promise<SessionUser> {
  const body: AdminCreateIn = {
    full_name: data.fullName,
    email: data.email,
    login: data.login,
    pwd: data.pwd,
    office_id: Number(data.officeId),
    role: 'admin',
  }
  const out = await apiRequest<UserOut>('/auth/admins', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return mapSessionUser(out)
}

export async function listAdmins(): Promise<SessionUser[]> {
  const list = await apiRequest<UserOut[]>('/auth/users')
  return list
    .filter((u) => u.role === 'admin')
    .map(mapSessionUser)
}

export async function generatePass(): Promise<PassOut> {
  return apiRequest<PassOut>('/passes/generate', { method: 'POST' })
}

export async function revokePass(): Promise<void> {
  await apiRequest('/passes/revoke', { method: 'POST' })
}

export async function scannerScan(payload: ScanIn): Promise<ScanOut> {
  return apiRequest<ScanOut>('/scanner/scan', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function scannerEvents(): Promise<AccessEventOut[]> {
  return apiRequest<AccessEventOut[]>('/scanner/events')
}

export async function scannerUserEvents(
  userId: string,
): Promise<AccessEventOut[]> {
  return apiRequest<AccessEventOut[]>(
    `/scanner/events/users/${userId}`,
  )
}

export async function scannerPresent(
  officeId?: number | null,
): Promise<PresentInOfficeOut[]> {
  const q =
    officeId != null ? `?office_id=${officeId}` : ''
  return apiRequest<PresentInOfficeOut[]>(`/scanner/present${q}`, {
    cache: 'no-store',
  })
}

export async function healthCheck(): Promise<unknown> {
  return apiRequest('/health', { auth: false })
}

export async function bootstrapOfficeHead(
  body: BootstrapOfficeHeadIn,
): Promise<UserOut> {
  return apiRequest<UserOut>('/auth/bootstrap-office-head', {
    method: 'POST',
    body: JSON.stringify(body),
    auth: false,
  })
}

export async function patchMeGuest(
  body: GuestSelfUpdateIn,
): Promise<UserOut> {
  return apiRequest<UserOut>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function deleteMeGuest(): Promise<void> {
  await apiRequest('/auth/me', { method: 'DELETE' })
}

export async function fetchMe(): Promise<UserOut> {
  return apiRequest<UserOut>('/auth/me')
}

export async function fetchMyAttendance(
  from: string,
  to: string,
): Promise<AttendanceOut> {
  const q = new URLSearchParams({ from, to })
  return apiRequest<AttendanceOut>(`/auth/me/attendance?${q}`)
}
