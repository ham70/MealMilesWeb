import { useCart } from '../contexts/CartContext'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import BottomNav from '../components/BottomNav'
import { Link } from 'react-router-dom'

export default function Cart() {
  const { cart, restaurantId } = useCart()
  const [subtotal, setSubtotal] = useState(0.0)
  const [loading, setLoading] = useState(true)
  const [restaurantName, setRestaurantName] = useState('')

  // Fetch restaurant name whenever restaurantId changes
  useEffect(() => {
    if (restaurantId) {
      retrieveRestaurantName()
    } else {
      setRestaurantName('')
    }
  }, [restaurantId])

  // Compute subtotal whenever cart changes
  useEffect(() => {
    const total = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0 // initial value
    )
    setSubtotal(total)
  }, [cart])

  async function retrieveRestaurantName() {
    try {
      setLoading(true)
      const { data, error, status } = await supabase
        .from('restaurant')
        .select('name')
        .eq('id', restaurantId)
        .single()

      if (error && status !== 406) throw error
      if (data) setRestaurantName(data.name)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cart-page" style={{ maxWidth: 600, margin: '80px auto 100px', padding: 16 }}>
      <Link to={`/restaurant/${restaurantId}`}>Back</Link>
      <h2>{restaurantName || 'Your Cart'}</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #eee',
              }}
            >
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div
            style={{
              marginTop: 16,
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
