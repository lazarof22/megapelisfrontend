"use client"

import Card from "@mui/material/Card"
import CardMedia from "@mui/material/CardMedia"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import { useCart } from "@/context/CartContext"
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

export default function MediaCard({ item }: any) {

  const { addItem } = useCart()

  if (!item) return null

  const agregar = () => {
    addItem(item)
  }

  return (

    <Card
      sx={{
        minWidth: 200,
        maxWidth: 210,
        borderRadius: 2,
        background: "#000",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        transition: "transform .3s ease",
        "&:hover": {
          transform: "scale(1.05)"
        },
        "&:hover .overlay": {
          opacity: 1
        }
      }}
    >

      <CardMedia
        component="img"
        image={item.poster || "/placeholder.jpg"}
        sx={{ height: 300 }}
      />

      <Box
        className="overlay"
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,.9), rgba(0,0,0,.4))",
          opacity: 0,
          transition: "opacity .3s ease",
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