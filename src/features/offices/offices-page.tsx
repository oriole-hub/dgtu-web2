import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createOffice, fetchOffices } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'

type OfficeDraft = {
  name: string
  city: string
  address: string
  regionLabel: string
  description: string
}

const emptyDraft = (): OfficeDraft => ({
  name: '',
  city: '',
  address: '',
  regionLabel: '',
  description: '',
})

export default function OfficesPage() {
  const qc = useQueryClient()
  const offices = useQuery({ queryKey: queryKeys.offices, queryFn: fetchOffices })
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<OfficeDraft>(emptyDraft)

  const create = useMutation({
    mutationFn: () =>
      createOffice({
        name: draft.name,
        address: draft.address,
        city: draft.city,
      }),
    onSuccess: () => {
      setOpen(false)
      void qc.invalidateQueries({ queryKey: queryKeys.offices })
      setDraft(emptyDraft())
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Офисы
        </h1>
        <p className="mt-1 text-sm text-slate-500">
            Список офисов в табличном формате с переходом в детальную карточку.
        </p>
      </div>
        <Button type="button" className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Добавить офис
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Офис</TableHead>
            <TableHead>Город</TableHead>
            <TableHead>Округ</TableHead>
            <TableHead>Адрес</TableHead>
            <TableHead className="text-right">Сотрудники</TableHead>
            <TableHead className="text-right">Точек присутствия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(offices.data ?? []).map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-medium">
                <Link to={`/offices/${o.id}`} className="text-[#6d28d9] hover:text-[#ff5500]">
                  {o.name}
                </Link>
              </TableCell>
              <TableCell>{o.city}</TableCell>
              <TableCell>{o.regionLabel}</TableCell>
              <TableCell>{o.address}</TableCell>
              <TableCell className="text-right">{o.employees}</TableCell>
              <TableCell className="text-right">{o.pointsPresence.toLocaleString('ru-RU')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Создать офис</DialogTitle>
            <DialogDescription>
              Укажите название, город, округ и адрес нового офиса.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Название</Label>
              <Input value={draft.name} onChange={(e) => setDraft((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Город</Label>
              <Input value={draft.city} onChange={(e) => setDraft((s) => ({ ...s, city: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Округ</Label>
              <Input value={draft.regionLabel} onChange={(e) => setDraft((s) => ({ ...s, regionLabel: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Адрес</Label>
              <Input value={draft.address} onChange={(e) => setDraft((s) => ({ ...s, address: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Описание</Label>
              <Textarea value={draft.description} onChange={(e) => setDraft((s) => ({ ...s, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="button" className="bg-[#ff5500] hover:bg-[#e84c00]" onClick={() => create.mutate()} disabled={create.isPending}>
              {create.isPending ? 'Сохранение…' : 'Сохранить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
