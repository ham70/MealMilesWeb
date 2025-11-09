// src/pages/RestaurantItemPage.tsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useCart } from '../contexts/CartContext'
import BottomNav from '../components/BottomNav'
import { Link } from 'react-router-dom'
import './RestaurantItem.css'

interface FoodItem {
  id: number
  name: string
  description: string
  cost: number
  photo_path?: string
}

export default function RestaurantItem() {
  const { restaurantId, itemId } = useParams<{ restaurantId: string; itemId: string }>()
  const { addToCart } = useCart()
  const [item, setItem] = useState<FoodItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (itemId) fetchItem()
  }, [itemId])

  async function fetchItem() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('food_items')
        .select('id, name, description, cost, photo_path')
        .eq('id', itemId)
        .single()
      if (error) throw error
      setItem(data)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleAddToCart() {
    if (item) {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.cost,
        quantity,
        photo_url: item.photo_path,

      }, Number(restaurantId))
    }
  }

  if (loading || !item) return <p className="loading-item">Loading item...</p>

  return (
    <div className="restaurant-item-page">
      <Link to="/cart" className="cart-button-top">🛒 Cart</Link>
      <Link to={`/restaurant/${restaurantId}`}>← Back</Link>
      <div className="restaurant-item-card">
        {item.photo_path && (
          <img src={item.photo_path} alt={item.name} />
        )}
        <div className="restaurant-item-content">
          <h2>{item.name}</h2>
          <p className="description">{item.description}</p>
          <p className="price">${item.cost.toFixed(2)}</p>

          {/* Quantity Selector */}
          <div className="quantity-selector">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="add-to-cart-button"
          >
            Add {quantity} to Cart
          </button>
        </div>
      </div>
      <BottomNav/>
    </div>
  )
}
