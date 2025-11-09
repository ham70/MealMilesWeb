import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export default function FoodItemCard({ id }: { id: number }) {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState(0.0)
  const [photo_url, setPhoto] = useState('')

  useEffect(() => {
    if (session && id) getFoodItemData()
  }, [session, id])

  async function getFoodItemData() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('food_items')
        .select('name, description, cost, photo_path')
        .eq('id', id)
        .single()

      if (error && status !== 406) throw error

      if (data) {
        setName(data.name)
        setDescription(data.description)
        setCost(data.cost)
        setPhoto(data.photo_path)
      }
    } catch (error) {
      if (error instanceof Error) {
        window.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.cardWrapper}>
      {loading ? (
        <p style={styles.loadingText}>Loading ...</p>
      ) : (
        <div style={styles.card}>
          {photo_url && <img src={photo_url} style={styles.image} alt={name} />}
          <div style={styles.info}>
            <h3 style={styles.name}>{name}</h3>
            <p style={styles.description}>{description}</p>
            <p style={styles.cost}>${cost.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  cardWrapper: {
    margin: '10px 0',
    padding: '0 16px',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    margin: '20px 0',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 4,
    color: '#1a1a1a',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  cost: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111',
  },
}
