import { Link } from 'react-router-dom'
import { CartProvider, useCart } from '../contexts/CartContext'

export default function BottomNav(){
  const context = useCart()
  return (
    <div>
      <Link to='/home' onClick={() => {context.clearCart()}}>Home</Link>
      <Link to='/account'>Account</Link>
    </div>
  )
}