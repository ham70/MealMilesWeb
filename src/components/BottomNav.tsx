import { Link } from 'react-router-dom'

export default function BottomNav(){
  return (
    <div>
      <Link to='/home'>Home</Link>
      <Link to='/account'>Account</Link>
    </div>
  )
}