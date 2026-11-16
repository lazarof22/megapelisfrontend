"use client"

import { useEffect, useState, useRef } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Chip from "@mui/material/Chip"
import axios from "axios"
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import GridViewIcon from "@mui/icons-material/GridView"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { useCart } from "@/context/CartContext"
import { useRouter } from "next/navigation"

type Item = {
  _id: string
  nombre: string
  banner: string
  sinopsis: string
  tipo: "peliculas" | "series" | "juegos"
  imdbRating?: number
  ratingSteam?: number
  year?: number
  temporada?: number
  pesoGB?: number
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
        width: { xs: 45, md: 55 },
        height: { xs: 20, md: 29.8 },
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

// Cantidad máxima de páginas visibles en los indicadores
const MAX_VISIBLE_PAGES = 3

export default function HeroBannerDynamic() {

  const [items, setItems] = useState<Item[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const router = useRouter()

  const { addItem } = useCart()
  const intervalRef = useRef<any>(null)

  // 🔥 Cargar contenido
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pelis, series, juegos] = await Promise.all([
          axios.get("/api/peliculas"),
          axios.get("/api/series"),
          axios.get("/api/juegos")
        ])

        const all = [
          ...pelis.data.map((i: any) => ({ ...i, tipo: "peliculas" })),
          ...series.data.map((i: any) => ({ ...i, tipo: "series" })),
          ...juegos.data.map((i: any) => ({ ...i, tipo: "juegos" }))
        ]

        setItems(all)
      } catch {
        console.error("Error cargando hero")
      }
    }

    fetchData()
  }, [])

  // 🔥 AUTOPLAY con pausa en hover
  useEffect(() => {
    if (items.length === 0) return

    if (!isHovering) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % items.length)
      }, 6000)
    }

    return () => clearInterval(intervalRef.current)
  }, [items, isHovering])

  const movie = items[currentIndex]

  // 🔥 PRELOAD imagen siguiente (lazy inteligente)
  useEffect(() => {
    if (items.length > 1) {
      const next = items[(currentIndex + 1) % items.length]
      const img = new Image()
      img.src = next.banner
    }
  }, [currentIndex, items])

  if (!movie) return null

  const agregar = () => {
    addItem({
      id: movie._id,
      nombre: movie.nombre,
      tipo: movie.tipo,
      pesoGB: movie.pesoGB,
      temporada: movie.temporada ? [movie.temporada] : undefined
    })
  }

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  // 🔥 Ir al detalle del contenido que se está mostrando en el hero
  const handleVerPost = () => {
    router.push(`/contenido/${movie.tipo}/${movie._id}`)
  }

  // 🔥 Paginador: máximo 3 páginas visibles alrededor de la actual (sin puntos suspensivos)
  const page = currentIndex
  const totalPages = items.length
  const firstVisible = Math.min(
    Math.max(page - 1, 0),
    Math.max(totalPages - MAX_VISIBLE_PAGES, 0)
  )
  const visiblePages = Array.from(
    { length: Math.min(MAX_VISIBLE_PAGES, totalPages) },
    (_, i) => firstVisible + i
  )
  const handlePageClick = (pageNum: number) => setCurrentIndex(pageNum)

  return (
    <Box
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      sx={{
        height: { xs: 380, md: 450 },
        boxSizing: "border-box",
        position: "relative",
        backgroundImage: `url(${movie.banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        px: { xs: 2, md: 8 },
        pb: { xs: 7, md: 8 }, // espacio reservado para los indicadores
        borderRadius: 3,
        transition: "all 0.8s ease-in-out"
      }}
    >

      {/* OVERLAY */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: 3,
          background: "linear-gradient(to right, rgba(0,0,0,0.9) 40%, transparent)"
        }}
      />

      {/* CONTENIDO */}
      <Box
        sx={{
          position: "relative",
          maxWidth: { xs: "100%", md: 500 },
          color: "#fff",
          borderRadius: 2,
          animation: "fadeIn 1s ease"
        }}
      >

        <Typography sx={{ color: "#e50914", fontWeight: "bold", fontSize: { xs: 15, md: 16 } }}>
          {movie.tipo.toUpperCase()}
        </Typography>

        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ fontSize: { xs: "h4.fontSize", md: "h4.fontSize" } }}
        >
          {movie.nombre}
        </Typography>
        {movie.tipo === "series" && (
          <Typography sx={{ color: "#fff", fontWeight: "bold", fontSize: { xs: 15, md: 16 } }}>
            Temporada: {movie.temporada}
          </Typography>
        )}

        {/* IMDB */}
        {movie.tipo != "juegos" && (
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Box
              component="img"
              src="/images/imdbicon.jpg"
              alt="IMDB"
              sx={{ width: { xs: 45, md: 55 }, borderRadius: 1 }}
            />
            <RatingBadge value={movie.imdbRating} />
          </Box>
        )}

        {/* STEAM */}
        {movie.tipo === "juegos" && (
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Box
              component="img"
              src="/images/steamicon.jpg"
              alt="Steam"
              sx={{ width: { xs: 45, md: 55 }, height: { xs: 20, md: 29 }, borderRadius: 1 }}
            />
            <RatingBadge value={movie.ratingSteam} />
          </Box>
        )}

        {/* AÑO */}

        <Box mt={1}>
          <Chip
            variant="outlined"
            label={movie.year}
            sx={{
              backgroundColor: 'rgba(0, 229, 160, 0.12)',
              color: '#00e5a0',
              border: '1px solid rgba(0, 229, 160, 0.2)',
              fontWeight: 800,
              fontSize: { xs: 15, md: 16 },
              borderRadius: "6px",
              width: { xs: 65, md: 70 },
              height: { xs: 20, md: 29 },
              py: 1
            }}
          />
        </Box>


        {/* SINOPSIS (recortada en móvil) */}
        <Typography
          mt={2}
          color="gray"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: { xs: 2, md: 4 },
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {movie.sinopsis}
        </Typography>

        <Box mt={3} display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddShoppingCartIcon />}
            onClick={agregar}
            sx={{
              fontWeight: 700,
              background: "#e50914",
              borderRadius: 2,
              "&:hover": { background: "#b20710" }
            }}
          >
            Pedir
          </Button>

          {/* 🧊 Botón con efecto cristal */}
          <Button
            variant="contained"
            disableElevation
            startIcon={<GridViewIcon />}
            onClick={handleVerPost}
            sx={{
              fontWeight: 700,
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 2,
              backdropFilter: "blur(14px) saturate(160%)",
              WebkitBackdropFilter: "blur(14px) saturate(160%)",
              transition: "all 0.25s ease",
              "&:hover": {
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                transform: "translateY(-1px)"
              }
            }}
          >
            Ver post
          </Button>
        </Box>

      </Box>

      {/* BOTONES LATERALES */}
      <IconButton
        onClick={prev}
        sx={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#fff",
          background: "#00000088"
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      <IconButton
        onClick={next}
        sx={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#fff",
          background: "#00000088"
        }}
      >
        <ChevronRightIcon />
      </IconButton>

      {/* INDICADORES */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: { xs: 10, md: 16 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: { xs: 1, sm: 2 },
          flexWrap: "wrap" // ← Permite que se ajusten en pantallas pequeñas
        }}
      >
        {/* Contenedor de paginación + flechas */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1
          }}
        >
          {/* Flecha izquierda */}
          <IconButton
            onClick={prev}
            size="small"
            sx={{
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          {/* Botones de página (máximo 3 visibles) - SIN PUNTOS SUSPENSIVOS */}
          {visiblePages.map((pageNum) => (
            <Button
              key={pageNum}
              onClick={() => handlePageClick(pageNum)}
              variant={pageNum === page ? "contained" : "outlined"}
              size="small"
              sx={{
                minWidth: 36,
                height: 36,
                borderRadius: 10,
                color: pageNum === page ? 'white' : 'grey.400',
                borderColor: 'grey.600',
                bgcolor: pageNum === page ? 'primary.main' : 'transparent',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'white'
                }
              }}
            >
              {pageNum + 1}
            </Button>
          ))}

          {/* Flecha derecha */}
          <IconButton
            onClick={next}
            size="small"
            sx={{
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ANIMACIÓN */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

    </Box>
  )
}