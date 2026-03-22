import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createAdmin, fetchOffices, listAdmins } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/stores/auth-store'

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  login: z.string().min(3),
  pwd: z.string().min(6),
  officeId: z.string().min(1),
})

type Form = z.infer<typeof schema>

export default function AdminsPage() {
  const role = useAuthStore((s) => s.user?.role)
  const qc = useQueryClient()
  const offices = useQuery({ queryKey: queryKeys.offices, queryFn: fetchOffices })
  const list = useQuery({ queryKey: queryKeys.admins, queryFn: listAdmins })
  const form = useForm<Form>({ resolver: zodResolver(schema) })
  const officeId = useWatch({ control: form.control, name: 'officeId' })

  const mut = useMutation({
    mutationFn: (data: Form) =>
      createAdmin({
        fullName: data.fullName,
        email: data.email,
        login: data.login,
        pwd: data.pwd,
        officeId: data.officeId,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.admins })
      void qc.invalidateQueries({ queryKey: queryKeys.users })
      form.reset()
    },
  })

  if (role !== 'main') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Администраторы
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Создание администратора и привязка к офису (только для главного
          пользователя).
        </p>
      </div>

      <form
        className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={form.handleSubmit((d) => mut.mutate(d))}
      >
        <div className="space-y-2">
          <Label htmlFor="a-name">ФИО</Label>
          <Input id="a-name" {...form.register('fullName')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="a-email">Email</Label>
          <Input id="a-email" type="email" {...form.register('email')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="a-login">Логин</Label>
          <Input id="a-login" {...form.register('login')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="a-pwd">Пароль</Label>
          <Input id="a-pwd" type="password" {...form.register('pwd')} />
        </div>
        <div className="space-y-2">
          <Label>Офис</Label>
          <Select
            value={officeId}
            onValueChange={(v) => form.setValue('officeId', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите офис" />
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
        <Button type="submit" disabled={mut.isPending}>
          {mut.isPending ? 'Создание…' : 'Создать администратора'}
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Имя</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Логин</TableHead>
            <TableHead>Роль</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(list.data ?? []).map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.name}</TableCell>
              <TableCell>{a.email}</TableCell>
              <TableCell>{a.login}</TableCell>
              <TableCell>Администратор</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
