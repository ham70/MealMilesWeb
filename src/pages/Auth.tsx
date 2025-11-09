import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import './Auth.css'

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

    if (error) alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    <div className="auth-card">
      <h2>Sign In / Sign Up</h2>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@address.com"
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
      </div>

      <div className="button-row">
        <button onClick={signInWithEmail} disabled={loading} className="primary">
          {loading ? 'Loading...' : 'Sign in'}
        </button>
        <button onClick={signUpWithEmail} disabled={loading} className="secondary">
          {loading ? 'Loading...' : 'Sign up'}
        </button>
      </div>

      {session && (
        <div className="session-info">
          <strong>Logged in as:</strong> {session.user?.email}
        </div>
      )}
    </div>
  )
}
