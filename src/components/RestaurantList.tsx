import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import './RestaurantList.css'

interface RestaurantData {
  id: number
  name: string
  photo_url?: string
}

export default function RestaurantList() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [restaurants, setRestaurants] = useState<RestaurantData[]>([])

  useEffect(() => {
    if (session?.user) {
      retrieveRestaurants()
    }
  }, [session])

  async function retrieveRestaurants() {
    try {
      setLoading(true)
      const { data, error, status } = await supabase
        .from('restaurant')
        .select('id, name, photo_url')

      if (error && status !== 406) throw error
      if (data) setRestaurants(data)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="restaurant-page">
      <h2>Local Favorites</h2>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <Link
              to={`/restaurant/${restaurant.id}`}
              key={restaurant.id}
              className="restaurant-card"
            >
              {restaurant.photo_url ? (
                <img
                  src={restaurant.photo_url}
                  alt={restaurant.name}
                />
              ) : (
                <div className="no-image">No Image</div>
              )}
              <div className="card-content">
                <h3>{restaurant.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
