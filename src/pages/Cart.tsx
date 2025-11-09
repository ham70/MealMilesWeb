import { useCart } from '../contexts/CartContext'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import BottomNav from '../components/BottomNav'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Cart.css'

export default function Cart() {
  const { cart, restaurantId, clearCart } = useCart()
  const { session } = useAuth()

  const [restaurantPoints, setRestaurantPoints] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [restaurantName, setRestaurantName] = useState('')

  // Compute subtotal whenever cart changes
  useEffect(() => {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    setSubtotal(total)
  }, [cart])

  // Calculate points discount (1000 points = $1)
  const pointsDiscount = Math.floor(restaurantPoints / 1000)
  const totalAfterDiscount = Math.max(0, subtotal - pointsDiscount)

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

  async function handleCheckout() {
    if (!session?.user?.id || !restaurantId || cart.length === 0) {
      alert('Cannot checkout: missing information or empty cart')
      return
    }

    try {
      setCheckoutLoading(true)

      const restId =
        typeof restaurantId === 'string' ? Number(restaurantId) : restaurantId
      if (restId == null || Number.isNaN(restId as number)) {
        alert('Invalid restaurant ID')
        return
      }

      const userId = session.user.id
      const pointsEarned = Math.floor(totalAfterDiscount * 100)
      const pointsUsed = pointsDiscount * 1000 // Points used for discount

      if (pointsEarned <= 0) {
        alert('Cannot checkout: total must be greater than $0')
        return
      }

      // Check if a row exists for this user and restaurant
      const { data: existingData, error: fetchError } = await supabase
        .from('user_points')
        .select('id, point')
        .eq('restaurant_id', restId)
        .eq('user_id', userId)
        .maybeSingle()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is fine
        throw fetchError
      }

      const currentPoints = existingData?.point ?? 0
      // Deduct points used for discount, then add points earned
      const newPointsTotal = currentPoints - pointsUsed + pointsEarned

      if (existingData) {
        // Update existing row
        const { error: updateError } = await supabase
          .from('user_points')
          .update({ point: newPointsTotal })
          .eq('id', existingData.id)

        if (updateError) throw updateError
      } else {
        // Insert new row
        const { error: insertError } = await supabase
          .from('user_points')
          .insert({
            user_id: userId,
            restaurant_id: restId,
            point: newPointsTotal,
          })

        if (insertError) throw insertError
      }

      // Clear cart and refresh points
      clearCart()
      await retrieveRestaurantPoints()

      const pointsMessage = pointsUsed > 0 
        ? `Checkout successful! You used ${pointsUsed.toLocaleString()} points and earned ${pointsEarned.toLocaleString()} points!`
        : `Checkout successful! You earned ${pointsEarned.toLocaleString()} points!`
      alert(pointsMessage)
    } catch (err) {
      console.error('Checkout error:', err)
      alert(err instanceof Error ? err.message : 'Failed to checkout')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="cart-page">
      {cart.length > 0 && restaurantId && (
        <Link to={`/restaurant/${restaurantId}`}>← Back</Link>
      )}
      <h2>{restaurantName || 'Your Cart'}</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <span className="cart-item-name">
                  {item.name} × {item.quantity}
                </span>
                <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-row">
              <span className="cart-summary-label">Subtotal</span>
              <span className="cart-summary-value">${subtotal.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span className="cart-summary-label">Points Available</span>
              <span className="cart-summary-value">{restaurantPoints.toLocaleString()}</span>
            </div>
            {pointsDiscount > 0 && (
              <div className="cart-summary-row points-discount">
                <span className="cart-summary-label">
                  Points Discount ({pointsDiscount * 1000} pts = ${pointsDiscount.toFixed(2)})
                </span>
                <span className="cart-summary-value discount">-${pointsDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="cart-summary-row total-row">
              <span className="cart-summary-label">Total</span>
              <span className="cart-summary-value total">${totalAfterDiscount.toFixed(2)}</span>
            </div>
            {restaurantPoints >= 1000 && (
              <div className="points-info">
                <small>💡 1000 points = $1.00 discount</small>
              </div>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading || cart.length === 0 || totalAfterDiscount <= 0}
            className="checkout-button"
          >
            {checkoutLoading ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      )}

      {loading && <div className="cart-loading">Loading…</div>}

      <BottomNav />
    </div>
  )
}
