import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginRequest } from '@/lib/api'
import { cn } from '@/lib/utils'

const schema = z.object({
  login: z.string().min(3, 'Минимум 3 символа'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

type Form = z.infer<typeof schema>

const inputClass =
  'rounded-xl border-0 bg-[#E8F0FE] shadow-none focus-visible:ring-2 focus-visible:ring-[#ff5500]/40 focus-visible:ring-offset-0'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [err, setErr] = useState<string | null>(null)

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ??
    '/'

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { login: '', password: '' },
  })

  const login = useMutation({
    mutationFn: (data: Form) => loginRequest(data.login, data.password),
    onSuccess: () => {
      navigate(from, { replace: true })
    },
    onError: (e: Error) => setErr(e.message),
  })

  return (
    <div
      className="relative min-h-svh overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 120% 80% at 50% 0%, #fff0e6 0%, #fff8f2 35%, #fefcfa 70%, #fff5eb 100%)',
      }}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="loginWaves" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff5500" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff8833" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M0,120 Q200,80 400,130 T800,100 T1200,140 T1600,90 L1600,0 L0,0 Z"
          fill="none"
          stroke="url(#loginWaves)"
          strokeWidth="1.2"
        />
        <path
          d="M0,200 Q300,260 600,210 T1200,250 T1600,200"
          fill="none"
          stroke="url(#loginWaves)"
          strokeWidth="0.9"
          opacity="0.7"
        />
        <path
          d="M0,320 Q250,280 500,330 T1000,300 T1600,340"
          fill="none"
          stroke="url(#loginWaves)"
          strokeWidth="0.8"
          opacity="0.5"
        />
      </svg>

      <div className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col gap-12 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-10">
        <div className="flex w-full max-w-lg flex-col items-center text-center lg:pt-0">
          <div
            className="flex size-[11.5rem] shrink-0 items-center justify-center rounded-3xl bg-white p-4 shadow-md ring-1 ring-slate-100/80 transition-[box-shadow] duration-300 ease-out hover:shadow-[0_0_22px_rgba(255,133,51,0.5),0_0_48px_rgba(255,85,0,0.18),0_12px_28px_rgba(0,0,0,0.06)] md:size-[13.5rem] md:p-5"
            role="presentation"
          >
            <img
              src="/logo.png"
              alt="Ростелеком"
              className="h-[7.25rem] w-auto max-w-full object-contain md:h-[8.75rem]"
            />
          </div>
          <h1 className="mt-10 max-w-md text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Панель администратора
          </h1>
          <p className="mt-3 max-w-md text-base text-slate-500 md:text-lg">
            Учёт посещаемости, офисы и доступ
          </p>
        </div>

        <div className="w-full max-w-md lg:mx-0 lg:shrink-0">
          <div className="rounded-3xl bg-white p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] ring-1 ring-slate-100">
            <h2 className="text-2xl font-bold text-slate-900">Вход</h2>
            <p className="mt-2 text-sm text-slate-500">
              Введите учётные данные организации
            </p>
            <form
              className="mt-8 space-y-5"
              onSubmit={form.handleSubmit((data) => {
                setErr(null)
                login.mutate(data)
              })}
            >
              <div className="space-y-2">
                <Label htmlFor="login" className="text-slate-600">
                  Логин
                </Label>
                <Input
                  id="login"
                  autoComplete="username"
                  className={cn(inputClass)}
                  {...form.register('login')}
                />
                {form.formState.errors.login && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.login.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-600">
                  Пароль
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={cn(inputClass)}
                  {...form.register('password')}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <Button
                type="submit"
                variant="accent"
                className="h-11 w-full rounded-xl text-base font-semibold"
                disabled={login.isPending}
              >
                {login.isPending ? 'Вход…' : 'Войти'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
