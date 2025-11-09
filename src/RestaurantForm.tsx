import { useState } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from './contexts/AuthContext'

type Props = {onCreated?:() => void}

export default function NewRestaurantForm({ onCreated }: Props) {
  const { session } = useAuth()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!session?.user) return alert('Please sign in.')

    try {
      setLoading(true)

      const payload = {
        name: name.trim() || null,
        address: address.trim() || null,
        photo_url: photoUrl.trim() || null,
        admin_id: session.user.id, // derive from session
      }

      const { error } = await supabase.from('restaurant').insert(payload)
      if (error) throw error

      // reset fields (optional)
      setName('')
      setAddress('')
      setPhotoUrl('')

      onCreated?.()

      alert('Restaurant created!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create restaurant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      <label>
        Name
        <input value={name} onChange={e => setName(e.target.value)} required />
      </label>
      <label>
        Address
        <input value={address} onChange={e => setAddress(e.target.value)} />
      </label>
      <label>
        Photo URL
        <input type="url" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Create'}
      </button>
    </form>
  )
}
