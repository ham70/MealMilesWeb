import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(supabase.auth.getSession())

  // Keep session updated automatically
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    }
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Please check your inbox for email verification!')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Auth</h2>
      <div style={{ marginBottom: 16 }}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@address.com"
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={signInWithEmail} disabled={loading} style={{ flex: 1, padding: 10 }}>
          {loading ? 'Loading...' : 'Sign in'}
        </button>
        <button onClick={signUpWithEmail} disabled={loading} style={{ flex: 1, padding: 10 }}>
          {loading ? 'Loading...' : 'Sign up'}
        </button>
      </div>

      {session && (
        <div style={{ marginTop: 20 }}>
          <strong>Logged in as:</strong> {session.user?.email}
        </div>
      )}
    </div>
  )
}
