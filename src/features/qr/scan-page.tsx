import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Camera, ScanLine } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ScanOut } from '@/lib/api-schema'
import { scannerScan } from '@/lib/api'

const REGION_ID = 'qr-reader-region'

export default function ScanPage() {
  const qc = useQueryClient()
  const [raw, setRaw] = useState('')
  const [last, setLast] = useState<string | null>(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanPending, setScanPending] = useState(false)
  const [scanResult, setScanResult] = useState<ScanOut | null>(null)
  const [scanErr, setScanErr] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const submitToken = useCallback(async (qr_token: string) => {
    setScanPending(true)
    setScanErr(null)
    setScanResult(null)
    try {
      const out = await scannerScan({ qr_token })
      setScanResult(out)
      void qc.invalidateQueries({ queryKey: ['scanner', 'present'] })
    } catch (e) {
      setScanErr(e instanceof Error ? e.message : 'Не удалось выполнить проверку')
    } finally {
      setScanPending(false)
    }
  }, [qc])

  const stopCamera = useCallback(async () => {
    const s = scannerRef.current
    scannerRef.current = null
    if (s) {
      try {
        await s.stop()
      } catch {
        /* ignore */
      }
      try {
        s.clear()
      } catch {
        /* ignore */
      }
    }
  }, [])

  useEffect(() => {
    if (!cameraOn) return

    const html5 = new Html5Qrcode(REGION_ID, { verbose: false })
    scannerRef.current = html5

    const start = async () => {
      try {
        await html5.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          (decodedText) => {
            setRaw(decodedText)
            setLast(decodedText)
            void stopCamera()
            setCameraOn(false)
            void submitToken(decodedText)
          },
          () => {},
        )
      } catch {
        setCameraError('Не удалось запустить камеру или сканер.')
        setCameraOn(false)
      }
    }

    void start()

    return () => {
      void stopCamera()
    }
  }, [cameraOn, stopCamera, submitToken])

  const value = last ?? raw

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Сканирование QR
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Сканируйте камерой или вставьте код вручную — система зарегистрирует
          вход или выход.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ScanLine className="h-5 w-5" />
            Ввод кода
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => {
                setCameraError(null)
                setCameraOn((v) => !v)
              }}
            >
              <Camera className="h-4 w-4" />
              {cameraOn ? 'Остановить камеру' : 'Сканировать с камеры'}
            </Button>
            {cameraOn && (
              <div
                id={REGION_ID}
                className="min-h-[260px] w-full overflow-hidden rounded-xl border border-slate-200 bg-black"
              />
            )}
            {cameraError && (
              <p className="text-sm text-red-600">{cameraError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="qr-raw">Код из QR</Label>
            <Input
              id="qr-raw"
              placeholder="Вставьте значение QR"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              setLast(raw)
              if (raw.trim()) void submitToken(raw.trim())
            }}
          >
            Проверить пропуск
          </Button>

          {scanPending && (
            <p className="text-sm text-slate-500">Проверка пропуска…</p>
          )}
          {scanErr && (
            <p className="text-sm text-red-600">{scanErr}</p>
          )}
          {scanResult && (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">
                {scanResult.ok ? 'Успешно' : 'Отклонено'}
              </p>
              <p className="mt-1">{scanResult.msg}</p>
              <p className="mt-1">
                {scanResult.user_full_name} · направление:{' '}
                {scanResult.direction}
              </p>
            </div>
          )}

          {last && !scanResult && !scanPending && (
            <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
              <p className="font-medium text-slate-800">Сырое значение</p>
              <p className="mt-1 break-all font-mono">{value}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
