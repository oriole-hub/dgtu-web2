import {
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { Gift, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AttendanceRecord, AttendanceStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AttendanceCalendarProps {
  attendance: AttendanceRecord[]
  streak: number
  merchThreshold: number
  onChangeAttendance: (attendance: AttendanceRecord[]) => void
  /** Только просмотр, без ручного редактирования */
  readOnly?: boolean
  punctualDaysTotal?: number
  className?: string
}

export function AttendanceCalendar({
  attendance,
  streak,
  merchThreshold,
  onChangeAttendance,
  readOnly = false,
  punctualDaysTotal,
  className,
}: AttendanceCalendarProps) {
  const anchor = new Date()
  const start = startOfMonth(anchor)
  const end = endOfMonth(anchor)
  const days = eachDayOfInterval({ start, end })
  const weekStart = start.getDay() === 0 ? 6 : start.getDay() - 1
  const pad = Array.from({ length: weekStart }, (_, i) => (
    <div key={`pad-${i}`} className="aspect-square" />
  ))
  const toNext = Math.max(0, merchThreshold - (streak % merchThreshold))
  const [manualDate, setManualDate] = useState('')
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('on_time')

  const byDate = useMemo(
    () => new Map(attendance.map((x) => [x.date, x.status])),
    [attendance],
  )

  const upsert = (date: string, status: AttendanceStatus) => {
    const next = attendance.filter((x) => x.date !== date)
    onChangeAttendance([...next, { date, status }].sort((a, b) => a.date.localeCompare(b.date)))
  }

  const remove = (date: string) => {
    onChangeAttendance(attendance.filter((x) => x.date !== date))
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Gift className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-medium text-slate-900">Серия посещений</p>
            <p className="text-sm text-slate-600">
              {readOnly && punctualDaysTotal != null ? (
                <>
                  Дней без опозданий:{' '}
                  <span className="font-semibold text-slate-900">
                    {punctualDaysTotal}
                  </span>
                </>
              ) : (
                <>
                  Текущая серия:{' '}
                  <span className="font-semibold text-slate-900">{streak}</span>{' '}
                  дней подряд. До корпоративного поощрения:{' '}
                  <span className="font-semibold text-slate-900">{toNext}</span>{' '}
                  визитов в серии (порог {merchThreshold}).
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium capitalize text-slate-700">
          {format(anchor, 'LLLL yyyy', { locale: ru })}
        </p>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase text-slate-400">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {pad}
          {days.map((d) => {
            const key = format(d, 'yyyy-MM-dd')
            const status = byDate.get(key) ?? 'absent'
            const cellClass = cn(
              'flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition-colors',
              status === 'on_time' && 'bg-[#1d4ed8] text-white',
              status === 'late' && 'bg-[#ff5500] text-white',
              status === 'absent' && 'bg-slate-200 text-slate-500',
            )
            return readOnly ? (
              <div
                key={d.toISOString()}
                className={cellClass}
                title={format(d, 'd MMMM', { locale: ru })}
              >
                {format(d, 'd')}
              </div>
            ) : (
              <button
                type="button"
                key={d.toISOString()}
                className={cellClass}
                title={format(d, 'd MMMM', { locale: ru })}
                onClick={() =>
                  upsert(
                    key,
                    status === 'on_time'
                      ? 'late'
                      : status === 'late'
                        ? 'absent'
                        : 'on_time',
                  )
                }
              >
                {format(d, 'd')}
              </button>
            )
          })}
        </div>
      </div>

      {!readOnly && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-medium text-slate-900">Ручное управление днями</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="manual-date">Дата</Label>
              <Input id="manual-date" type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={manualStatus} onValueChange={(v) => setManualStatus(v as AttendanceStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_time">Вовремя (синий)</SelectItem>
                  <SelectItem value="late">Опоздал (оранжевый)</SelectItem>
                  <SelectItem value="absent">Не пришёл (серый)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="button" className="gap-2" onClick={() => manualDate && upsert(manualDate, manualStatus)}>
                <Plus className="h-4 w-4" />
                Добавить/обновить
              </Button>
              <Button type="button" variant="outline" className="gap-2" onClick={() => manualDate && remove(manualDate)}>
                <Trash2 className="h-4 w-4" />
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
