import { useCart } from '../contexts/CartContext'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Cart(){
  const context = useCart()
  const [subtotal, setSubtotal] = useState(0.00)

  useEffect(() => {
    console.log(context)
    context.cart.map((item) => {
      setSubtotal(subtotal + (item.quantity * item.price))
    })

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
    </div>
  )
}