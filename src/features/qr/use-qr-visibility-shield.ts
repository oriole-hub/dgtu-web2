import { useEffect, useState } from 'react'

/**
 * Скрывает чувствительный контент, когда вкладка в фоне или окно браузера без фокуса.
 * Полностью запретить скриншот ОС из веб-страницы нельзя — это снижает риск при переключении на инструменты захвата экрана.
 */
export function useQrVisibilityShield(): boolean {
  const [safe, setSafe] = useState(() => computeSafe())

  useEffect(() => {
    const sync = () => setSafe(computeSafe())
    sync()
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('focus', sync)
    window.addEventListener('blur', sync)
    window.addEventListener('pageshow', sync)
    window.addEventListener('pagehide', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('focus', sync)
      window.removeEventListener('blur', sync)
      window.removeEventListener('pageshow', sync)
      window.removeEventListener('pagehide', sync)
    }
  }, [])

  return safe
}

function computeSafe(): boolean {
  if (document.visibilityState !== 'visible') return false
  if (typeof document.hasFocus === 'function' && !document.hasFocus()) return false
  return true
}
