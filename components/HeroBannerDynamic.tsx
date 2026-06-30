"use client"

import { useEffect, useState, useRef } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import axios from "axios"
import StarIcon from "@mui/icons-material/Star"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { useCart } from "@/context/CartContext"

type Item = {
  _id: string
  nombre: string
  banner: string
  sinopsis: string
  tipo: "peliculas" | "series" | "juegos"
  imdbRating?: number
  year?: number
  temporada?: number
  pesoGB?: number
}

export default function HeroBannerDynamic() {

  const [items, setItems] = useState<Item[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const { addItem } = useCart()
  const intervalRef = useRef<any>(null)

  // 🔥 Cargar contenido
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pelis, series, juegos] = await Promise.all([
          axios.get("http://localhost:4000/peliculas"),
          axios.get("http://localhost:4000/series"),
          axios.get("http://localhost:4000/juegos")
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

  return (
    <Box
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      sx={{
        height: { xs: 300, md: 450 },
        position: "relative",
        backgroundImage: `url(${movie.banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        px: { xs: 2, md: 8 },
        transition: "all 0.8s ease-in-out"
      }}
    >

      {/* OVERLAY */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, rgba(0,0,0,0.9) 40%, transparent)"
        }}
      />

      {/* CONTENIDO */}
      <Box
        sx={{
          position: "relative",
          maxWidth: { xs: "100%", md: 500 },
          color: "#fff",
          animation: "fadeIn 1s ease"
        }}
      >

        <Typography sx={{ color: "#e50914", fontWeight: "bold", fontSize: { xs: 12, md: 14 } }}>
          {movie.tipo.toUpperCase()}
        </Typography>

        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ fontSize: { xs: "h4.fontSize", md: "h3.fontSize" } }}
        >
          {movie.nombre}
        </Typography>

        {/* IMDB */}
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <StarIcon sx={{ color: "#f5c518" }} />
          <Typography fontSize={{ xs: 12, md: 14 }}>
            {movie.imdbRating || "N/A"} / 10
          </Typography>
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
            onClick={agregar}
            sx={{
              background: "#e50914",
              "&:hover": { background: "#b20710" }
            }}
          >
            Pedir
          </Button>

          <Button variant="outlined" sx={{ color: "#fff", borderColor: "#fff" }}>
            Trailer
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
          bottom: 10,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: 1
        }}
      >
        {items.map((_, i) => (
          <Box
            key={i}
            onClick={() => setCurrentIndex(i)}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: i === currentIndex ? "#e50914" : "#aaa",
              cursor: "pointer"
            }}
          />
        ))}
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