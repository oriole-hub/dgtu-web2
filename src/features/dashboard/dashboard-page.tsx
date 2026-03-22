import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Clock3, Users } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useScannerPresentQueries } from '@/hooks/use-scanner-present-queries'
import { fetchOffices, fetchUsers } from '@/lib/api'
import { countUniquePresentUserIds } from '@/lib/presence-utils'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/stores/auth-store'

export default function DashboardPage() {
  const session = useAuthStore((s) => s.user)
  const users = useQuery({ queryKey: queryKeys.users, queryFn: fetchUsers })
  const offices = useQuery({ queryKey: queryKeys.offices, queryFn: fetchOffices })

  const officeIds = useMemo(() => {
    const ids = new Set<string>()
    for (const u of users.data ?? []) {
      if (u.officeId) ids.add(u.officeId)
    }
    return Array.from(ids).sort()
  }, [users.data])

  const presentQueries = useScannerPresentQueries(session?.role, officeIds)

  const presentCount = countUniquePresentUserIds(presentQueries)

  const presentLoading =
    users.isPending ||
    presentQueries.some((q) => q.isPending && q.data === undefined)

  const totalEmployees = useMemo(
    () => (users.data ?? []).filter((u) => u.employeeRole !== 'guest').length,
    [users.data],
  )
  const totalGuests = useMemo(
    () => (users.data ?? []).filter((u) => u.employeeRole === 'guest').length,
    [users.data],
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Обзор
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Пользователи, офисы и кто сейчас в здании.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-100 bg-gradient-to-br from-white to-orange-50/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Сотрудники
            </CardTitle>
            <Users className="h-4 w-4 text-[#ff5500]" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalEmployees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Офисы
            </CardTitle>
            <Building2 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {offices.data?.length ?? '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Гости
            </CardTitle>
            <Clock3 className="h-4 w-4 text-[#ff5500]" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalGuests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Сейчас в офисе
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {presentLoading ? '…' : presentCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-[32px] border border-orange-100 bg-gradient-to-r from-[#f0eeff] via-white to-orange-50 p-8 shadow-sm">
        <img src="/logo.png" alt="Ростелеком" className="h-16 w-auto md:h-20" />
        <h2 className="mt-5 text-lg font-semibold text-slate-900">
          Контроль присутствия и офисов
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Вошли как{' '}
          <span className="font-medium">{session?.name ?? '—'}</span> (
          {session?.login}). Журнал сканирования и генерация пропусков — в
          разделах «Скан QR» и «QR входа».
        </p>
      </div>
    </div>
  )
}
