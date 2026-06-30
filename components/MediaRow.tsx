"use client"

import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import Button from "@mui/material/Button"
import Pagination from "@mui/material/Pagination"

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"

import MediaCard from "./MediaCard"
import { useRouter } from 'next/navigation'

type MediaItem = {
  _id: string
  poster: string
  nombre: string
}

type Props = {
  titulo: string
  items: MediaItem[]
  tipo: "peliculas" | "series" | "juegos"
}

export default function MediaRow({ titulo, items, tipo }: Props) {

  const router = useRouter()

  const handleExplorarTodo = () => {
    const rutas = {
      peliculas: '/peliculas',
      series: '/series',
      juegos: '/juegos'
    } as const

    router.push(rutas[tipo])
  }

  const [cardsPerPage, setCardsPerPage] = useState<number>(5)
  const [page, setPage] = useState<number>(0)

  useEffect(() => {

    const updateCards = () => {

      const width = window.innerWidth

      // Ajustado para móvil primero (como Netflix)
      if (width < 480) setCardsPerPage(2)      // Móvil pequeño: 2 tarjetas
      else if (width < 640) setCardsPerPage(3) // Móvil: 3 tarjetas  
      else if (width < 900) setCardsPerPage(4) // Tablet: 4 tarjetas
      else if (width < 1200) setCardsPerPage(5)// Desktop: 5 tarjetas
      else setCardsPerPage(6)                  // Grande: 6 tarjetas

    }

    updateCards()

    window.addEventListener("resize", updateCards)

    return () => window.removeEventListener("resize", updateCards)

  }, [])

  // ← NUEVO: Estado para la ventana de paginación visible
  const [visibleWindow, setVisibleWindow] = useState<{ start: number; end: number }>({ start: 0, end: 2 })

  const totalPages = Math.ceil(items.length / cardsPerPage)

  // ← NUEVO: Efecto para ajustar ventana cuando cambia la página
  useEffect(() => {
    const currentPage = page // página actual (0-based)
    let newStart = visibleWindow.start
    let newEnd = visibleWindow.end

    // Si la página actual está fuera de la ventana visible, ajustamos
    if (currentPage < visibleWindow.start) {
      // Retrocediendo: mostrar página anterior y las dos siguientes
      newStart = Math.max(0, currentPage - 1)
      newEnd = Math.min(totalPages - 1, newStart + 2)
    } else if (currentPage > visibleWindow.end) {
      // Avanzando: mostrar página siguiente y las dos anteriores
      newEnd = Math.min(totalPages - 1, currentPage + 1)
      newStart = Math.max(0, newEnd - 2)
    }

    // Ajuste final para siempre mostrar 3 botones si es posible
    if (newEnd - newStart < 2 && totalPages > 2) {
      if (newStart === 0) {
        newEnd = Math.min(2, totalPages - 1)
      } else if (newEnd === totalPages - 1) {
        newStart = Math.max(0, totalPages - 3)
      }
    }

    setVisibleWindow({ start: newStart, end: newEnd })
  }, [page, totalPages])

  // ← NUEVO: Función para cambiar página con dirección
  const changePage = (newPage: number, direction: 'prev' | 'next') => {
    setPage(newPage)

    // Ajustar ventana según dirección
    if (direction === 'next' && newPage > visibleWindow.end) {
      const newEnd = Math.min(totalPages - 1, visibleWindow.end + 1)
      const newStart = Math.max(0, newEnd - 2)
      setVisibleWindow({ start: newStart, end: newEnd })
    } else if (direction === 'prev' && newPage < visibleWindow.start) {
      const newStart = Math.max(0, visibleWindow.start - 1)
      const newEnd = Math.min(totalPages - 1, newStart + 2)
      setVisibleWindow({ start: newStart, end: newEnd })
    }
  }

  const start = page * cardsPerPage
  const end = start + cardsPerPage

  const visibleItems = items.slice(start, end)

  const next = () => {
    const newPage = (page + 1) % totalPages
    changePage(newPage, 'next')
  }

  const prev = () => {
    const newPage = (page - 1 + totalPages) % totalPages
    changePage(newPage, 'prev')
  }

  const handlePageClick = (clickedPage: number) => {
    const direction = clickedPage > page ? 'next' : 'prev'
    changePage(clickedPage, direction)
  }

  // ← NUEVO: Generar array de páginas visibles
  const visiblePages = []
  for (let i = visibleWindow.start; i <= visibleWindow.end && i < totalPages; i++) {
    visiblePages.push(i)
  }

  return (

    <Box
      sx={{
        position: "relative",
        mb: { xs: 2, sm: 4 },  // Menos margen en móvil
        width: "100%",
        px: { xs: 1, sm: 2 },   // Padding horizontal reducido en móvil
        "@keyframes slideFade": {
          "0%": {
            opacity: 0,
            transform: "translateX(20px)"  // Menos desplazamiento en móvil
          },
          "100%": {
            opacity: 1,
            transform: "translateX(0)"
          }
        }
      }}
    >

      <Typography
        variant="h5"
        sx={{ mb: 2, fontWeight: "bold" }}>
        {titulo}
      </Typography>

      <IconButton
        onClick={prev}
        sx={{
          position: "absolute",
          left: 10,
          top: "45%",
          zIndex: 3,
          background: "#000000aa",
          "&:hover": { background: "#000" }
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      <Box
        key={page}
        sx={{
          display: "flex",
          gap: 1,
          overflow: "hidden",
          width: "100%",
          height: 340,
          p: 2,
          animation: "slideFade 1s ease"
        }}
      >

        {visibleItems.map((item) => (

          <Box
            key={item._id}
            sx={{
              flex: `0 0 calc(100% / ${cardsPerPage})`,
              maxWidth: `calc(100% / ${cardsPerPage})`,
              transition: "transform .3s",
              "&:hover": {
                transform: "scale(1)"
              },
              scrollSnapType: { xs: 'x mandatory', sm: 'none' },   // Snap scroll en móvil
              "&::-webkit-scrollbar": { display: 'none' },       // Ocultar scrollbar
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
          >

            <MediaCard item={item} tipo={tipo} compact={cardsPerPage >= 2} />

          </Box>

        ))}

      </Box>

      <IconButton
        onClick={next}
        sx={{
          position: "absolute",
          right: 10,
          top: "45%",
          zIndex: 3,
          background: "#000000aa",
          "&:hover": { background: "#000" }
        }}
      >
        <ChevronRightIcon />
      </IconButton>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          mt: 2
        }}
      >

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            mt: 2,
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

          {/* Botón Explorar todo - alineado horizontal y verticalmente */}
          <Button
            variant="outlined"
            onClick={handleExplorarTodo}
            size="small"
            sx={{
              textTransform: "none",
              height: 36, // ← Misma altura que los botones de página
              borderRadius: 10, // ← Mismo borderRadius
              borderColor: 'grey.600',
              color: 'grey.400',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main'
              }
            }}
          >
            Explorar todo
          </Button>
        </Box>

      </Box>

    </Box>
  )
}