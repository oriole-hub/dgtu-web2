export const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  offices: ['offices'] as const,
  office: (id: string) => ['offices', id] as const,
  admins: ['admins'] as const,
  attendance: (userId: string, from: string, to: string) =>
    ['attendance', userId, from, to] as const,
  /** Один ключ для «текущего офиса» (админ / глава с привязкой): обзор и таблица делят кэш. */
  scannerPresent: (officeId: number | null) =>
    ['scanner', 'present', officeId ?? 'current'] as const,
}
