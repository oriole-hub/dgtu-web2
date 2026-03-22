import type { ActionToastVariant } from '@/stores/action-toast-store'
import { useActionToastStore } from '@/stores/action-toast-store'

export function pushActionToast(
  message: string,
  variant: ActionToastVariant,
): void {
  useActionToastStore.getState().push({ message, variant })
}
