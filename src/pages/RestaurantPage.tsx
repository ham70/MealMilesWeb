import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Menu from '../components/Menu'
import './RestaurantPage.css'

type RestaurantType = {
  id: number
  address: string
  name: string
  photo_url: string
}

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState<RestaurantType | null>(null)

  useEffect(() => {
    if (id && session?.user) {
      retrieveData()
    }
  }, [id, session])

  async function retrieveData() {
    try {
      setLoading(true)
      const { data, error, status } = await supabase
        .from('restaurant')
        .select('id, name, address, photo_url')
        .eq('id', id)
        .single()

      if (error && status !== 406) throw error
      if (data) {
        setRestaurant({
          id: data.id,
          name: data.name,
          address: data.address,
          photo_url: data.photo_url,
        })
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading restaurant...
      </div>
    )
  }

  return (
    <div className="restaurant-page">
      {/* Hero Header */}
      <div className="restaurant-hero">
        <img
          src={restaurant.photo_url || '/placeholder.jpg'}
          alt={restaurant.name}
        />
        <div className="overlay">
          <h1>{restaurant.name}</h1>
          <p>{restaurant.address}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="restaurant-content">
        <h2>Menu</h2>
        <div className="menu-grid">
          <Menu id={restaurant.id} />
        </div>
      </div>
    </div>
  )
}
