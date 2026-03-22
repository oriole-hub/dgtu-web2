import type { UseQueryResult } from '@tanstack/react-query'
import type { PresentInOfficeOut } from '@/lib/api-schema'
import { LIVE_REFETCH_INTERVAL_MS } from '@/lib/query-config'
import type { UserRecord } from '@/lib/types'

/** Не кэшировать ответ как «тот же» — иначе список присутствующих может залипать. */
export const scannerPresentQueryDefaults = {
  staleTime: 0,
  gcTime: 2 * 60_000,
  structuralSharing: false as const,
  refetchOnMount: 'always' as const,
  refetchInterval: LIVE_REFETCH_INTERVAL_MS,
}

/**
 * Считаем «в офисе» только по ответу /present для офиса этой строки (глава).
 * Для админа — по единственному списку своего офиса.
 */
export function isUserListedAsPresentInTheirOffice(
  u: UserRecord,
  sessionRole: 'main' | 'admin' | undefined,
  officeIdsSorted: string[],
  presentQueries: UseQueryResult<PresentInOfficeOut[]>[],
): boolean {
  const id = String(u.id).trim()
  if (!id) return false

  if (sessionRole === 'main') {
    const oid = u.officeId?.trim()
    if (!oid) return false
    const idx = officeIdsSorted.indexOf(oid)
    if (idx < 0 || idx >= presentQueries.length) return false
    return (presentQueries[idx].data ?? []).some(
      (row) => String(row.user_id) === id,
    )
  }

  const rows = presentQueries[0]?.data ?? []
  return rows.some((row) => String(row.user_id) === id)
}

export function countUniquePresentUserIds(
  presentQueries: UseQueryResult<PresentInOfficeOut[]>[],
): number {
  const seen = new Set<string>()
  for (const q of presentQueries) {
    for (const row of q.data ?? []) {
      seen.add(String(row.user_id))
    }
  }
  return seen.size
}
