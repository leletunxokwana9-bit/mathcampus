import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './context/authStore'

// Layouts
import AppLayout from './components/common/AppLayout'
import PublicLayout from './components/common/PublicLayout'

// Pages
import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import DashboardPage  from './pages/DashboardPage'
import CampusesPage   from './pages/CampusesPage'
import CampusPage     from './pages/CampusPage'
import LessonPage     from './pages/LessonPage'
import ProgressPage   from './pages/ProgressPage'
import ProfilePage    from './pages/ProfilePage'
import NotFoundPage   from './pages/NotFoundPage'

// Auth guard
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}
const GuestRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      </Route>

      {/* Protected App */}
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="/dashboard"             element={<DashboardPage />} />
        <Route path="/campuses"              element={<CampusesPage />} />
        <Route path="/campuses/:campusId"    element={<CampusPage />} />
        <Route path="/campuses/:campusId/lessons/:lessonId" element={<LessonPage />} />
        <Route path="/progress"             element={<ProgressPage />} />
        <Route path="/profile"              element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
