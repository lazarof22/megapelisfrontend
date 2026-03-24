"use client"

import axios from "axios"
import { createContext, useContext, useEffect, useState } from "react"

type Item = {
  id: string
  tipo: "peliculas" | "series" | "juegos"
  nombre: string
  temporada?: number[]
  pesoGB?: number
}

type CartContextType = {
  items: Item[]
  addItem: (item: Item) => void
  removeItem: (id: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: any) {

  

  const [items, setItems] = useState<Item[]>([])

  const addItem = (item: Item) => {

    setItems(prev => {

      const existe = prev.find(i => i.id === item.id)

      if (existe) return prev // ❌ evita duplicados

      return [...prev, item]
    })
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const clear = () => {
    setItems([])
  }

  

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("CartContext error")
  return ctx
}