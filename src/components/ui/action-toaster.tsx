import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type ActionToastVariant,
  useActionToastStore,
} from '@/stores/action-toast-store'

const AUTO_REMOVE_MS = 5200

function ToastRow({
  id,
  message,
  variant,
}: {
  id: string
  message: string
  variant: ActionToastVariant
}) {
  const remove = useActionToastStore((s) => s.remove)

  useEffect(() => {
    const t = window.setTimeout(() => remove(id), AUTO_REMOVE_MS)
    return () => clearTimeout(t)
  }, [id, remove])

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm shadow-lg ring-1',
        variant === 'success' &&
          'border-emerald-200 bg-emerald-50/95 text-emerald-900 ring-emerald-100',
        variant === 'error' &&
          'border-red-200 bg-red-50/95 text-red-900 ring-red-100',
      )}
    >
      <p className="min-w-0 flex-1 leading-snug">{message}</p>
      <button
        type="button"
        className="shrink-0 rounded-md p-0.5 opacity-70 hover:bg-black/5 hover:opacity-100"
        onClick={() => remove(id)}
        aria-label="Закрыть"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function ActionToaster() {
  const toasts = useActionToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed left-4 top-4 z-[200] flex max-w-sm flex-col gap-2"
      aria-live="assertive"
      aria-relevant="additions"
    >
      {toasts.map((t) => (
        <ToastRow key={t.id} id={t.id} message={t.message} variant={t.variant} />
      ))}
    </div>
  )
}
