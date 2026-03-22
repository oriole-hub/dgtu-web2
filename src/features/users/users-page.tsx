import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreateUserDialog } from '@/features/users/create-user-dialog'
import { UserDetailDialog } from '@/features/users/user-detail-dialog'
import { useScannerPresentQueries } from '@/hooks/use-scanner-present-queries'
import { fetchOffices, fetchUsers } from '@/lib/api'
import {
  formatDurationSeconds,
  formatWorkMinutesForUi,
} from '@/lib/datetime-format'
import { isUserListedAsPresentInTheirOffice } from '@/lib/presence-utils'
import { queryKeys } from '@/lib/query-keys'
import type { UserRecord } from '@/lib/types'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

function PresenceDot({ inOffice }: { inOffice: boolean }) {
  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 shrink-0 rounded-full',
        inOffice ? 'bg-[#ff5500]' : 'bg-slate-300',
      )}
      style={
        inOffice
          ? { animation: 'pulse-orange 1.2s ease-in-out infinite' }
          : undefined
      }
      title={inOffice ? 'Сейчас в офисе' : 'Не в офисе'}
      role="img"
      aria-label={inOffice ? 'Сейчас в офисе' : 'Не в офисе'}
    />
  )
}

export default function UsersPage() {
  const sessionRole = useAuthStore((s) => s.user?.role)
  const [selected, setSelected] = useState<UserRecord | null>(null)
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const users = useQuery({ queryKey: queryKeys.users, queryFn: fetchUsers })
  const offices = useQuery({ queryKey: queryKeys.offices, queryFn: fetchOffices })

  const officeIds = useMemo(() => {
    const ids = new Set<string>()
    for (const u of users.data ?? []) {
      if (u.officeId) ids.add(u.officeId)
    }
    return Array.from(ids).sort()
  }, [users.data])

  const presentQueries = useScannerPresentQueries(sessionRole, officeIds)

  const officeName = useMemo(() => {
    const m = new Map((offices.data ?? []).map((o) => [o.id, o.city]))
    return (id: string) => m.get(id) ?? '—'
  }, [offices.data])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Сотрудники
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Таблица показателей и карточки с календарём и рефералами.
          </p>
        </div>
        <Button
          type="button"
          className="gap-2"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 pr-0" title="Присутствие в офисе">
              <span className="sr-only">В офисе</span>
            </TableHead>
            <TableHead>ФИО</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Должность</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Офис</TableHead>
            <TableHead className="text-right" title="Опоздание сегодня, минуты">
              Опоздание
            </TableHead>
            <TableHead
              className="text-right"
              title="Переработка сегодня, минуты"
            >
              Переработка
            </TableHead>
            <TableHead title="Последний вход по истории проходов (UTC)">
              Последний вход
            </TableHead>
            <TableHead title="Последний выход по истории проходов (UTC)">
              Последний выход
            </TableHead>
            <TableHead
              className="text-right"
              title="Длительность последнего завершённого перекура сегодня"
            >
              Перекур
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(users.data ?? []).map((u) => (
            <TableRow
              key={u.id}
              className="cursor-pointer"
              onClick={() => {
                setSelected(u)
                setOpen(true)
              }}
            >
              <TableCell className="w-10 pr-0 align-middle">
                <PresenceDot
                  inOffice={isUserListedAsPresentInTheirOffice(
                    u,
                    sessionRole,
                    officeIds,
                    presentQueries,
                  )}
                />
              </TableCell>
              <TableCell className="font-medium">{u.fullName}</TableCell>
              <TableCell className="text-slate-600">{u.email}</TableCell>
              <TableCell>{u.jobTitle}</TableCell>
              <TableCell>{u.employeeRole}</TableCell>
              <TableCell>
                {u.officeDisplay || officeName(u.officeId)}
              </TableCell>
              <TableCell className="text-right">
                {u.lateMinutesToday > 0
                  ? `${u.lateMinutesToday} мин`
                  : '—'}
              </TableCell>
              <TableCell className="text-right">
                {formatWorkMinutesForUi(u.overtimeMinutesToday)}
              </TableCell>
              <TableCell>{u.arrivalTime}</TableCell>
              <TableCell>{u.departureTime}</TableCell>
              <TableCell className="text-right">
                {u.lastBreakDurationSeconds != null
                  ? formatDurationSeconds(u.lastBreakDurationSeconds)
                  : u.breakMinutes > 0
                    ? `${u.breakMinutes} мин`
                    : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <UserDetailDialog
        user={selected}
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setSelected(null)
        }}
      />
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
