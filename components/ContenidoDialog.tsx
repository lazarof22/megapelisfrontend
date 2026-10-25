"use client"

import { useEffect, useState } from "react"
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogContent,
  IconButton, Typography
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import GridViewIcon from "@mui/icons-material/GridView"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"
import type { SearchSuggestion, TipoContenido } from "@/components/SearchBar"

export type Contenido = {
  _id: string
  nombre: string
  genero?: string
  sinopsis?: string
  imdbRating?: number
  ratingSteam?: number
  pesoGB?: number
  precio?: number
  poster?: string
  banner?: string
  year?: number
  temporada?: number
  destacado?: boolean
  fechaAgregado?: string
}

type Props = {
  open: boolean
  selection: SearchSuggestion | null
  onClose: () => void
}

const TIPO_LABEL: Record<TipoContenido, string> = {
  peliculas: "Película",
  series: "Serie",
  juegos: "Juego",
}

export default function ContenidoDialog({ open, selection, onClose }: Props) {
  const router = useRouter()
  const { addItem } = useCart()
  const [contenido, setContenido] = useState<Contenido | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open || !selection) {
      setContenido(null)
      setError("")
      return
    }

    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        setError("")
        const response = await fetch(
          `/api/contenido/${selection?.tipo}/${encodeURIComponent(String(selection?.id))}`,
          { signal: controller.signal, headers: { Accept: "application/json" } },
        )
        if (!response.ok) throw new Error("No se pudo cargar la información de este contenido.")
        const data = await response.json()
        setContenido(data.contenido)
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError("No se pudieron cargar los datos. Comprueba la conexión e inténtalo de nuevo.")
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [open, selection])

  function handlePedir() {
    if (!contenido || !selection) return
    // Se conserva el mismo comportamiento que MediaCard: añadir al carrito sin duplicados.
    addItem({
      id: contenido._id,
      nombre: contenido.nombre,
      tipo: selection.tipo,
      pesoGB: contenido.pesoGB,
      temporada: contenido.temporada ? [contenido.temporada] : undefined,
    })
    onClose()
  }

  function handleVerPost() {
    if (!selection) return
    onClose()
    router.push(`/contenido/${selection.tipo}/${selection.id}`)
  }

  const generos = (contenido?.genero ?? "")
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      aria-labelledby="contenido-dialog-title"
      PaperProps={{
        sx: {
          bgcolor: "#111",
          color: "#f5f5f5",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 2,
          overflow: "hidden",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: "relative", overflowX: "hidden" }}>
        <IconButton
          aria-label="Cerrar"
          onClick={onClose}
          sx={{
            position: "absolute", right: 12, top: 12, zIndex: 5,
            bgcolor: "rgba(0,0,0,.65)", color: "#fff",
            "&:hover": { bgcolor: "rgba(229,9,20,.9)" },
          }}
        >
          <CloseIcon />
        </IconButton>

        {loading && (
          <Box sx={{ minHeight: 360, display: "grid", placeItems: "center" }}>
            <CircularProgress sx={{ color: "#e50914" }} />
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ p: 4 }}>
            <Typography color="error.light">{error}</Typography>
            <Button onClick={onClose} sx={{ mt: 2, color: "#fff" }}>Cerrar</Button>
          </Box>
        )}

        {!loading && !error && contenido && (
          <>
            <Box
              sx={{
                minHeight: { xs: 250, sm: 330 },
                position: "relative",
                display: "flex",
                alignItems: "flex-end",
                backgroundImage: `linear-gradient(0deg, #111 0%, rgba(17,17,17,.88) 24%, rgba(0,0,0,.12) 100%), linear-gradient(90deg, rgba(0,0,0,.55), transparent), url("${contenido.banner || contenido.poster || ""}")`,
                backgroundSize: "cover",
                backgroundPosition: "center 30%",
              }}
            >
              <Box sx={{ p: { xs: 2, sm: 4 }, width: "100%" }}>
                <Typography
                  id="contenido-dialog-title"
                  variant="h4"
                  sx={{ fontWeight: 900, textShadow: "0 2px 10px #000", mb: 2, fontSize: { xs: 25, sm: 34 } }}
                >
                  {contenido.nombre}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={handlePedir}
                    sx={{ bgcolor: "#f5f5f5", color: "#111", fontWeight: 800, px: 3, "&:hover": { bgcolor: "#ddd" } }}
                  >
                    Pedir
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<GridViewIcon />}
                    onClick={handleVerPost}
                    sx={{ bgcolor: "rgba(70,70,70,.92)", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#555" } }}
                  >
                    Ver post
                  </Button>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1.7fr) minmax(180px, 1fr)" }, gap: 3, p: { xs: 2, sm: 4 }, pt: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  {contenido.nombre}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", mb: 1.5 }}>
                  {contenido.year && <Chip size="small" label={contenido.year} sx={{ bgcolor: "#e50914", color: "#fff", fontWeight: 800 }} />}
                  <Typography variant="body2" color="grey.300">{selection ? TIPO_LABEL[selection.tipo] : ""}</Typography>
                  {contenido.temporada != null && <Typography variant="body2" color="grey.300">Temporada: {contenido.temporada}</Typography>}
                  {contenido.pesoGB != null && <Typography variant="body2" color="grey.300">{contenido.pesoGB} GB</Typography>}
                  {selection?.tipo === "peliculas" && contenido.imdbRating != null && <Chip size="small" label={`IMDb ${contenido.imdbRating}`} variant="outlined" sx={{ color: "#fff", borderColor: "#777" }} />}
                  {selection?.tipo === "juegos" && contenido.ratingSteam != null && <Chip size="small" label={`Steam ${contenido.ratingSteam}`} variant="outlined" sx={{ color: "#fff", borderColor: "#777" }} />}
                </Box>
                <Typography sx={{ lineHeight: 1.65, color: "#ddd", whiteSpace: "pre-line" }}>
                  {contenido.sinopsis || "No hay una sinopsis disponible para este contenido."}
                </Typography>
              </Box>

              <Box sx={{ borderLeft: { sm: "1px solid rgba(255,255,255,.12)" }, pl: { sm: 3 } }}>
                {generos.length > 0 && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography component="span" variant="body2" color="grey.500">Géneros: </Typography>
                    <Typography component="span" variant="body2" color="grey.100">{generos.join(", ")}</Typography>
                  </Box>
                )}
                {contenido.precio != null && selection?.tipo === "juegos" && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography component="span" variant="body2" color="grey.500">Precio: </Typography>
                    <Typography component="span" variant="body2">{contenido.precio}</Typography>
                  </Box>
                )}
                <Typography variant="caption" color="grey.600">
                  Información basada en los campos existentes de MegapelisTV.
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
