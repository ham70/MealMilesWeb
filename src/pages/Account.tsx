import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import './Account.css'

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
    <div className="account-page-wrapper">
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: 28 }}>Account Settings</h2>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={session.user.email || ''} disabled />
        </div>

        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
          />
        </div>

        <div className="form-row">
          <input
            type="checkbox"
            checked={isRestaurant}
            onChange={(e) => setIsRestaurant(e.target.checked)}
          />
          <label>Restaurant Account</label>
        </div>

        <div className="button-row">
          <button
            onClick={updateProfile}
            disabled={loading}
            className="primary"
          >
            {loading ? 'Saving...' : 'Update Profile'}
          </button>

          <button onClick={signOut} className="secondary">
            Sign Out
          </button>
        </div>
        <div>
          {isRestaurant &&
            <Link to="/restaurants">View Your Restaurants</Link>
          }
        </div>
      </div>
      <BottomNav/>
    </div>
  )
}
