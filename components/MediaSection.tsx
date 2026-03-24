"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import MediaRow from "./MediaRow"

interface Props {
  titulo: string
  tipo: "peliculas" | "series" | "juegos"
}

export default function MediaSection({ titulo, tipo }: Props) {

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const fetchData = async () => {
      try {

        const res = await axios.get(`http://localhost:4000/${tipo}`)

        setItems(res.data)

      } catch (error) {
        console.error("Error cargando contenido:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

  }, [tipo])

  if (loading) return null

  return <MediaRow titulo={titulo} items={items} />
}