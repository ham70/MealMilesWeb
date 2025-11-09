import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from './contexts/AuthContext'

export default function Account() {
  const { session, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isRestaurant, setIsRestaurant] = useState(false)

  useEffect(() => {
    if (session?.user) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, is_restaurant')
        .eq('id', session.user.id)
        .single()

      if (error) throw error

      if (data) {
        setFirstName(data.first_name || '')
        setLastName(data.last_name || '')
        setIsRestaurant(
          data.is_restaurant === true ||
          data.is_restaurant === 'true' ||
          data.is_restaurant === 1
        )
      }
    } catch (error) {
      if (error instanceof Error) alert(error.message)
      else alert('Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile() {
    try {
      setLoading(true)
      const updates = {
        id: session.user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        is_restaurant: isRestaurant,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error

      alert('Profile updated!')
    } catch (error) {
      if (error instanceof Error) alert(error.message)
      else alert('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!session) return <div>Please log in to view your account.</div>

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Account</h2>

      <div style={{ marginBottom: 16 }}>
        <label>Email</label>
        <input
          type="email"
          value={session.user.email || ''}
          disabled
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>First Name</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter first name"
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Last Name</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Enter last name"
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <label>Restaurant Account</label>
        <input
          type="checkbox"
          checked={isRestaurant}
          onChange={(e) => setIsRestaurant(e.target.checked)}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={updateProfile} disabled={loading} style={{ padding: 10, flex: 1 }}>
          {loading ? 'Saving...' : 'Update Profile'}
        </button>

        <button onClick={signOut} style={{ padding: 10, flex: 1 }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
