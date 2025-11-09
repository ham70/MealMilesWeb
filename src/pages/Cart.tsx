import { useCart } from '../contexts/CartContext'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import BottomNav from '../components/BottomNav'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Cart() {
  const { cart, restaurantId } = useCart()
  const { session } = useAuth()

  const [restaurantPoints, setRestaurantPoints] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [restaurantName, setRestaurantName] = useState('')

  // Compute subtotal whenever cart changes
  useEffect(() => {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    setSubtotal(total)
  }, [cart])

  // Fetch restaurant name whenever restaurantId changes
  useEffect(() => {
    if (!restaurantId) {
      setRestaurantName('')
      return
    }
    void retrieveRestaurantName()
  }, [restaurantId])

  // Fetch points whenever restaurantId or user changes
  useEffect(() => {
    if (restaurantId && session?.user?.id) {
      void retrieveRestaurantPoints()
    } else {
      setRestaurantPoints(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, session?.user?.id])

  async function retrieveRestaurantPoints() {
    try {
      setLoading(true)

      // restaurant_id is int8 in DB → ensure we query with a number
      const restId =
        typeof restaurantId === 'string' ? Number(restaurantId) : restaurantId
      if (restId == null || Number.isNaN(restId as number)) {
        console.warn('Invalid restaurantId for points query:', restaurantId)
        setRestaurantPoints(0)
        return
      }

      const userId = session!.user.id

      const { data, error } = await supabase
        .from('user_points')
        .select('point')
        .eq('restaurant_id', restId as number)
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error

      setRestaurantPoints(data?.point ?? 0)
    } catch (err) {
      console.error('retrieveRestaurantPoints error:', err)
      setRestaurantPoints(0)
    } finally {
      setLoading(false)
    }
  }

  async function retrieveRestaurantName() {
    try {
      setLoading(true)

      // restaurant.id is int8 → query with a number as well
      const restId =
        typeof restaurantId === 'string' ? Number(restaurantId) : restaurantId
      if (restId == null || Number.isNaN(restId as number)) {
        console.warn('Invalid restaurantId for name query:', restaurantId)
        setRestaurantName('')
        return
      }

      const { data, error } = await supabase
        .from('restaurant')
        .select('name')
        .eq('id', restId as number)
        .maybeSingle()

      if (error) throw error
      setRestaurantName(data?.name ?? '')
    } catch (err) {
      console.error('retrieveRestaurantName error:', err)
      setRestaurantName('')
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
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div
            style={{
              marginTop: 16,
              fontWeight: 'bold',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              rowGap: 6,
            }}
          >
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>

            <span>Points</span>
            <span>{restaurantPoints}</span>
          </div>
        </div>
      )}

      {loading && <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Loading…</div>}

      <BottomNav />
    </div>
  )
}
