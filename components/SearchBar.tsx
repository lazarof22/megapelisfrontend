"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Box from "@mui/material/Box"
import InputBase from "@mui/material/InputBase"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import CircularProgress from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"
import SearchIcon from "@mui/icons-material/Search"
import MovieIcon from "@mui/icons-material/Movie"
import TvIcon from "@mui/icons-material/Tv"
import SportsEsportsIcon from "@mui/icons-material/SportsEsports"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import ContenidoDialog from "./ContenidoDialog"
import { useRouter } from "next/navigation"

// -----------------------------------------------------------------------
// Tipos
// -----------------------------------------------------------------------

export type TipoContenido = "peliculas" | "series" | "juegos"

export interface SearchSuggestion {
  id: string | number
  title: string
  tipo: TipoContenido
  imagen?: string
  year?: string | number
}

interface SearchBarProps {
  placeholder?: string
  onSelect?: (item: SearchSuggestion) => void
}

// -----------------------------------------------------------------------
// Paleta (Netflix red + glow rojo/naranja sobre fondo oscuro)
// -----------------------------------------------------------------------
const COLORS = {
  bgInput: "#141416",
  border: "rgba(255, 255, 255, 0.08)",
  borderFocus: "rgba(229, 9, 20, 0.55)",
  text: "#f5f5f5",
  placeholder: "rgba(255,255,255,0.4)",
  netflixRed: "#E50914",
  netflixRedDark: "#B00610",
  glowRed: "#ff2740",
  glowOrange: "#ff8a00",
}

const TIPO_VALIDOS: TipoContenido[] = ["peliculas", "series", "juegos"]
const MIN_QUERY_LENGTH = 2

const TIPO_ICON: Record<TipoContenido, React.ElementType> = {
  peliculas: MovieIcon,
  series: TvIcon,
  juegos: SportsEsportsIcon,
}

const TIPO_LABEL: Record<TipoContenido, string> = {
  peliculas: "Película",
  series: "Serie",
  juegos: "Juego",
}

// -----------------------------------------------------------------------
// Normaliza y valida lo que llega de la API, así un dato suelto o mal
// formado del backend nunca rompe el render (id/title/tipo faltantes,
// tipo desconocido, respuesta que no es un array, etc).
// -----------------------------------------------------------------------
function normalizeResults(raw: unknown): SearchSuggestion[] {
  if (!Array.isArray(raw)) return []

  return raw
    .filter((item): item is Record<string, unknown> => {
      if (!item || typeof item !== "object") return false
      const hasId = "id" in item && (item as any).id !== undefined && (item as any).id !== null
      const hasTitle = typeof (item as any).title === "string" && (item as any).title.trim().length > 0
      const hasTipo = TIPO_VALIDOS.includes((item as any).tipo)
      return hasId && hasTitle && hasTipo
    })
    .map((item) => ({
      id: item.id as string | number,
      title: (item.title as string).trim(),
      tipo: item.tipo as TipoContenido,
      imagen: typeof item.imagen === "string" ? item.imagen : undefined,
      year:
        typeof item.year === "number" || typeof item.year === "string"
          ? item.year
          : undefined,
    }))
}

