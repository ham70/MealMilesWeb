import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Menu from '../components/Menu'
type RestaurantType = {
  id: number,
  address: string,
  name: string,
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative h-[300px] w-full">
        <img
          src={restaurant.photo_url || '/placeholder.jpg'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {restaurant.name}
          </h1>
          <p className="text-lg text-gray-200">{restaurant.address}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Menu</h2>
        <Menu id={restaurant.id} />
      </div>
    </div>
  )
}
