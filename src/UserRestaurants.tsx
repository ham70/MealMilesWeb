import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from './contexts/AuthContext'
import RestaurantForm from './RestaurantForm'

interface RestaurantData {
  id: string            // uuid in Supabase
  admin_id: string
  name: string | null
  address: string | null
  photo_url: string | null
}

export default function UserRestaurants() {
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [restaurantList, setRestaurantList] = useState<RestaurantData[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      void retrieveRestaurants()
    }
  }, [session?.user?.id])

  async function retrieveRestaurants() {
    try {
      setLoading(true)
      setErrorMsg(null)

      const { data, error } = await supabase
        .from('restaurant') // table name
        .select('id, admin_id, address, name, photo_url')
        .eq('admin_id', session!.user.id)
        .order('created_at', { ascending: false }) // remove if you don't have created_at

      if (error) throw error
      setRestaurantList(data ?? [])
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error loading restaurant')
      setRestaurantList([])
    } finally {
      setLoading(false)
    }
  }


  if (!session) return <div>Please log in to view your restaurants.</div>
  if (loading) return <div>Loading your restaurants…</div>
  if (errorMsg) return <div>Error: {errorMsg}</div>


  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2>Your restaurants ({restaurantList.length})</h2>

      {restaurantList.length === 0 ? (
        <p>No restaurants found for your account.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {restaurantList.map((r) => (
            <article
              key={r.id}
              style={{
                border: '1px solid #eee',
                borderRadius: 12,
                padding: 12,
                display: 'grid',
                gap: 8,
              }}
            >
              {r.photo_url ? (
                <img
                  src={r.photo_url}
                  alt={r.name ?? 'Restaurant photo'}
                  style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 140,
                    borderRadius: 8,
                    background: '#f4f4f5',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                    color: '#666',
                  }}
                >
                  No photo
                </div>
              )}

              <h3 style={{ margin: 0 }}>{r.name ?? '(Unnamed restaurant)'}</h3>
              <p style={{ margin: 0, color: '#555' }}>{r.address ?? 'No address set'}</p>
              <small style={{ color: '#888' }}>Admin: {r.admin_id}</small>
            </article>
          ))}
        </div>
      )}
      <h2>Nice Form</h2>
      <RestaurantForm onCreated ={retrieveRestaurants}/>
    </div>
  )
}