export default function SearchBar({
  placeholder = "Buscar películas, series, juegos...",
  onSelect,
}: SearchBarProps) {
  const router = useRouter()

  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [selectedContent, setSelectedContent] = useState<SearchSuggestion | null>(null)

  // ---------------------------------------------------------------------
  // Cerrar el dropdown al hacer click fuera
  // ---------------------------------------------------------------------
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Limpieza al desmontar: cancela fetch y timers pendientes
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  // ---------------------------------------------------------------------
  // Fetch de sugerencias con debounce + cancelación de requests previos
  // ---------------------------------------------------------------------
  const fetchSuggestions = useCallback(async (value: string) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setLoading(true)
      setErrorMsg(null)

      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(value)}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      })

      if (!res.ok) {
        throw new Error(`La API respondió con estado ${res.status}`)
      }

      const contentType = res.headers.get("content-type") ?? ""
      if (!contentType.includes("application/json")) {
        throw new Error("Respuesta inesperada del servidor")
      }

      const data = await res.json()
      const clean = normalizeResults(data?.results)

      setSuggestions(clean)
      setOpen(true)
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setSuggestions([])
        setErrorMsg("No se pudo cargar sugerencias, intenta de nuevo.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = query.trim()

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([])
      setOpen(false)
      setErrorMsg(null)
      return
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(trimmed)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, fetchSuggestions])

  // ---------------------------------------------------------------------
  // Navegación con teclado
  // ---------------------------------------------------------------------
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter") handleSubmit()
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelect(suggestions[activeIndex])
      } else {
        handleSubmit()
      }
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  function handleSelect(item: SearchSuggestion) {
    if (!item?.id || !item?.tipo) return // guarda extra por si llega algo corrupto
    setOpen(false)
    setQuery(item.title)
    if (onSelect) {
      onSelect(item)
    } else {
      setSelectedContent(item)
    }
  }

  function handleSubmit() {
    const trimmed = query.trim()
    if (trimmed.length === 0) return
    setOpen(false)
    router.push(`/buscar?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: { xs: "100%", sm: 560 },
        mx: "auto",
        px: { xs: 1.5, sm: 0 },
      }}
    >

      {/* ---- Input pill ---- */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          bgcolor: COLORS.bgInput,
          border: `1px solid ${focused ? COLORS.borderFocus : COLORS.border}`,
          borderRadius: "999px",
          pl: { xs: 2, sm: 3 },
          pr: { xs: "56px", sm: "72px" }, // deja espacio para el botón circular superpuesto
          height: { xs: 48, sm: 56 },
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
          boxShadow: focused
            ? `0 0 0 1px rgba(229,9,20,0.15), 0 8px 24px rgba(0,0,0,0.5)`
            : "0 4px 14px rgba(0,0,0,0.35)",
        }}
      >
        <InputBase
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(-1)
          }}
          onFocus={() => {
            setFocused(true)
            if (suggestions.length > 0) setOpen(true)
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          fullWidth
          sx={{
            color: COLORS.text,
            fontSize: { xs: 13.5, sm: 15 },
            "& input::placeholder": {
              color: COLORS.placeholder,
              opacity: 1,
            },
          }}
          inputProps={{ "aria-label": "Buscar contenido", enterKeyHint: "search" }}
        />

        {loading && (
          <CircularProgress
            size={18}
            thickness={5}
            sx={{ color: COLORS.netflixRed, mr: 1, flexShrink: 0 }}
          />
        )}
      </Box>

      {/* ---- Botón circular rojo Netflix, superpuesto al borde derecho ---- */}
      <IconButton
        onClick={handleSubmit}
        aria-label="Buscar"
        sx={{
          position: "absolute",
          zIndex: 2,
          right: { xs: 1.5, sm: 0 },
          top: "50%",
          transform: "translateY(-50%)",
          width: { xs: 44, sm: 56 },
          height: { xs: 44, sm: 56 },
          background: `linear-gradient(145deg, ${COLORS.netflixRed}, ${COLORS.netflixRedDark})`,
          boxShadow: focused
            ? `0 0 18px rgba(229,9,20,0.65)`
            : `0 0 10px rgba(229,9,20,0.35)`,
          transition: "box-shadow 0.3s ease, transform 0.15s ease",
          "&:hover": {
            background: `linear-gradient(145deg, ${COLORS.netflixRed}, ${COLORS.netflixRedDark})`,
            transform: "translateY(-50%) scale(1.05)",
          },
        }}
      >
        <SearchIcon sx={{ color: "#fff", fontSize: { xs: 18, sm: 20 } }} />
      </IconButton>

      {/* ---- Dropdown de autocompletado ---- */}
      {open && (
        <Paper
          elevation={0}
          sx={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: { xs: 12, sm: 0 },
            right: { xs: 12, sm: 0 },
            zIndex: 3,
            bgcolor: COLORS.bgInput,
            border: `1px solid ${COLORS.border}`,
            borderRadius: { xs: "12px", sm: "16px" },
            overflow: "hidden",
            boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
            maxHeight: { xs: "60vh", sm: "70vh" },
            overflowY: "auto",
          }}
        >
          {errorMsg && (
            <Typography
              variant="body2"
              sx={{ color: COLORS.placeholder, px: { xs: 2, sm: 3 }, py: 2 }}
            >
              {errorMsg}
            </Typography>
          )}

          {!errorMsg && suggestions.length === 0 && !loading && (
            <Typography
              variant="body2"
              sx={{ color: COLORS.placeholder, px: { xs: 2, sm: 3 }, py: 2 }}
            >
              Sin resultados para &quot;{query}&quot;
            </Typography>
          )}

          {!errorMsg &&
            suggestions.map((item, index) => {
              const Icon = TIPO_ICON[item.tipo] ?? HelpOutlineIcon
              const active = index === activeIndex
              return (
                <Box
                  key={`${item.tipo}-${item.id}`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(item)
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 1, sm: 1.5 },
                    px: { xs: 1.75, sm: 2.5 },
                    py: { xs: 1.2, sm: 1.4 },
                    cursor: "pointer",
                    bgcolor: active ? "rgba(229,9,20,0.12)" : "transparent",
                    borderLeft: active
                      ? `3px solid ${COLORS.netflixRed}`
                      : "3px solid transparent",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  <Icon
                    fontSize="small"
                    sx={{ color: active ? COLORS.netflixRed : COLORS.placeholder, flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ color: COLORS.text, fontWeight: 500, fontSize: { xs: 13, sm: 14 } }}
                    >
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: COLORS.placeholder,
                      flexShrink: 0,
                      fontSize: { xs: 11, sm: 12 },
                      textAlign: "right",
                    }}
                  >
                    {TIPO_LABEL[item.tipo] ?? "Contenido"}
                    {item.year ? ` · ${item.year}` : ""}
                  </Typography>
                </Box>
              )
            })}
        </Paper>
      )}
      <ContenidoDialog
        open={Boolean(selectedContent)}
        selection={selectedContent}
        onClose={() => setSelectedContent(null)}
      />
    </Box>
  )
}