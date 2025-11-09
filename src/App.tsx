import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Auth from './Auth'
import Account from './Account'
import Restaurants from './UserRestaurants'

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

        {/*Upload a Restauraunt Page*/}
        <Route 
          path = "/restauraunts"
          element={session ? <Restaurants /> : <Navigate to="/auth" replace />}
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
