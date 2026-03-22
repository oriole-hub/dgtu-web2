import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ActionToaster } from '@/components/ui/action-toaster'
import { pushActionToast } from '@/lib/action-toast'
import { LIVE_REFETCH_INTERVAL_MS } from '@/lib/query-config'

const mutationCache = new MutationCache({
  onSuccess: (_data, _variables, _context, mutation) => {
    if (mutation.meta?.skipActionToast) return
    pushActionToast('Успех', 'success')
  },
  onError: (error, _variables, _context, mutation) => {
    if (mutation.meta?.skipActionToast) return
    const msg = error instanceof Error ? error.message : String(error)
    pushActionToast(msg, 'error')
  },
})

const client = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: LIVE_REFETCH_INTERVAL_MS / 2,
      refetchInterval: LIVE_REFETCH_INTERVAL_MS,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      {children}
      <ActionToaster />
    </QueryClientProvider>
  )
}
