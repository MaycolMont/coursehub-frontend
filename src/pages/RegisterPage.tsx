import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/utils'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, login } = useAuth()

  const [correo, setCorreo] = useState('')
  const [pseudonimo, setPseudonimo] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordValid = password.length >= 8

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!correo.trim() || !pseudonimo.trim() || !password || !confirmPassword) {
      setError('Completa todos los campos.')
      return
    }

    if (!correo.trim().endsWith('@espol.edu.ec')) {
      setError('Debes usar un correo institucional @espol.edu.ec')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)
    try {
      await register(correo.trim(), pseudonimo.trim(), password)
      await login(correo.trim(), password)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Error al crear la cuenta. Intenta de nuevo.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-8 shadow-lg">
          {/* Branding */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container">
              <span className="material-symbols-outlined text-[28px] text-on-primary">
                school
              </span>
            </div>
            <h1 className="font-display text-headline-md font-bold text-on-surface">
              Crear Cuenta
            </h1>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Únete a la comunidad politécnica
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-error/20 bg-error/5 px-4 py-3">
              <span className="material-symbols-outlined mt-0.5 text-[18px] text-error">
                error
              </span>
              <p className="text-body-sm text-error">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="correo"
                className="mb-1.5 block text-label-md font-medium text-on-surface"
              >
                Correo institucional
              </label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                  mail
                </span>
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="tu@espol.edu.ec"
                  autoComplete="email"
                  className="w-full rounded-xl border border-border-subtle bg-surface py-3 pl-10 pr-4 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-secondary"
                />
              </div>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                Solo se aceptan correos @espol.edu.ec
              </p>
            </div>

            {/* Pseudonimo */}
            <div>
              <label
                htmlFor="pseudonimo"
                className="mb-1.5 block text-label-md font-medium text-on-surface"
              >
                Pseudónimo
              </label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                  person
                </span>
                <input
                  id="pseudonimo"
                  type="text"
                  value={pseudonimo}
                  onChange={(e) => setPseudonimo(e.target.value)}
                  placeholder="Tu apodo en la comunidad"
                  className="w-full rounded-xl border border-border-subtle bg-surface py-3 pl-10 pr-4 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-secondary"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-label-md font-medium text-on-surface"
              >
                Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
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
              {password.length > 0 && (
                <p
                  className={`mt-1 text-body-sm ${
                    passwordValid ? 'text-emerald-600' : 'text-on-surface-variant'
                  }`}
                >
                  {passwordValid
                    ? 'Contraseña válida'
                    : 'Mínimo 8 caracteres requeridos'}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-label-md font-medium text-on-surface"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                  lock
                </span>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-border-subtle bg-surface py-3 pl-10 pr-4 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-secondary"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 text-body-md font-semibold text-on-primary transition-colors hover:bg-secondary-container disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  autorenew
                </span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    person_add
                  </span>
                  Crear Cuenta
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-body-sm text-on-surface-variant">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-medium text-secondary hover:text-secondary-container"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
