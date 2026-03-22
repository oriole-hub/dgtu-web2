import { useQueries } from '@tanstack/react-query'
import { scannerPresent } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { scannerPresentQueryDefaults } from '@/lib/presence-utils'

export function useScannerPresentQueries(
  sessionRole: 'main' | 'admin' | undefined,
  officeIdsSorted: string[],
) {
  return useQueries({
    queries:
      sessionRole === 'main'
        ? officeIdsSorted.map((oid) => {
            const id = Number(oid)
            return {
              queryKey: queryKeys.scannerPresent(id),
              queryFn: () => scannerPresent(id),
              ...scannerPresentQueryDefaults,
            }
          })
        : [
            {
              queryKey: queryKeys.scannerPresent(null),
              queryFn: () => scannerPresent(null),
              ...scannerPresentQueryDefaults,
            },
          ],
  })
}
