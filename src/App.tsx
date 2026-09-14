import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/ui/ProtectedRoute'
import HomePage from '@/pages/HomePage'
import MateriasPage from '@/pages/MateriasPage'
import MateriaPage from '@/pages/MateriaPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ProfilePage from '@/pages/ProfilePage'
import GuardadosPage from '@/pages/GuardadosPage'
import KarmaPage from '@/pages/KarmaPage'
import SubirRecursoPage from '@/pages/SubirRecursoPage'
import TerminosPage from '@/pages/TerminosPage'
import PrivacidadPage from '@/pages/PrivacidadPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/materias" element={<MateriasPage />} />
            <Route path="/materia/:id" element={<MateriaPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/terminos" element={<TerminosPage />} />
            <Route path="/privacidad" element={<PrivacidadPage />} />

            {/* Protected routes */}
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guardados"
              element={
                <ProtectedRoute>
                  <GuardadosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/karma"
              element={
                <ProtectedRoute>
                  <KarmaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subir"
              element={
                <ProtectedRoute>
                  <SubirRecursoPage />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
