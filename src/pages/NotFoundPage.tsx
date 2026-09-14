import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center bg-surface px-4 text-center">
      <p className="font-display text-[120px] font-bold leading-none text-surface-container-high sm:text-[160px]">
        404
      </p>
      <h1 className="mt-4 font-display text-headline-lg font-bold text-on-surface">
        Página no encontrada
      </h1>
      <p className="mt-2 max-w-md text-body-lg text-on-surface-variant">
        La página que buscas no existe o fue movida. Vuelve al inicio para
        continuar navegando.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-body-md font-semibold text-on-primary transition-colors hover:bg-secondary-container"
      >
        <span className="material-symbols-outlined text-[20px]">home</span>
        Volver al inicio
      </Link>
    </main>
  )
}
