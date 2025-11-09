import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  photo_url?: string
}

interface CartContextType {
  cart: CartItem[]
  restaurantId: number | null
  addToCart: (item: CartItem, itemRestaurantId: number) => void
  removeFromCart: (id: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [restaurantId, setRestaurantId] = useState<number | null>(null)

  function addToCart(item: CartItem, itemRestaurantId: number) {
    setCart((prev) => {
      if (prev.length === 0) {
        setRestaurantId(itemRestaurantId)
      } else if (restaurantId !== itemRestaurantId) {
        if (
          !window.confirm(
            'You already have items from another restaurant. Clear cart and add this item?'
          )
        ) {
          return prev
        }
        setRestaurantId(itemRestaurantId)
        return [item] // start new cart
      }

      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      } else {
        return [...prev, item]
      }
    })
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((i) => i.id !== id))
    if (cart.length === 1) setRestaurantId(null) // clear restaurantId if cart becomes empty
  }

  function clearCart() {
    setCart([])
    setRestaurantId(null)
  }

  return (
    <CartContext.Provider
      value={{ cart, restaurantId, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}
