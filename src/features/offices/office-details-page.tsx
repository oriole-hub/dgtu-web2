import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchOffice, saveOffice } from '@/lib/api'
import { IANA_TIMEZONE_OPTIONS } from '@/lib/iana-timezones'
import { queryKeys } from '@/lib/query-keys'

export default function OfficeDetailsPage() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const office = useQuery({
    queryKey: queryKeys.office(id),
    queryFn: () => fetchOffice(id),
  })
  const [edit, setEdit] = useState(false)
  const [draft, setDraft] = useState<{
    workStartTime: string
    ianaTimezone: string
  }>({ workStartTime: '', ianaTimezone: '' })

  const save = useMutation({
    mutationFn: () =>
      saveOffice(id, {
        workStartTime: draft.workStartTime || undefined,
        ianaTimezone: draft.ianaTimezone || undefined,
      }),
    onSuccess: () => {
      setEdit(false)
      void qc.invalidateQueries({ queryKey: queryKeys.offices })
      void qc.invalidateQueries({ queryKey: queryKeys.office(id) })
    },
  })

  const item = office.data

  const tzValue = edit
    ? draft.ianaTimezone || item?.ianaTimezone || 'Europe/Moscow'
    : item?.ianaTimezone || 'Europe/Moscow'

  const timezoneOptions = useMemo(() => {
    if (IANA_TIMEZONE_OPTIONS.some((o) => o.value === tzValue)) {
      return IANA_TIMEZONE_OPTIONS
    }
    return [
      { value: tzValue, label: `${tzValue} (текущая)` },
      ...IANA_TIMEZONE_OPTIONS,
    ]
  }, [tzValue])

  if (office.isPending) {
    return <p className="text-sm text-slate-500">Загрузка офиса…</p>
  }
  if (!item) {
    return <p className="text-sm text-slate-500">Офис не найден</p>
  }

  const workStart = (draft.workStartTime || item.workStartTime || '09:00:00').slice(
    0,
    8,
  )
  const timeInputValue = workStart.slice(0, 5)

  const mapAddressLine = [item.city, item.address].filter(Boolean).join(', ')
  const mapQuery = encodeURIComponent(mapAddressLine || item.name)
  const mapWidgetSrc = `https://yandex.ru/map-widget/v1/?z=16&text=${mapQuery}`
  const yandexMapsHref = `https://yandex.ru/maps/?text=${mapQuery}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {item.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {item.city}, {item.address}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация об офисе</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Название</Label>
            <Input disabled value={item.name} />
          </div>
          <div className="space-y-2">
            <Label>Город</Label>
            <Input disabled value={item.city} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Адрес</Label>
            <Input disabled value={item.address} />
          </div>
          <div className="space-y-2">
            <Label>Начало рабочего дня (локальное)</Label>
            <Input
              disabled={!edit}
              type="time"
              step={1}
              value={timeInputValue}
              onChange={(e) =>
                setDraft((s) => ({
                  ...s,
                  workStartTime: `${e.target.value}:00`,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Часовой пояс</Label>
            <Select
              disabled={!edit}
              value={tzValue}
              onValueChange={(v) =>
                setDraft((s) => ({ ...s, ianaTimezone: v }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите пояс" />
              </SelectTrigger>
              <SelectContent>
                {timezoneOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle>Карта офиса (Яндекс)</CardTitle>
          <a
            href={yandexMapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#ff5500] hover:text-[#e84c00]"
          >
            Открыть адрес в Яндекс.Картах
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </CardHeader>
        <CardContent>
          <iframe
            title={`Яндекс карта ${item.name}`}
            src={mapWidgetSrc}
            className="h-[420px] w-full rounded-xl border border-slate-200"
          />
        </CardContent>
      </Card>

      {edit && (
        <div className="flex justify-end">
          <Button
            type="button"
            className="bg-[#ff5500] hover:bg-[#e84c00]"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            {save.isPending ? 'Сохранение…' : 'Сохранить расписание'}
          </Button>
        </div>
      )}
    </div>
  )
}
