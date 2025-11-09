import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import './RestaurantForm.css'

type Props = {
  restaurantId: number
  onCreated?: () => void
}

export default function FoodItemForm({ restaurantId, onCreated }: Props) {
  const { session } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [photoPath, setPhotoPath] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!session?.user) return alert('Please sign in.')

    try {
      setLoading(true)

      const costNum = parseFloat(cost)
      if (isNaN(costNum) || costNum < 0) {
        alert('Please enter a valid cost')
        return
      }

      const payload = {
        name: name.trim() || null,
        description: description.trim() || null,
        cost: costNum,
        photo_path: photoPath.trim() || null,
        restaurant_id: restaurantId,
      }

      const { error } = await supabase.from('food_items').insert(payload)
      if (error) throw error

      // reset fields
      setName('')
      setDescription('')
      setCost('')
      setPhotoPath('')

      onCreated?.()

      alert('Food item created!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create food item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="restaurant-form">
      <label>
        Name
        <input value={name} onChange={e => setName(e.target.value)} required />
      </label>
      <label>
        Description
        <textarea 
          value={description} 
          onChange={e => setDescription(e.target.value)}
          rows={4}
          style={{
            padding: '14px 16px',
            border: '2px solid var(--food-gray)',
            borderRadius: '12px',
            outline: 'none',
            fontSize: '15px',
            background: 'var(--food-white)',
            color: 'var(--food-text)',
            transition: 'all var(--transition-fast)',
            fontFamily: 'inherit',
            resize: 'vertical',
            width: '100%',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--food-orange)'
            e.target.style.boxShadow = '0 0 0 4px rgba(255, 107, 53, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--food-gray)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </label>
      <label>
        Cost ($)
        <input 
          type="number" 
          step="0.01" 
          min="0"
          value={cost} 
          onChange={e => setCost(e.target.value)} 
          required 
        />
      </label>
      <label>
        Photo URL
        <input type="url" value={photoPath} onChange={e => setPhotoPath(e.target.value)} />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Add Food Item'}
      </button>
    </form>
  )
}

