import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Auth from './pages/Auth'
import Account from './pages/Account'
import Home from './pages/Home'
import RestaurantPage from './pages/RestaurantPage'

export default function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route
          path="/auth"
          element={!session ? <Auth /> : <Navigate to="/home" replace />}
        />

        {/* Protected routes using ternary */}
        <Route
          path="/account"
          element={session ? <Account /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/home"
          element={session ? <Home/> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/restaurant/:id"
          element={session ? <RestaurantPage/> : <Navigate to="/auth" replace />}
        />

        {/* Catch-all redirect */}
        <Route
          path="*"
          element={<Navigate to={session ? '/home' : '/auth'} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
