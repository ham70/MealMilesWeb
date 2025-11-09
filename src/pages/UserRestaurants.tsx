import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import RestaurantForm from '../components/RestaurantForm'
import BottomNav from '../components/BottomNav'
import { Link } from 'react-router-dom'
import './UserRestaurants.css'

interface RestaurantData {
  id: string            // uuid in Supabase
  admin_id: string
  name: string | null
  address: string | null
  photo_url: string | null
}

export default function UserRestaurants() {
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [restaurantList, setRestaurantList] = useState<RestaurantData[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      void retrieveRestaurants()
    }
  }, [session?.user?.id])

  async function retrieveRestaurants() {
    try {
      setLoading(true)
      setErrorMsg(null)

      const { data, error } = await supabase
        .from('restaurant') // table name
        .select('id, admin_id, address, name, photo_url')
        .eq('admin_id', session!.user.id)
        .order('created_at', { ascending: false }) // remove if you don't have created_at

      if (error) throw error
      setRestaurantList(data ?? [])
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error loading restaurant')
      setRestaurantList([])
    } finally {
      setLoading(false)
    }
  }


  if (!session) return <div className="loading-restaurants">Please log in to view your restaurants.</div>
  if (loading) return <div className="loading-restaurants">Loading your restaurants…</div>
  if (errorMsg) return <div className="error-restaurants">Error: {errorMsg}</div>


  return (
    <div className="user-restaurants-page">
      <h2>Your restaurants ({restaurantList.length})</h2>

      {restaurantList.length === 0 ? (
        <p>No restaurants found for your account.</p>
      ) : (
        <div className="restaurants-grid">
          {restaurantList.map((r) => (
            <article key={r.id} className="restaurant-card-item">
              {r.photo_url ? (
                <img
                  src={r.photo_url}
                  alt={r.name ?? 'Restaurant photo'}
                />
              ) : (
                <div className="no-photo">
                  No photo
                </div>
              )}

              <h3>{r.name ?? '(Unnamed restaurant)'}</h3>
              <p>{r.address ?? 'No address set'}</p>
              <Link to={`/restaurants/${r.id}/food-items`} className="manage-food-items-btn">
                Manage Food Items
              </Link>
            </article>
          ))}
        </div>
      )}
      <h2>Create New Restaurant</h2>
      <RestaurantForm onCreated={retrieveRestaurants}/>
      <BottomNav/>
    </div>
  )
}
