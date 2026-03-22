import { Focus, MoreVertical, Search } from 'lucide-react'
import { MAP_MARKERS, MAP_TOTAL_RUSSIA } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface RussiaMapProps {
  className?: string
  onSelectRegion?: (id: string) => void
  activeId?: string | null
}

const RUSSIA_PATH =
  'M120 40 C200 20 320 15 420 35 C520 55 600 30 680 45 C760 60 820 90 840 140 C860 200 820 260 780 300 C740 340 680 360 620 370 C540 385 460 400 380 395 C300 390 220 370 160 330 C100 290 60 230 50 170 C40 110 70 60 120 40 Z'

export function RussiaMap({
  className,
  onSelectRegion,
  activeId,
}: RussiaMapProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
        className,
      )}
    >
      <div className="border-b border-slate-100 px-5 py-4 text-left text-sm text-slate-700">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-slate-900"
            aria-hidden
          />
          Количество точек присутствия, шт. Всего по России{' '}
          <span className="font-semibold text-slate-900">
            {MAP_TOTAL_RUSSIA.toLocaleString('ru-RU')} шт.
          </span>
        </span>
      </div>

      <div className="relative aspect-[16/9] w-full bg-slate-50">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 900 480"
          role="img"
          aria-label="Карта присутствия по федеральным округам"
        >
          <defs>
            <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
          <path d={RUSSIA_PATH} fill="url(#land)" stroke="#fff" strokeWidth="2" />
          {MAP_MARKERS.map((m) => {
            const selected = activeId === m.id
            return (
              <g key={m.id}>
                <circle
                  cx={(m.x / 100) * 900}
                  cy={(m.y / 100) * 480}
                  r={selected ? 30 : 26}
                  className="cursor-pointer fill-slate-900 transition-all hover:fill-slate-800"
                  onClick={() => onSelectRegion?.(m.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectRegion?.(m.id)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${m.label}, ${m.count.toLocaleString('ru-RU')}`}
                />
                <text
                  x={(m.x / 100) * 900}
                  y={(m.y / 100) * 480 + 4}
                  textAnchor="middle"
                  className="pointer-events-none fill-white text-[9px] font-bold"
                >
                  {(m.count / 1000).toFixed(0)}k
                </text>
              </g>
            )
          })}
        </svg>

        <div className="pointer-events-none absolute bottom-4 left-4 flex gap-2 rounded-lg border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">
          <button
            type="button"
            className="pointer-events-auto rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="Рамка"
          >
            <Focus className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="pointer-events-auto rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="Поиск"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="pointer-events-auto rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="Ещё"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="px-5 py-2 text-left text-xs text-slate-400">Служба поддержки</p>
    </div>
  )
}
