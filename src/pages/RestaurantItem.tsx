// src/pages/RestaurantItemPage.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useCart } from '../contexts/CartContext'

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
  const navigate = useNavigate()

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
      })
    }
  }

  if (loading || !item) return <p className="text-center mt-8">Loading item...</p>

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-md overflow-hidden">
      {item.photo_path && (
        <img src={item.photo_path} alt={item.name} className="w-full h-64 object-cover" />
      )}
      <div className="p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold">{item.name}</h2>
        <p className="text-gray-700">{item.description}</p>
        <p className="text-lg font-semibold">${item.cost.toFixed(2)}</p>

        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1 bg-gray-200 rounded-lg font-bold text-lg"
          >
            -
          </button>
          <span className="text-lg">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-1 bg-gray-200 rounded-lg font-bold text-lg"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          className="mt-4 w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-xl shadow hover:from-indigo-700 hover:to-indigo-600 transition"
        >
          Add {quantity} to Cart
        </button>
      </div>
    </div>
  )
}
