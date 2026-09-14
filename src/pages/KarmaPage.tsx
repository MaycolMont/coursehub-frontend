import { useEffect, useState } from 'react'
import type { Rango } from '@/types'
import { usuariosService } from '@/services/usuarios.service'
import { rangosService } from '@/services/rangos.service'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface KarmaInfo {
  karma_acumulado: number
  rango_actual: Rango
  siguiente_rango: Rango | null
  progreso: number
}

const RANGO_ICONS: Record<string, string> = {
  'Novato': 'fiber_new',
  'Aprendiz': 'school',
  'Contribuidor': 'volunteer_activism',
  'Experto': 'star',
  'Maestro': 'military_tech',
  'Leyenda': 'emoji_events',
}

function getRangoIcon(nombre: string): string {
  for (const [key, icon] of Object.entries(RANGO_ICONS)) {
    if (nombre.toLowerCase().includes(key.toLowerCase())) return icon
  }
  return 'emoji_events'
}

export default function KarmaPage() {
  const [karmaInfo, setKarmaInfo] = useState<KarmaInfo | null>(null)
  const [rangos, setRangos] = useState<Rango[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([usuariosService.getKarma(), rangosService.list()])
      .then(([karmaData, rangosData]) => {
        if (active) {
          setKarmaInfo(karmaData)
          setRangos(rangosData.results)
        }
      })
      .catch(() => {
        if (active) {
          setKarmaInfo(null)
          setRangos([])
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-surface">
        <LoadingSpinner size={40} />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-secondary">
              token
            </span>
            <h1 className="font-display text-headline-lg font-bold text-on-surface">
              Karma y Rangos
            </h1>
          </div>
          <p className="mt-2 text-body-lg text-on-surface-variant">
            Gana karma compartiendo recursos y alcanza nuevos rangos.
          </p>
        </div>

        {/* Current Karma Card */}
        {karmaInfo && (
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card shadow-sm">
            <div className="bg-gradient-to-r from-primary-container to-secondary p-6 text-white sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                  <span className="material-symbols-outlined text-[32px]">
                    {getRangoIcon(karmaInfo.rango_actual.nombre_rango)}
                  </span>
                </div>
                <div>
                  <p className="text-body-sm text-white/80">Tu karma actual</p>
                  <p className="text-display font-bold">{karmaInfo.karma_acumulado}</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="font-medium text-white/90">
                    {karmaInfo.rango_actual.nombre_rango}
                  </span>
                  {karmaInfo.siguiente_rango && (
                    <span className="text-white/70">
                      Siguiente: {karmaInfo.siguiente_rango.nombre_rango}
                    </span>
                  )}
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{ width: `${Math.min(karmaInfo.progreso, 100)}%` }}
                  />
                </div>
                {karmaInfo.siguiente_rango && (
                  <p className="mt-1.5 text-body-sm text-white/70">
                    {Math.max(
                      0,
                      karmaInfo.siguiente_rango.karma_minimo - karmaInfo.karma_acumulado
                    )}{' '}
                    puntos para el siguiente rango
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rangos List */}
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 font-display text-title font-bold text-on-surface">
            Tabla de Rangos
          </h2>
          <div className="space-y-3">
            {rangos.map((rango) => {
              const isActive = karmaInfo?.rango_actual.id === rango.id
              const isLocked = karmaInfo
                ? karmaInfo.karma_acumulado < rango.karma_minimo
                : false

              return (
                <div
                  key={rango.id}
                  className={cn(
                    'flex items-center gap-4 rounded-xl border px-4 py-4 transition-all',
                    isActive
                      ? 'border-secondary bg-secondary/5 shadow-sm'
                      : 'border-border-subtle bg-surface',
                    isLocked && !isActive && 'opacity-60'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl',
                      isActive
                        ? 'bg-secondary text-on-primary'
                        : 'bg-surface-container-low text-outline'
                    )}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {getRangoIcon(rango.nombre_rango)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          'font-title font-bold',
                          isActive ? 'text-secondary' : 'text-on-surface'
                        )}
                      >
                        {rango.nombre_rango}
                      </p>
                      {isActive && (
                        <span className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-0.5 text-label-sm font-medium text-secondary">
                          Tu rango
                        </span>
                      )}
                    </div>
                    <p className="text-body-sm text-on-surface-variant">
                      {rango.karma_minimo} karma mínimo
                    </p>
                  </div>
                  {isLocked && !isActive && (
                    <span className="material-symbols-outlined text-[20px] text-outline">
                      lock
                    </span>
                  )}
                  {!isLocked && !isActive && (
                    <span className="material-symbols-outlined text-[20px] text-emerald-500">
                      check_circle
                    </span>
                  )}
                  {isActive && (
                    <span className="material-symbols-outlined text-[20px] text-secondary">
                      arrow_forward
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
