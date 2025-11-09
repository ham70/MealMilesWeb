import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import RestaurantList from '../components/RestaurantList'

export default function Home() {
  const { session, signOut } = useAuth()

  useEffect(() => {
    console.log(session)
  }, [session])

  if (!session) return <div>Please log in to view your account.</div>

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Hot Restaurants</h2>
      <RestaurantList/>
    </div>
  )
}
