import type {
  AttendanceRecord,
  Complaint,
  GuestVisit,
  Office,
  SessionUser,
  UserRecord,
} from '@/lib/types'

const now = new Date()

const isoDay = (delta: number) => {
  const d = new Date(now)
  d.setDate(now.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

const makeAttendance = (seed: number): AttendanceRecord[] =>
  Array.from({ length: 14 }, (_, i) => {
    const date = isoDay(-i)
    const mod = (seed + i) % 7
    const status = mod === 0 ? 'absent' : mod <= 2 ? 'late' : 'on_time'
    return { date, status }
  })

export const MAIN_ADMIN: SessionUser = {
  id: 'adm-main',
  email: 'main@system.local',
  login: 'main',
  role: 'main',
  name: 'Главный администратор',
}

export const SEED_ADMINS: SessionUser[] = [
  MAIN_ADMIN,
  {
    id: 'adm-1',
    email: 'admin@office.local',
    login: 'admin',
    role: 'admin',
    name: 'Администратор офиса',
  },
]

export const OFFICES: Office[] = [
  {
    id: 'of-mow',
    name: 'Москва — Центр',
    city: 'Москва',
    address: 'ул. Гончарная, 30',
    regionLabel: 'Центр',
    description: 'Головной офис, корпоративные клиенты и поддержка.',
    employees: 420,
    activeToday: 312,
    pointsPresence: 877_826,
    lat: 55.747861,
    lon: 37.653948,
  },
  {
    id: 'of-spb',
    name: 'Санкт-Петербург',
    city: 'Санкт-Петербург',
    address: 'Невский проспект, 88',
    regionLabel: 'Северо-Запад',
    description: 'Северо-Западный филиал, продажи и монтаж.',
    employees: 198,
    activeToday: 154,
    pointsPresence: 433_636,
    lat: 59.931337,
    lon: 30.347855,
  },
  {
    id: 'of-ekb',
    name: 'Екатеринбург',
    city: 'Екатеринбург',
    address: 'ул. Малышева, 51',
    regionLabel: 'Урал',
    description: 'Уральский хаб, логистика и полевая бригада.',
    employees: 156,
    activeToday: 121,
    pointsPresence: 156_150,
    lat: 56.838011,
    lon: 60.597465,
  },
  {
    id: 'of-nsk',
    name: 'Новосибирск',
    city: 'Новосибирск',
    address: 'Красный проспект, 17',
    regionLabel: 'Сибирь',
    description: 'Сибирский офис, удалённые команды.',
    employees: 94,
    activeToday: 72,
    pointsPresence: 741_896,
    lat: 55.032178,
    lon: 82.92043,
  },
  {
    id: 'of-rostov',
    name: 'Ростов-на-Дону',
    city: 'Ростов-на-Дону',
    address: 'ул. Большая Садовая, 100',
    regionLabel: 'Юг',
    description: 'Южный регион, работа с партнёрами.',
    employees: 76,
    activeToday: 58,
    pointsPresence: 202_080,
    lat: 47.222109,
    lon: 39.720349,
  },
]

export const USERS: UserRecord[] = [
  {
    id: 'usr-1',
    email: 'ivanova@example.com',
    officeId: 'of-mow',
    officeDisplay: '',
    fullName: 'Иванова Анна Сергеевна',
    jobTitle: 'Руководитель отдела',
    accountPurpose: null,
    employeeRole: 'manager',
    deletionDate: null,
    lateMinutesToday: 2,
    overtimeMinutesToday: Math.round(4.5 * 60),
    arrivalTime: '09:12',
    departureTime: '18:40',
    breakMinutes: 52,
    lastBreakOutAt: null,
    lastBreakInAt: null,
    lastBreakDurationSeconds: 52 * 60,
    attendanceStreak: 14,
    merchThreshold: 20,
    referralCode: 'RT-7K2M',
    referralCount: 6,
    referralUserIds: ['usr-2', 'usr-3'],
    attendance: makeAttendance(1),
  },
  {
    id: 'usr-2',
    email: 'petrov@example.com',
    officeId: 'of-spb',
    officeDisplay: '',
    fullName: 'Петров Дмитрий Олегович',
    jobTitle: 'Инженер поддержки',
    accountPurpose: null,
    employeeRole: 'employee',
    deletionDate: null,
    lateMinutesToday: 0,
    overtimeMinutesToday: 60,
    arrivalTime: '08:55',
    departureTime: '17:30',
    breakMinutes: 45,
    lastBreakOutAt: null,
    lastBreakInAt: null,
    lastBreakDurationSeconds: 45 * 60,
    attendanceStreak: 8,
    merchThreshold: 20,
    referralCode: 'RT-9PLQ',
    referralCount: 2,
    referralUserIds: [],
    attendance: makeAttendance(2),
  },
  {
    id: 'usr-3',
    email: 'sidorova@example.com',
    officeId: 'of-ekb',
    officeDisplay: '',
    fullName: 'Сидорова Елена Викторовна',
    jobTitle: 'Аналитик',
    accountPurpose: 'Проектная работа',
    employeeRole: 'guest',
    deletionDate: isoDay(10),
    lateMinutesToday: 5,
    overtimeMinutesToday: 0,
    arrivalTime: '09:45',
    departureTime: '18:05',
    breakMinutes: 60,
    lastBreakOutAt: null,
    lastBreakInAt: null,
    lastBreakDurationSeconds: 60 * 60,
    attendanceStreak: 3,
    merchThreshold: 20,
    referralCode: 'RT-3NWX',
    referralCount: 0,
    referralUserIds: [],
    attendance: makeAttendance(3),
  },
]

export const COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-1',
    officeId: 'of-mow',
    body: 'В переговорке Б шумит вентиляция, невозможно проводить звонки.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'new',
  },
  {
    id: 'cmp-2',
    officeId: 'of-spb',
    body: 'Кондиционер в зоне open-space работает слишком холодно.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'in_progress',
  },
]

export const GUESTS: GuestVisit[] = [
  {
    id: 'gst-1',
    fullName: 'Контрагент ООО «Вектор»',
    phone: '+7 495 100-20-30',
    entryAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    exitAt: null,
    breaks: [],
  },
]

export const DEFAULT_GUEST_MAX_HOURS = 4

export const MAP_TOTAL_RUSSIA = 2_793_471

export const MAP_MARKERS: {
  id: string
  label: string
  count: number
  x: number
  y: number
}[] = [
  { id: 'nw', label: 'Северо-Запад', count: 433_636, x: 18, y: 22 },
  { id: 'ce', label: 'Центр', count: 877_826, x: 42, y: 35 },
  { id: 'so', label: 'Юг', count: 202_080, x: 32, y: 52 },
  { id: 'vo', label: 'Волга', count: 219_112, x: 48, y: 48 },
  { id: 'ur', label: 'Урал', count: 156_150, x: 58, y: 42 },
  { id: 'si', label: 'Сибирь', count: 741_896, x: 72, y: 38 },
  { id: 'fe', label: 'Дальний Восток', count: 162_771, x: 85, y: 35 },
]
