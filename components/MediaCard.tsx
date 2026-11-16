"use client"

import Card from "@mui/material/Card"
import CardMedia from "@mui/material/CardMedia"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import { useCart } from "@/context/CartContext"
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Chip from "@mui/material/Chip"

// ← TIPO actualizado con compact
type MediaCardProps = {
  item: any
  tipo: string
  compact?: boolean
}

// 🎨 Colores de las calificaciones (misma escala que SeriesGraph)
type RatingTier = { min: number; label: string; bg: string; color: string }

const RATING_TIERS: RatingTier[] = [
  { min: 9.7, label: "Absolute Cinema", bg: "#2F9DF4", color: "#06223A" },
  { min: 9.0, label: "Awesome", bg: "#1F6B3B", color: "#FFFFFF" },
  { min: 8.0, label: "Great", bg: "#2DB55D", color: "#07210F" },
  { min: 7.0, label: "Good", bg: "#F6D03B", color: "#2B2300" },
  { min: 6.0, label: "Regular", bg: "#F59E0B", color: "#2B1700" },
  { min: 5.0, label: "Bad", bg: "#E5483A", color: "#FFFFFF" },
  { min: 0, label: "Garbage", bg: "#7A35A3", color: "#FFFFFF" }
]

function getRatingTier(rating: number): RatingTier {
  // Steam puede venir en porcentaje (0-100): se pasa a escala 0-10 solo para elegir el color
  const score = Math.round((rating > 10 ? rating / 10 : rating) * 10) / 10
  return RATING_TIERS.find(tier => score >= tier.min) ?? RATING_TIERS[RATING_TIERS.length - 1]
}

function RatingBadge({ value }: { value?: number }) {
  const rating = Number(value)
  const hasRating = Number.isFinite(rating) && rating > 0
  const tier = hasRating ? getRatingTier(rating) : null

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: { xs: 50, md: 55 },
        height: { xs: 24, md: 29.8 },
        px: 1,
        borderRadius: "8px",
        fontWeight: 800,
        fontSize: { xs: 15, md: 16 },
        lineHeight: 1,
        bgcolor: tier?.bg ?? "#3A3A3A",
        color: tier?.color ?? "#BDBDBD",
        boxShadow: "0 2px 8px rgba(0,0,0,0.35)"
      }}
    >
      {hasRating ? (rating <= 10 ? rating.toFixed(1) : rating) : "N/A"}
    </Box>
  )
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
      imdbRating: item.imdbRating || null,
      ratingSteam: item.ratingSteam || null,
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

        {tipo != "juegos" && (
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Box
              component="img"
              src="/images/imdbicon.jpg"
              alt="IMDB"
              sx={{ width: { xs: 45, md: 55 }, borderRadius: 1 }}
            />
            <RatingBadge value={item.imdbRating} />
          </Box>
        )}

        {tipo === "juegos" && (
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Box
              component="img"
              src="/images/steamicon.jpg"
              alt="Steam"
              sx={{ width: { xs: 45, md: 55 }, height: { xs: 24, md: 29 }, borderRadius: 1 }}
            />
            <RatingBadge value={item.ratingSteam} />
          </Box>
        )}

        <Box mt={1}>
          <Chip
            variant="outlined"
            label={item.year}
            sx={{
              backgroundColor: 'rgba(0, 229, 160, 0.49)',
              color: '#e2f110',
              border: '1px solid rgba(0, 229, 160, 0.2)',
              fontWeight: 800,
              fontSize: { xs: 15, md: 16 },
              borderRadius: "6px",
              width: { xs: 65, md: 70 },
              height: { xs: 26, md: 29 },
              py: 1
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: { xs: 110, md: 120 },
            height: { xs: 26, md: 29 },
            backgroundColor: 'rgba(238, 12, 12, 0.4)',
            color: '#ff6f2d',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 2,
            backdropFilter: "blur(14px) saturate(160%)",
            WebkitBackdropFilter: "blur(14px) saturate(160%)",
            mt: 1,
            transition: "all 0.25s ease",
            "&:hover": {
              backgroundColor: 'rgba(238, 12, 12, 0.4)',
              color: '#ff6f2d',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              transform: "translateY(-1px)"
            }
          }}>
          <Typography sx={{ fontWeight: "bold", fontSize: { xs: 15, md: 16 } }}>
            Peso: {item.pesoGB} GB
          </Typography>
        </Box>


        {item.temporada && (
          <Box
            sx={{
              display: 'flex',
              width: { xs: 116, md: 125 },
              height: { xs: 26, md: 29 },
              mt: 1,
            }}
          >
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: { xs: 15, md: 16 },
                backgroundColor: 'rgba(5, 37, 105, 0.61)',
                color: 'rgb(5, 101, 114)',
                border: '1px solid rgb(5, 101, 114)',
                borderRadius: 2,
                backdropFilter: "blur(14px) saturate(160%)",
                WebkitBackdropFilter: "blur(14px) saturate(160%)",
                px: 1,
                width: { xs: 116, md: 125 },
                height: { xs: 26, md: 29 },
              }}>
              Temporada: {item.temporada}
            </Typography>
          </Box>
        )}

        <Button
          fullWidth
          startIcon={<AddShoppingCartIcon />}
          variant="contained"
          sx={{
            mt: 1,
            fontWeight: "bold",
            borderRadius: 2
          }}
          onClick={agregar}
        >
          Pedir
        </Button>
      </Box>
    </Card>
  )
}