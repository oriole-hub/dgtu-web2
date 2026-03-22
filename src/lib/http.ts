import { useAuthStore } from '@/stores/auth-store'

/** Базовый адрес сервера (при сборке можно задать в переменных окружения). */
const DEFAULT_API_BASE = 'https://dstu.devoriole.ru'

const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
const base = (raw && raw.length > 0 ? raw : DEFAULT_API_BASE).replace(/\/$/, '')

function parseErrorBody(data: unknown): string {
  if (!data || typeof data !== 'object') return 'Ошибка обращения к сервису'
  const d = data as { detail?: unknown }
  if (Array.isArray(d.detail)) {
    const first = d.detail[0] as { msg?: string } | undefined
    if (first?.msg) return first.msg
  }
  if (typeof d.detail === 'string') return d.detail
  return 'Ошибка обращения к сервису'
}

export function getApiBaseUrl(): string {
  return base
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, ...init } = options
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body != null) {
    headers.set('Content-Type', 'application/json')
  }
  if (auth) {
    const token = useAuthStore.getState().token
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const url = path.startsWith('http') ? path : `${base}${path}`
  let res: Response
  try {
    res = await fetch(url, { ...init, headers })
  } catch (e) {
    const msg =
      e instanceof TypeError
        ? 'Не удалось подключиться. Проверьте интернет и доступ к системе.'
        : 'Не удалось подключиться'
    throw new Error(msg)
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    if (res.status === 401 && auth && useAuthStore.getState().token) {
      useAuthStore.getState().logout()
      throw new Error('Сессия истекла. Войдите снова.')
    }
    const detail = parseErrorBody(data)
    const message =
      detail === 'Ошибка обращения к сервису'
        ? `HTTP ${res.status}`
        : `${detail} (HTTP ${res.status})`
    throw new Error(message)
  }

  if (res.status === 204) return undefined as T
  const ct = res.headers.get('content-type')
  if (!ct?.includes('application/json')) return undefined as T
  return res.json() as Promise<T>
}
