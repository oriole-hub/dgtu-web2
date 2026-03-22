import { create } from 'zustand'

export type ActionToastVariant = 'success' | 'error'

export type ActionToast = {
  id: string
  message: string
  variant: ActionToastVariant
}

type Store = {
  toasts: ActionToast[]
  push: (t: Omit<ActionToast, 'id'>) => string
  remove: (id: string) => void
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useActionToastStore = create<Store>((set) => ({
  toasts: [],
  push: (t) => {
    const id = genId()
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    return id
  },
  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))
