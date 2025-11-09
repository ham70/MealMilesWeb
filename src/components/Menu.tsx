import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import FoodItemCard from './FoodItemCard'
import { useAuth } from '../contexts/AuthContext'

export default function Menu({id} : {id: number}){
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [items, setItems] = useState<number[]>([])

  useEffect(() => {
    if (id) retrieveData()
    }, [id])

  async function retrieveData(){
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('food_items')
        .select(`id`)
        .eq('restaurant_id', id)
      if (error && status !== 406) {
        throw error
      }
      if (data) {
        const ids = data.map((item) => item.id as number)
        setItems(ids)
      }

    } catch (error) {
      if (error instanceof Error) {
        console.log(error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Menu</h1>
      {items.map((id) =>(
          <div key = {id}>
            <FoodItemCard id ={id}/>
          </div>
        ))}
    </div>
  )

}