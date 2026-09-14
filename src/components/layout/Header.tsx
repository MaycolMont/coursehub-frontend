import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { SearchModal } from '@/components/layout/SearchModal'

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/materias', label: 'Materias' },
  { to: '/subir', label: 'Subir Aporte' },
]

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const [searchKey, setSearchKey] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
        setSearchKey((k) => k + 1)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function closeMenus() {
    setIsMobileMenuOpen(false)
    setIsProfileOpen(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border-subtle">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-on-primary-container">
              <span className="material-symbols-outlined text-[28px] text-secondary">
                school
              </span>
              <span className="text-title font-bold hidden sm:block">
                CourseHub <span className="font-normal text-on-surface-variant">ESPOL</span>
              </span>
            </Link>

            <nav className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'rounded-lg px-3 py-2 text-label-md font-medium transition-colors',
                    location.pathname === link.to
                      ? 'bg-secondary/10 text-secondary'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsSearchOpen(true)
                setSearchKey((k) => k + 1)
              }}
              className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-card px-3 py-1.5 text-body-sm text-outline transition-colors hover:border-secondary/30"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span className="hidden sm:block">Buscar...</span>
              <kbd className="hidden md:inline-flex items-center rounded border border-border-subtle bg-surface px-1 text-label-sm">
                ⌘K
              </kbd>
            </button>

            {isAuthenticated && user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-on-primary text-label-md font-medium transition-colors hover:bg-secondary/90"
                >
                  {user.pseudonimo.charAt(0).toUpperCase()}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border-subtle bg-surface-card shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-subtle">
                      <p className="text-body-md font-medium text-on-surface truncate">
                        {user.pseudonimo}
                      </p>
                      <p className="text-label-sm text-outline truncate">
                        {user.correo_institucional}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/perfil"
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-4 py-2 text-body-md text-on-surface hover:bg-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        Perfil
                      </Link>
                      <Link
                        to="/guardados"
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-4 py-2 text-body-md text-on-surface hover:bg-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">bookmark</span>
                        Guardados
                      </Link>
                      <Link
                        to="/karma"
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-4 py-2 text-body-md text-on-surface hover:bg-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">star</span>
                        Karma
                      </Link>
                    </div>
                    <div className="border-t border-border-subtle py-1">
                      <button
                        onClick={() => {
                          closeMenus()
                          logout()
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-body-md text-error hover:bg-error-container/30 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-label-md font-medium text-on-primary transition-colors hover:bg-secondary/90"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Ingresar con Correo ESPOL
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex xl:hidden items-center justify-center h-8 w-8 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-border-subtle bg-surface-card">
            <nav className="flex flex-col px-4 py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenus}
                  className={cn(
                    'rounded-lg px-3 py-2.5 text-label-md font-medium transition-colors',
                    location.pathname === link.to
                      ? 'bg-secondary/10 text-secondary'
                      : 'text-on-surface-variant hover:bg-surface'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <div className="my-2 border-t border-border-subtle" />
                  <Link
                    to="/perfil"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-md font-medium text-on-surface-variant transition-colors hover:bg-surface"
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Perfil
                  </Link>
                  <Link
                    to="/guardados"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-md font-medium text-on-surface-variant transition-colors hover:bg-surface"
                  >
                    <span className="material-symbols-outlined text-[18px]">bookmark</span>
                    Guardados
                  </Link>
                  <Link
                    to="/karma"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-md font-medium text-on-surface-variant transition-colors hover:bg-surface"
                  >
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    Karma
                  </Link>
                </>
              )}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-label-md font-medium text-on-primary transition-colors hover:bg-secondary/90"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Ingresar con Correo ESPOL
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <SearchModal key={searchKey} isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
