import { Link, NavLink } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutRequest } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/', label: 'Обзор' },
  { to: '/users', label: 'Сотрудники' },
  { to: '/offices', label: 'Офисы' },
  { to: '/qr', label: 'QR входа' },
  { to: '/scan', label: 'Скан QR' },
]

export function SiteHeader() {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Ростелеком"
              className="h-16 w-auto md:h-[4.5rem]"
            />
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 transition-colors',
                    isActive
                      ? 'bg-violet-50 font-medium text-[#6d28d9]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            {user?.role === 'main' && (
              <NavLink
                to="/admins"
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 transition-colors',
                    isActive
                      ? 'bg-violet-50 font-medium text-[#6d28d9]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )
                }
              >
                Администраторы
              </NavLink>
            )}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          {user ? (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => void logoutRequest()}
            >
              Выйти
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/login" className="gap-1.5">
                <LogIn className="h-4 w-4" />
                Войти
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
