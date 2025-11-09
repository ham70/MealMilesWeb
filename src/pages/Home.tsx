import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import RestaurantList from '../components/RestaurantList'
import BottomNav from '../components/BottomNav'

export default function Home() {
  const { session } = useAuth()

  useEffect(() => {
    console.log(session)
  }, [session])

  if (!session) return <div>Please log in to view your account.</div>

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '2rem', paddingBottom: '100px' }}>
      <RestaurantList/>
      <BottomNav/>
    </div>
  )
}
