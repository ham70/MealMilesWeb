import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

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
    <div className="p-6 bg-[#fefefe] min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-[#222]">Local Favorites</h2>

      {loading ? (
        <p className="text-center text-gray-500 mt-6">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Link
              to={`/restaurant/${restaurant.id}`}
              key={restaurant.id}
              className="block bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer"
            >
              {restaurant.photo_url ? (
                <img
                  src={restaurant.photo_url}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {restaurant.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
