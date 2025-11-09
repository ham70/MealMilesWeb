import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import './BottomNav.css'

export default function BottomNav(){
  const context = useCart()
  return (
    <div className="bottom-nav">
      <Link to='/home' onClick={() => {context.clearCart()}}>Home</Link>
      <Link to='/account'>Account</Link>
    </div>
  )
}