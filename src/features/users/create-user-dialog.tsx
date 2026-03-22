import { useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createEmployeeAccount,
  createGuestAccount,
  fetchOffices,
} from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import type { EmployeeRole } from '@/lib/types'

const schema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    login: z.string().min(3),
    pwd: z.string().min(6),
    officeId: z.string(),
    employeeRole: z.enum(['employee', 'manager', 'guest']),
    position: z.string(),
    accountPurpose: z.string(),
    deletionDate: z.string().nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.officeId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Выберите офис',
        path: ['officeId'],
      })
    }
    if (data.employeeRole === 'guest') {
      if (!data.accountPurpose.trim() || data.accountPurpose.trim().length < 3) {
        ctx.addIssue({
          code: 'custom',
          message: 'Минимум 3 символа',
          path: ['accountPurpose'],
        })
      }
    } else {
      const pos = data.position.trim()
      if (!pos) {
        ctx.addIssue({
          code: 'custom',
          message: 'Укажите должность',
          path: ['position'],
        })
      }
    }
  })

type Form = z.infer<typeof schema>

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const qc = useQueryClient()
  const offices = useQuery({ queryKey: queryKeys.offices, queryFn: fetchOffices })

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      login: '',
      pwd: '',
      officeId: '',
      employeeRole: 'employee',
      position: '',
      accountPurpose: '',
      deletionDate: null,
    },
  })

  const officeId = useWatch({ control: form.control, name: 'officeId' })
  const employeeRole = useWatch({ control: form.control, name: 'employeeRole' })
  const deletionDate = useWatch({ control: form.control, name: 'deletionDate' })

  const mutation = useMutation({
    mutationFn: async (data: Form) => {
      const exp = data.deletionDate
        ? new Date(data.deletionDate).toISOString()
        : null
      if (data.employeeRole === 'guest') {
        return createGuestAccount({
          fullName: data.fullName,
          email: data.email,
          login: data.login,
          pwd: data.pwd,
          officeId: data.officeId,
          accountPurpose: data.accountPurpose.trim(),
          accountExpiresAt: exp,
        })
      }
      const position =
        data.employeeRole === 'manager' && !data.position.trim()
          ? 'Руководитель'
          : data.position.trim()
      return createEmployeeAccount({
        fullName: data.fullName,
        email: data.email,
        login: data.login,
        pwd: data.pwd,
        officeId: data.officeId,
        position,
        accountExpiresAt: exp,
      })
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.users })
      onOpenChange(false)
      form.reset({
        fullName: '',
        email: '',
        login: '',
        pwd: '',
        officeId: offices.data?.[0]?.id ?? '',
        employeeRole: 'employee',
        position: '',
        accountPurpose: '',
        deletionDate: null,
      })
    },
  })

  useEffect(() => {
    const first = offices.data?.[0]?.id
    if (first && !form.getValues('officeId')) {
      form.setValue('officeId', first)
    }
  }, [offices.data, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Новый пользователь</DialogTitle>
          <DialogDescription>
            Сотрудник, руководитель или гость — укажите офис, контакты и
            должность либо цель визита.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-fullName">ФИО</Label>
              <Input id="c-fullName" {...form.register('fullName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" {...form.register('email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-login">Логин</Label>
              <Input id="c-login" autoComplete="off" {...form.register('login')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-pwd">Пароль</Label>
              <Input id="c-pwd" type="password" {...form.register('pwd')} />
            </div>
            <div className="space-y-2">
              <Label>Тип</Label>
              <Select
                value={employeeRole}
                onValueChange={(v) => form.setValue('employeeRole', v as EmployeeRole)}
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
            <div className="space-y-2 sm:col-span-2">
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
              {form.formState.errors.officeId && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.officeId.message}
                </p>
              )}
            </div>
            {employeeRole !== 'guest' && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="c-position">Должность</Label>
                <Input
                  id="c-position"
                  placeholder="Например: инженер"
                  {...form.register('position')}
                />
                {form.formState.errors.position && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.position.message}
                  </p>
                )}
              </div>
            )}
            {employeeRole === 'guest' && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="c-purpose">Цель визита / назначение</Label>
                <Textarea
                  id="c-purpose"
                  rows={3}
                  placeholder="От 3 символов"
                  {...form.register('accountPurpose')}
                />
                {form.formState.errors.accountPurpose && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.accountPurpose.message}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-deleteDate">
                Дата окончания аккаунта (необязательно)
              </Label>
              <Input
                id="c-deleteDate"
                type="date"
                value={deletionDate ?? ''}
                onChange={(e) =>
                  form.setValue('deletionDate', e.target.value || null)
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Создание…' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
