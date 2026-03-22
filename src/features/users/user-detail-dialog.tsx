import { useEffect, useMemo, useState } from 'react'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AttendanceCalendar } from '@/features/users/attendance-calendar'
import { fetchOffices, fetchUserAttendance, fetchUsers, saveUser } from '@/lib/api'
import {
  formatDurationSeconds,
  formatUtcIsoForUi,
  formatWorkMinutesForUi,
} from '@/lib/datetime-format'
import { queryKeys } from '@/lib/query-keys'
import type { AttendanceRecord, EmployeeRole, UserRecord } from '@/lib/types'

const schema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    officeId: z.string(),
    employeeRole: z.enum(['employee', 'manager', 'guest']),
    deletionDate: z.string().nullable(),
    referralCount: z.number().min(0),
    jobTitle: z.string(),
    accountPurpose: z.string().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.employeeRole === 'guest') {
      const p = (data.accountPurpose ?? '').trim()
      if (p.length > 0 && p.length < 3) {
        ctx.addIssue({
          code: 'custom',
          message: 'Минимум 3 символа',
          path: ['accountPurpose'],
        })
      }
    } else if (!data.jobTitle.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Укажите должность',
        path: ['jobTitle'],
      })
    }
  })

type Form = z.infer<typeof schema>

interface UserDetailDialogProps {
  user: UserRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
}: UserDetailDialogProps) {
  const qc = useQueryClient()
  const offices = useQuery({ queryKey: queryKeys.offices, queryFn: fetchOffices })
  const users = useQuery({ queryKey: queryKeys.users, queryFn: fetchUsers })

  const range = useMemo(() => {
    const anchor = new Date()
    return {
      from: format(startOfMonth(anchor), 'yyyy-MM-dd'),
      to: format(endOfMonth(anchor), 'yyyy-MM-dd'),
    }
  }, [])

  const attendanceQ = useQuery({
    queryKey: queryKeys.attendance(user?.id ?? '', range.from, range.to),
    queryFn: () => fetchUserAttendance(user!.id, range.from, range.to),
    enabled: open && !!user,
  })

  const attendanceFromApi: AttendanceRecord[] = useMemo(
    () =>
      (attendanceQ.data?.days ?? []).map((d) => ({
        date: d.date,
        status: d.status,
      })),
    [attendanceQ.data?.days],
  )

  const form = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const officeId = useWatch({ control: form.control, name: 'officeId' })
  const employeeRole = useWatch({ control: form.control, name: 'employeeRole' })
  const deletionDateWatch = useWatch({
    control: form.control,
    name: 'deletionDate',
  })

  useEffect(() => {
    if (!user) return
    form.reset({
      fullName: user.fullName,
      email: user.email,
      officeId: user.officeId,
      employeeRole: user.employeeRole,
      deletionDate: user.deletionDate,
      referralCount: user.referralCount,
      jobTitle: user.jobTitle === '—' ? '' : user.jobTitle,
      accountPurpose: user.accountPurpose ?? '',
    })
  }, [user, form])

  const mutation = useMutation({
    mutationFn: (data: Form) =>
      saveUser(user!.id, {
        fullName: data.fullName,
        email: data.email,
        employeeRole: data.employeeRole,
        officeId: data.officeId,
        deletionDate: data.deletionDate,
        referralCount: data.referralCount,
        jobTitle: data.jobTitle,
        accountPurpose: data.accountPurpose?.trim()
          ? data.accountPurpose.trim()
          : null,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.users })
      if (user) void qc.invalidateQueries({ queryKey: queryKeys.user(user.id) })
    },
  })

  const [referralSearch, setReferralSearch] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (open) setActiveTab('profile')
  }, [open, user?.id])

  if (!user) return null

  const referrals = (users.data ?? [])
    .filter((u) => u.id !== user.id)
    .filter((u) =>
      u.fullName.toLowerCase().includes(referralSearch.toLowerCase()),
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{user.fullName}</DialogTitle>
          <DialogDescription>
            Профиль, календарь посещений и реферальная программа. Календарь
            доступен только для просмотра.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="profile">Профиль</TabsTrigger>
              <TabsTrigger value="attendance">Календарь</TabsTrigger>
              <TabsTrigger value="referral">Рефералы</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">ФИО</Label>
                  <Input id="fullName" {...form.register('fullName')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...form.register('email')} />
                </div>
                <div className="space-y-2">
                  <Label>Роль</Label>
                  <Select
                    value={employeeRole}
                    onValueChange={(v) =>
                      form.setValue('employeeRole', v as EmployeeRole)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Сотрудник</SelectItem>
                      <SelectItem value="manager">Руководитель</SelectItem>
                      <SelectItem value="guest">Гость</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Офис</Label>
                  <Select
                    value={officeId}
                    onValueChange={(v) => form.setValue('officeId', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Офис" />
                    </SelectTrigger>
                    <SelectContent>
                      {(offices.data ?? []).map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.city} — {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {employeeRole !== 'guest' && (
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="jobTitle">Должность</Label>
                    <Input id="jobTitle" {...form.register('jobTitle')} />
                    {form.formState.errors.jobTitle && (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.jobTitle.message}
                      </p>
                    )}
                  </div>
                )}
                {employeeRole === 'guest' && (
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="accountPurpose">Цель визита</Label>
                    <Textarea
                      id="accountPurpose"
                      rows={3}
                      {...form.register('accountPurpose')}
                    />
                    {form.formState.errors.accountPurpose && (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.accountPurpose.message}
                      </p>
                    )}
                  </div>
                )}
                {employeeRole === 'guest' && (
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="deletionDate">Дата окончания аккаунта</Label>
                    <Input
                      id="deletionDate"
                      type="date"
                      value={deletionDateWatch ?? ''}
                      onChange={(e) =>
                        form.setValue('deletionDate', e.target.value || null)
                      }
                    />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="mb-2 text-sm font-medium text-slate-900">
                  Сегодня
                </p>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Опоздание, мин</dt>
                    <dd className="mt-0.5 text-slate-900">
                      {user.lateMinutesToday > 0
                        ? user.lateMinutesToday
                        : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Переработка</dt>
                    <dd className="mt-0.5 text-slate-900">
                      {formatWorkMinutesForUi(user.overtimeMinutesToday)}
                    </dd>
                  </div>
                </dl>
              </div>

              <Separator className="my-2" />
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="mb-3 text-sm font-medium text-slate-900">
                  Проходы и перекуры (турникет)
                </p>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">
                      Последний вход по всей истории (UTC)
                    </dt>
                    <dd className="mt-0.5 text-slate-900">{user.arrivalTime}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">
                      Последний выход по всей истории (UTC)
                    </dt>
                    <dd className="mt-0.5 text-slate-900">{user.departureTime}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">
                      Выход на последний завершённый перекур сегодня (UTC)
                    </dt>
                    <dd className="mt-0.5 text-slate-900">
                      {formatUtcIsoForUi(user.lastBreakOutAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">
                      Вход после этого перекура (UTC)
                    </dt>
                    <dd className="mt-0.5 text-slate-900">
                      {formatUtcIsoForUi(user.lastBreakInAt)}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">
                      Длительность этого перекура
                    </dt>
                    <dd className="mt-0.5 text-slate-900">
                      {formatDurationSeconds(user.lastBreakDurationSeconds)}
                    </dd>
                  </div>
                </dl>
              </div>
            </TabsContent>

            <TabsContent value="attendance">
              {attendanceQ.isLoading && (
                <p className="text-sm text-slate-500">Загрузка календаря…</p>
              )}
              {attendanceQ.isError && (
                <p className="text-sm text-red-600">
                  Не удалось загрузить посещаемость.
                </p>
              )}
              <AttendanceCalendar
                attendance={attendanceFromApi}
                streak={0}
                merchThreshold={20}
                onChangeAttendance={() => {}}
                readOnly
                punctualDaysTotal={attendanceQ.data?.punctual_days_total}
              />
            </TabsContent>

            <TabsContent value="referral" className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="space-y-2">
                  <Label htmlFor="referralCount">Приглашено по программе</Label>
                  <Input
                    id="referralCount"
                    type="number"
                    {...form.register('referralCount', {
                      valueAsNumber: true,
                      setValueAs: (v) =>
                        v === '' || Number.isNaN(Number(v)) ? 0 : Number(v),
                    })}
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="ref-search">Поиск по ФИО</Label>
                  <Input
                    id="ref-search"
                    value={referralSearch}
                    onChange={(e) => setReferralSearch(e.target.value)}
                    placeholder="Введите ФИО"
                  />
                </div>
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ФИО</TableHead>
                        <TableHead>Роль</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals.map((refUser) => (
                        <TableRow key={refUser.id}>
                          <TableCell>{refUser.fullName}</TableCell>
                          <TableCell>{refUser.employeeRole}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {activeTab !== 'attendance' && (
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Сохранение…' : 'Сохранить изменения'}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
