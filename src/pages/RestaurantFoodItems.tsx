import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import FoodItemForm from '../components/FoodItemForm'
import BottomNav from '../components/BottomNav'
import './RestaurantFoodItems.css'

interface FoodItem {
  id: number
  name: string
  description: string
  cost: number
  photo_path?: string
  created_at: string
}

interface RestaurantData {
  id: number
  name: string | null
  address: string | null
}

export default function RestaurantFoodItems() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (id && session?.user?.id) {
      void fetchRestaurant()
      void fetchFoodItems()
    }
  }, [id, session?.user?.id])

  async function fetchRestaurant() {
    try {
      const restId = typeof id === 'string' ? Number(id) : id
      if (restId == null || Number.isNaN(restId)) {
        setErrorMsg('Invalid restaurant ID')
        return
      }

      const { data, error } = await supabase
        .from('restaurant')
        .select('id, name, address, admin_id')
        .eq('id', restId)
        .single()

      if (error) throw error

      // Verify user is the admin
      if (data.admin_id !== session!.user.id) {
        setErrorMsg('You do not have permission to manage this restaurant')
        return
      }

      setRestaurant(data)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load restaurant')
    }
  }

  async function fetchFoodItems() {
    try {
      setLoading(true)
      const restId = typeof id === 'string' ? Number(id) : id
      if (restId == null || Number.isNaN(restId)) {
        return
      }

      const { data, error } = await supabase
        .from('food_items')
        .select('id, name, description, cost, photo_path, created_at')
        .eq('restaurant_id', restId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFoodItems(data ?? [])
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load food items')
    } finally {
      setLoading(false)
    }
  }

  if (!session) return <div className="loading-food-items">Please log in.</div>
  if (errorMsg) return <div className="error-food-items">Error: {errorMsg}</div>
  if (loading || !restaurant) return <div className="loading-food-items">Loading…</div>

  const restaurantId = typeof id === 'string' ? Number(id) : id
  if (restaurantId == null || Number.isNaN(restaurantId)) {
    return <div className="error-food-items">Invalid restaurant ID</div>
  }

  return (
    <div className="restaurant-food-items-page">
      <Link to="/restaurants" className="back-link">← Back to Restaurants</Link>
      <h2>{restaurant.name || 'Restaurant'} - Food Items</h2>
      <p className="restaurant-address">{restaurant.address || 'No address'}</p>

      <div className="food-items-section">
        <h3>Existing Food Items ({foodItems.length})</h3>
        {foodItems.length === 0 ? (
          <p className="no-items">No food items yet. Add your first item below!</p>
        ) : (
          <div className="food-items-grid">
            {foodItems.map((item) => (
              <div key={item.id} className="food-item-card">
                {item.photo_path ? (
                  <img src={item.photo_path} alt={item.name} />
                ) : (
                  <div className="no-photo">No photo</div>
                )}
                <div className="food-item-info">
                  <h4>{item.name}</h4>
                  <p className="description">{item.description}</p>
                  <p className="cost">${item.cost.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="add-item-section">
        <h3>Add New Food Item</h3>
        <FoodItemForm restaurantId={restaurantId} onCreated={fetchFoodItems} />
      </div>

      <BottomNav />
    </div>
  )
}

