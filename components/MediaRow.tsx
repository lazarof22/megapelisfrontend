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

type MediaItem = {
  _id: string
  poster: string
  nombre: string
  tipo: "peliculas" | "series" | "juegos"
}

type Props = {
  titulo: string
  items: MediaItem[]
}

export default function MediaRow({ titulo, items }: Props) {

  const [cardsPerPage, setCardsPerPage] = useState<number>(5)
  const [page, setPage] = useState<number>(0)

  useEffect(() => {

    const updateCards = () => {

      const width = window.innerWidth

      if (width < 600) setCardsPerPage(2)
      else if (width < 900) setCardsPerPage(3)
      else if (width < 1200) setCardsPerPage(4)
      else setCardsPerPage(5)

    }

    updateCards()

    window.addEventListener("resize", updateCards)

    return () => window.removeEventListener("resize", updateCards)

  }, [])

  const totalPages = Math.ceil(items.length / cardsPerPage)

  const start = page * cardsPerPage
  const end = start + cardsPerPage

  const visibleItems = items.slice(start, end)

  const next = () => {
    setPage((p) => (p + 1) % totalPages)
  }

  const prev = () => {
    setPage((p) => (p - 1 + totalPages) % totalPages)
  }

  return (

    <Box sx={{
      position: "relative", mb: 4, width: "100%",
      "@keyframes slideFade": {
        "0%": {
          opacity: 0,
          transform: "translateX(40px)"
        },
        "100%": {
          opacity: 1,
          transform: "translateX(0)"
        }
      }
    }}>

      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
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
              }
            }}
          >

            <MediaCard item={item} />

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

        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={(e, value) => setPage(value - 1)}
          color="primary"
        />

        <Button variant="outlined" sx={{ textTransform: "none" }}>
          Explorar todo
        </Button>

      </Box>

    </Box>
  )
}