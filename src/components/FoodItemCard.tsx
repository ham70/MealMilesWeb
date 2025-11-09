import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import './FoodItemCard.css'

export default function FoodItemCard({ id }: { id: number }) {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [restaurantId, setRestaurantId] = useState()
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState(0.0)
  const [photo_url, setPhoto] = useState('')

  useEffect(() => {
    if (session && id) getFoodItemData()
  }, [session, id])

  async function getFoodItemData() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('food_items')
        .select('name, description, cost, photo_path, restaurant_id')
        .eq('id', id)
        .single()

      if (error && status !== 406) throw error

      if (data) {
        setName(data.name)
        setDescription(data.description)
        setCost(data.cost)
        setRestaurantId(data.restaurant_id)
        setPhoto(data.photo_path)
      }
    } catch (error) {
      if (error instanceof Error) window.alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p className="food-item-loading">Loading ...</p>

  return (
    <div className="food-item-card-wrapper">
      <div className="food-item-card">
        {photo_url && <img src={photo_url} alt={name} />}
        <div className="food-item-info">
          <h3>{name}</h3>
          <p className="description">{description}</p>
          <p className="cost">${cost.toFixed(2)}</p>
          <Link 
          to={`/restaurant/${restaurantId}/item/${id}`}
          key = {id}
          >Add to Cart</Link>
        </div>
      </div>
    </div>
  )
}
