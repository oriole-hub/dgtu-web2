import { useId } from 'react'
import { useMutation } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { generatePass, revokePass } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { useQrVisibilityShield } from '@/features/qr/use-qr-visibility-shield'

export default function AdminQrPage() {
  const user = useAuthStore((s) => s.user)
  const qrGradId = `qr-rad-${useId().replace(/:/g, '')}`
  const safeToShowQr = useQrVisibilityShield()

  const gen = useMutation({
    mutationFn: () => generatePass(),
  })

  const revoke = useMutation({
    mutationFn: () => revokePass(),
    onSuccess: () => {
      gen.reset()
    },
  })

  const token = gen.data?.qr_token ?? ''
  const expires = gen.data?.expires_at

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          QR-пропуск
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Одноразовый код на несколько минут — покажите его на проходной. Код
          скрывается, если уйти с вкладки или снять фокус с окна (скриншот ОС
          из браузера полностью заблокировать нельзя).
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Ваш пропуск</CardTitle>
          <CardDescription>
            {user?.name ?? '—'} ({user?.email})
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              variant="accent"
              onClick={() => gen.mutate()}
              disabled={gen.isPending}
            >
              {gen.isPending ? 'Запрос…' : 'Сгенерировать QR'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => revoke.mutate()}
              disabled={revoke.isPending || !token}
            >
              Отозвать
            </Button>
          </div>
          {gen.isError && (
            <p className="text-center text-sm text-red-600">
              {(gen.error as Error).message}
            </p>
          )}
          {token && (
            <div
              className="flex w-full flex-col items-center gap-4 print:hidden"
              onContextMenu={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              style={{
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
              }}
            >
              {safeToShowQr ? (
                <>
                  <svg
                    width={0}
                    height={0}
                    className="absolute"
                    aria-hidden
                  >
                    <defs>
                      <radialGradient
                        id={qrGradId}
                        cx="50%"
                        cy="50%"
                        r="65%"
                        fx="50%"
                        fy="50%"
                      >
                        <stop offset="0%" stopColor="#000000" />
                        <stop offset="100%" stopColor="#7700FF" />
                      </radialGradient>
                    </defs>
                  </svg>
                  <div className="rounded-3xl bg-white p-3 shadow-inner ring-1 ring-slate-100">
                    <div className="relative inline-flex items-center justify-center">
                      <QRCodeSVG
                        value={token}
                        size={220}
                        level="H"
                        marginSize={1}
                        bgColor="#FFFFFF"
                        fgColor={`url(#${qrGradId})`}
                        imageSettings={{
                          src: '/logo.png',
                          height: 52,
                          width: 52,
                          excavate: true,
                        }}
                      />
                    </div>
                  </div>
                  <p className="break-all text-center font-mono text-xs text-slate-500">
                    {token}
                  </p>
                </>
              ) : (
                <div
                  className="flex min-h-[244px] w-full max-w-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm text-slate-600"
                  role="status"
                  aria-live="polite"
                >
                  <p className="font-medium text-slate-800">Код скрыт</p>
                  <p className="mt-2 text-slate-500">
                    Верните фокус на это окно и оставьте вкладку активной, чтобы
                    снова показать QR.
                  </p>
                </div>
              )}
              {expires && (
                <p className="text-xs text-slate-500">
                  Действует до:{' '}
                  {new Date(expires).toLocaleString('ru-RU')}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
