import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export function Layout() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16 min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
