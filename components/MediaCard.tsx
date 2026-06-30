"use client"

import Card from "@mui/material/Card"
import CardMedia from "@mui/material/CardMedia"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import { useCart } from "@/context/CartContext"
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

// ← TIPO actualizado con compact
type MediaCardProps = {
  item: any
  tipo: string
  compact?: boolean
}

export default function MediaCard({ item, tipo }: any) {

  const { addItem } = useCart()

  if (!item) return null

  const agregar = () => {

    const itemFormateado = {
      id: item._id, // 🔥 importante (sin Date.now)
      nombre: item.nombre,
      tipo: tipo, // 🔥 ahora sí llega bien
      pesoGB: item.pesoGB,
      temporada: item.temporada || null,
      precio: 0
    }

    addItem(itemFormateado)
  }

  return (

    <Card
      sx={{
        minWidth: 140,
        maxWidth: 210,
        borderRadius: 2,
        background: "#000",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardMedia
        component="img"
        image={item.poster || "/placeholder.jpg"}
        sx={{ height: 300 }}
      />

      {/* ← Overlay siempre visible, sin opacity ni transition */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,.95) 0%, rgba(0,0,0,.3) 50%, transparent 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          p: 2
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {item.nombre}
        </Typography>

        <Typography variant="body2" sx={{ mt: .5 }}>
          ⭐ IMDb: {item.imdbRating ?? "N/A"}
        </Typography>

        <Typography variant="body2">
          📅 Año: {item.year}
        </Typography>

        <Typography variant="body2">
          🧱 Peso: {item.pesoGB} GB
        </Typography>

        {item.temporada && (
          <Typography variant="body2">
            📺 Temporadas: {item.temporada}
          </Typography>
        )}

        <Button
          fullWidth
          startIcon={<AddShoppingCartIcon />}
          variant="contained"
          sx={{ mt: 1 }}
          onClick={agregar}
        >
          Pedir
        </Button>
      </Box>
    </Card>
  )
}