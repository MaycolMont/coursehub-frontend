import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { cn, extractErrorMessage } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const ROL_LABELS: Record<string, { label: string; color: string }> = {
  estudiante: { label: 'Estudiante', color: 'bg-secondary/10 text-secondary' },
  moderador: { label: 'Moderador', color: 'bg-badge-exam-bg text-badge-exam-fg' },
  administrador: { label: 'Administrador', color: 'bg-badge-lab-bg text-badge-lab-fg' },
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [pseudonimo, setPseudonimo] = useState('')
  const [editando, setEditando] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [editError, setEditError] = useState('')

  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (user) {
      // Sync form state with the authenticated user loaded from context
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPseudonimo(user.pseudonimo)
      setLoading(false)
    }
  }, [user])

  const handleUpdatePseudonimo = async (e: FormEvent) => {
    e.preventDefault()
    setEditError('')
    setEditSuccess(false)

    if (!pseudonimo.trim()) {
      setEditError('El pseudónimo no puede estar vacío.')
      return
    }

    try {
      await updateProfile({ pseudonimo: pseudonimo.trim() })
      setEditSuccess(true)
      setEditando(false)
      setTimeout(() => setEditSuccess(false), 3000)
    } catch (err: unknown) {
      setEditError(extractErrorMessage(err, 'Error al actualizar el perfil.'))
    }
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (!passwordActual || !passwordNueva) {
      setPasswordError('Completa ambos campos de contraseña.')
      return
    }

    if (passwordNueva.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }

    setPasswordLoading(true)
    try {
      await api.post('/api/auth/change-password/', {
        password_actual: passwordActual,
        password_nueva: passwordNueva,
      })
      setPasswordSuccess(true)
      setPasswordActual('')
      setPasswordNueva('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err: unknown) {
      setPasswordError(extractErrorMessage(err, 'Error al cambiar la contraseña.'))
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-surface">
        <LoadingSpinner size={40} />
      </main>
    )
  }

  if (!user) return null

  const rol = ROL_LABELS[user.rol] ?? ROL_LABELS.estudiante
  const registerDate = new Date(user.fecha_registro).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="min-h-screen bg-surface px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-container text-headline-md font-bold text-on-primary">
              {user.pseudonimo.charAt(0).toUpperCase()}
            </div>

            <div className="text-center sm:text-left">
              <h1 className="font-display text-headline-md font-bold text-on-surface">
                {user.pseudonimo}
              </h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm font-medium',
                    rol.color
                  )}
                >
                  {rol.label}
                </span>
                <Link
                  to="/karma"
                  className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-0.5 text-label-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[14px]">token</span>
                  {user.karma_acumulado} karma
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mi actividad */}
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 font-display text-title font-bold text-on-surface">
            Mi actividad
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              to="/karma"
              className="group flex items-center gap-3 rounded-xl bg-surface px-4 py-4 transition-colors hover:border hover:border-secondary/30 hover:ring-1 hover:ring-secondary/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined text-[22px]">token</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body-md font-semibold text-on-surface">Karma</p>
                <p className="text-body-sm text-on-surface-variant">
                  {user.karma_acumulado} puntos
                </p>
              </div>
              <span className="material-symbols-outlined text-[20px] text-outline transition-colors group-hover:text-secondary">
                arrow_forward
              </span>
            </Link>

            <Link
              to="/guardados"
              className="group flex items-center gap-3 rounded-xl bg-surface px-4 py-4 transition-colors hover:border hover:border-secondary/30 hover:ring-1 hover:ring-secondary/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined text-[22px]">bookmark</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body-md font-semibold text-on-surface">Guardados</p>
                <p className="text-body-sm text-on-surface-variant">
                  Ver mis recursos guardados
                </p>
              </div>
              <span className="material-symbols-outlined text-[20px] text-outline transition-colors group-hover:text-secondary">
                arrow_forward
              </span>
            </Link>

            <Link
              to="/subir"
              className="group flex items-center gap-3 rounded-xl bg-surface px-4 py-4 transition-colors hover:border hover:border-secondary/30 hover:ring-1 hover:ring-secondary/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined text-[22px]">upload_file</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body-md font-semibold text-on-surface">Subir recurso</p>
                <p className="text-body-sm text-on-surface-variant">
                  Comparte material de estudio
                </p>
              </div>
              <span className="material-symbols-outlined text-[20px] text-outline transition-colors group-hover:text-secondary">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 font-display text-title font-bold text-on-surface">
            Información de la cuenta
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3">
              <span className="material-symbols-outlined text-[20px] text-outline">
                mail
              </span>
              <div>
                <p className="text-body-sm text-on-surface-variant">
                  Correo institucional
                </p>
                <p className="text-body-md font-medium text-on-surface">
                  {user.correo_institucional}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3">
              <span className="material-symbols-outlined text-[20px] text-outline">
                calendar_today
              </span>
              <div>
                <p className="text-body-sm text-on-surface-variant">
                  Fecha de registro
                </p>
                <p className="text-body-md font-medium text-on-surface">
                  {registerDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 font-display text-title font-bold text-on-surface">
            Editar perfil
          </h2>

          {editSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-body-sm text-emerald-700">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Pseudónimo actualizado correctamente.
            </div>
          )}
          {editError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-body-sm text-error">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {editError}
            </div>
          )}

          <form onSubmit={handleUpdatePseudonimo} className="space-y-4">
            <div>
              <label
                htmlFor="pseudonimo"
                className="mb-1.5 block text-label-md font-medium text-on-surface"
              >
                Pseudónimo
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                    person
                  </span>
                  <input
                    id="pseudonimo"
                    type="text"
                    value={pseudonimo}
                    onChange={(e) => {
                      setPseudonimo(e.target.value)
                      setEditando(true)
                    }}
                    className="w-full rounded-xl border border-border-subtle bg-surface py-3 pl-10 pr-4 text-body-md text-on-surface outline-none transition-colors focus:border-secondary"
                  />
                </div>
                {editando && (
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-secondary px-5 py-3 text-body-md font-semibold text-on-primary transition-colors hover:bg-secondary-container"
                  >
                    Guardar
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 font-display text-title font-bold text-on-surface">
            Cambiar contraseña
          </h2>

          {passwordSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-body-sm text-emerald-700">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Contraseña actualizada correctamente.
            </div>
          )}
          {passwordError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-body-sm text-error">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label
                htmlFor="password_actual"
                className="mb-1.5 block text-label-md font-medium text-on-surface"
              >
                Contraseña actual
              </label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                  lock
                </span>
                <input
                  id="password_actual"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-border-subtle bg-surface py-3 pl-10 pr-11 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-secondary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="password_nueva"
                className="mb-1.5 block text-label-md font-medium text-on-surface"
              >
                Nueva contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                  lock
                </span>
                <input
                  id="password_nueva"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordNueva}
                  onChange={(e) => setPasswordNueva(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-border-subtle bg-surface py-3 pl-10 pr-4 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-secondary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 text-body-md font-semibold text-on-primary transition-colors hover:bg-secondary-container disabled:opacity-60"
            >
              {passwordLoading ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  autorenew
                </span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    lock_reset
                  </span>
                  Cambiar contraseña
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
