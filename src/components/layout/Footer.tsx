import { Link } from 'react-router-dom'

const communityLinks = [
  { to: '/subir', label: 'Subir aporte' },
  { to: '/karma', label: 'Sistema de karma' },
]

const legalLinks = [
  { to: '/terminos', label: 'Términos y condiciones' },
  { to: '/privacidad', label: 'Política de privacidad' },
  { to: '/contacto', label: 'Contacto' },
]

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[24px] text-secondary">
                school
              </span>
              <span className="text-title font-bold text-on-surface">
                CourseHub <span className="font-normal text-on-surface-variant">ESPOL</span>
              </span>
            </Link>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              Plataforma colaborativa para compartir apuntes, exámenes y proyectos
              de la ESPOL. Ayuda a otros estudiantes a prepararse mejor.
            </p>
          </div>

          <div>
            <h3 className="text-label-md font-semibold text-on-surface mb-4">
              Comunidad
            </h3>
            <ul className="space-y-2">
              {communityLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-body-sm text-on-surface-variant hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-label-md font-semibold text-on-surface mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-body-sm text-on-surface-variant hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border-subtle pt-6 text-center">
          <p className="text-label-sm text-outline">
            © {new Date().getFullYear()} CourseHub ESPOL. Creado por estudiantes, para estudiantes.
          </p>
        </div>
      </div>
    </footer>
  )
}
