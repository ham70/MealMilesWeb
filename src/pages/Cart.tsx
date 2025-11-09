import { useCart } from '../contexts/CartContext'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import BottomNav from '../components/BottomNav'

export default function Cart(){
  const context = useCart()
  const [subtotal, setSubtotal] = useState(0.00)

  useEffect(() => {
    const total = context.cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )
  setSubtotal(total)
  }, [context.cart])

  return (
    <div>
      <div>
        <p>Items</p>
        {context.cart.map((item) => (
          <p>Item: {item.name}, Price: {item.price}, Quantity: {item.quantity}</p>
        ))}
      </div>
      <p>Subtotal {subtotal}</p>
      <div>
        <BottomNav/>
      </div>
    </div>
  )
}