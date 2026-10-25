"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import {
  Box, Button, Chip, CircularProgress, Container, Typography
} from "@mui/material"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import MainLayout from "@/components/MainLayout"
import { useCart } from "@/context/CartContext"
import type { Contenido } from "@/components/ContenidoDialog"
import type { TipoContenido } from "@/components/SearchBar"

const TIPOS: TipoContenido[] = ["peliculas", "series", "juegos"]

export default function ContenidoPage() {
  const params = useParams<{ tipo: string; id: string }>()
  const tipo = params.tipo
  const id = params.id
  const { addItem } = useCart()
  const [contenido, setContenido] = useState<Contenido | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const tipoValido = useMemo(() => TIPOS.includes(tipo as TipoContenido), [tipo])

  useEffect(() => {
    if (!tipoValido || !id) {
      setError("La dirección del contenido no es válida.")
      setLoading(false)
      return
    }

    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        setError("")
        const response = await fetch(`/api/contenido/${tipo}/${encodeURIComponent(id)}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || "No se pudo cargar el contenido.")
        setContenido(data.contenido)
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError((e as Error).message || "Error cargando el contenido.")
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [tipo, id, tipoValido])

  function handlePedir() {
    if (!contenido || !tipoValido) return
    addItem({
      id: contenido._id,
      nombre: contenido.nombre,
      tipo: tipo as TipoContenido,
      pesoGB: contenido.pesoGB,
      temporada: contenido.temporada ? [contenido.temporada] : undefined,
    })
  }

  const generos = (contenido?.genero ?? "").split(/[,;]/).map(x => x.trim()).filter(Boolean)

  return (
    <MainLayout>
      {loading ? (
        <Box sx={{ minHeight: "55vh", display: "grid", placeItems: "center" }}>
          <CircularProgress sx={{ color: "#e50914" }} />
        </Box>
      ) : error || !contenido ? (
        <Container sx={{ py: 8, color: "#fff" }}>
          <Typography variant="h5" sx={{ mb: 2 }}>{error || "No se encontró el contenido."}</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={() => history.back()} sx={{ color: "#fff" }}>Volver</Button>
        </Container>
      ) : (
        <Box sx={{ color: "#fff", pb: 6 }}>
          <Box
            sx={{
              position: "relative",
              minHeight: { xs: 420, md: 500 },
              display: "flex",
              alignItems: "center",
              backgroundImage: `linear-gradient(90deg, rgba(8,8,12,.96) 0%, rgba(8,8,12,.78) 48%, rgba(8,8,12,.25) 100%), linear-gradient(0deg, #0f0f0f 0%, transparent 45%), url("${contenido.banner || contenido.poster || ""}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              px: { xs: 2, md: 5 },
              py: 4,
            }}
          >
            <Container maxWidth="xl" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "280px minmax(0, 1fr)" }, gap: { xs: 3, md: 5 }, alignItems: "center" }}>
              {contenido.poster ? (
                <Box component="img" src={contenido.poster} alt={`Póster de ${contenido.nombre}`} sx={{ width: "100%", maxWidth: 280, maxHeight: 420, objectFit: "cover", borderRadius: 2, boxShadow: "0 12px 35px #000" }} />
              ) : <Box sx={{ display: { xs: "none", md: "block" }, width: 280 }} />}
              <Box sx={{ maxWidth: 850 }}>
                <Typography variant="overline" sx={{ color: "#ff4757", fontWeight: 800, letterSpacing: 2 }}>
                  {tipo === "peliculas" ? "PELÍCULA" : tipo === "series" ? "SERIE" : "JUEGO"}
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: 32, sm: 42, md: 54 }, lineHeight: 1.1, mb: 2 }}>
                  {contenido.nombre}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {contenido.year && <Chip label={contenido.year} sx={{ bgcolor: "#e50914", color: "#fff", fontWeight: 800 }} />}
                  {contenido.pesoGB != null && <Chip label={`${contenido.pesoGB} GB`} variant="outlined" sx={{ color: "#fff", borderColor: "#777" }} />}
                  {contenido.temporada != null && <Chip label={`Temporada ${contenido.temporada}`} variant="outlined" sx={{ color: "#fff", borderColor: "#777" }} />}
                  {contenido.imdbRating != null && tipo === "peliculas" && <Chip label={`IMDb ${contenido.imdbRating}`} variant="outlined" sx={{ color: "#fff", borderColor: "#777" }} />}
                  {contenido.ratingSteam != null && tipo === "juegos" && <Chip label={`Steam ${contenido.ratingSteam}`} variant="outlined" sx={{ color: "#fff", borderColor: "#777" }} />}
                </Box>
                {generos.length > 0 && (
                  <Typography sx={{ color: "#ddd", mb: 2 }}>Géneros: {generos.join(", ")}</Typography>
                )}
                <Typography sx={{ color: "#eee", fontSize: { xs: 15, md: 17 }, lineHeight: 1.8, mb: 3, maxWidth: 850 }}>
                  {contenido.sinopsis || "No hay una sinopsis disponible para este contenido."}
                </Typography>
                <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={handlePedir} sx={{ bgcolor: "#f5f5f5", color: "#111", fontWeight: 900, px: 4, py: 1.4, "&:hover": { bgcolor: "#ddd" } }}>
                  Pedir
                </Button>
              </Box>
            </Container>
          </Box>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Información del contenido</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
              {contenido.year != null && <Typography><Box component="span" sx={{ color: "grey.500" }}>Año: </Box>{contenido.year}</Typography>}
              {contenido.genero && <Typography><Box component="span" sx={{ color: "grey.500" }}>Géneros: </Box>{generos.join(", ")}</Typography>}
              {contenido.pesoGB != null && <Typography><Box component="span" sx={{ color: "grey.500" }}>Tamaño: </Box>{contenido.pesoGB} GB</Typography>}
              {contenido.temporada != null && <Typography><Box component="span" sx={{ color: "grey.500" }}>Temporada: </Box>{contenido.temporada}</Typography>}
              {contenido.precio != null && tipo === "juegos" && <Typography><Box component="span" sx={{ color: "grey.500" }}>Precio: </Box>{contenido.precio}</Typography>}
              {contenido.destacado && <Typography sx={{ color: "#ffca28" }}>Contenido destacado</Typography>}
            </Box>
          </Container>
        </Box>
      )}
    </MainLayout>
  )
}
