"use client"

import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import Box from "@mui/material/Box"
import FormControlLabel from "@mui/material/FormControlLabel"
import Checkbox from "@mui/material/Checkbox"
import Typography from "@mui/material/Typography"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { isAdmin } from "@/utils/adminGuard"
import AdminMainLayout from "@/components/AdminMainLayout"
import { Card, CardActions, CardContent } from "@mui/material"
import ActionDialog from "@/components/ActionDialog"

export default function AdminPage() {

  const router = useRouter()

  const [tipo, setTipo] = useState("")

  const [nombre, setNombre] = useState("")
  const [genero, setGenero] = useState("")
  const [sinopsis, setSinopsis] = useState("")
  const [imdbRating, setImdbRating] = useState("")
  const [pesoGB, setPesoGB] = useState("")
  const [year, setYear] = useState("")
  const [popularidad, setPopularidad] = useState("")
  const [destacado, setDestacado] = useState(false)

  const [temporada, setTemporada] = useState("")

  const [poster, setPoster] = useState("")
  const [banner, setBanner] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState("")
  const [dialogMessage, setDialogMessage] = useState("")
  const [type, setType] = useState<"success" | "error" | "warning" | "info">("info")

  const mostrarDialogo = (title: string, message: string, p0: "success" | "error" | "warning" | "info") => {
    setDialogTitle(title)
    setDialogMessage(message)
    setDialogOpen(true)
    setType(p0)
  }

  const [posterPreview, setPosterPreview] = useState("")
  const [bannerPreview, setBannerPreview] = useState("")

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/admin/login")
    }
  }, [])

  const guardar = async () => {

    try {

      if (!nombre || !genero || !sinopsis) {
        mostrarDialogo(
          "Error",
          "Debes completar todos los campos obligatorios",
          "warning"
        )
        return
      }

      const data: any = {
        nombre,
        genero,
        sinopsis,
        imdbRating: Number(imdbRating),
        pesoGB: Number(pesoGB),
        poster,
        banner,
        year: Number(year),
        destacado,
        popularidad: Number(popularidad)
      }

      if (tipo === "series") {
        data.temporada = Number(temporada)
      }

      await axios.post(`http://localhost:4000/${tipo}`, data)

      mostrarDialogo(
        "Contenido agregado",
        "La película fue agregada correctamente",
        "success"
      )

    } catch (error: any) {

      if (error.response) {
        mostrarDialogo(
          "Error del servidor",
          error.response.data.message || "Ocurrió un error en el servidor",
          "error"
        )
      } else {
        mostrarDialogo(
          "Error de conexión",
          "No se pudo conectar con el servidor",
          "error"
        )
      }

    }

  }

  return (

    <AdminMainLayout>
      <Card sx={{ width: '100%' }}>
        <CardContent>
          <Card sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ m: 1 }}>
              Panel de Administracion
            </Typography>
          </Card>
          <Card sx={{ p: 2, mt: 1 }}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
              }}
            >

              <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                <TextField
                  select
                  label="Tipo"
                  fullWidth
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <MenuItem value="">Seleccionar tipo</MenuItem>
                  <MenuItem value="peliculas">Película</MenuItem>
                  <MenuItem value="series">Serie</MenuItem>
                  <MenuItem value="juegos">Juego</MenuItem>

                </TextField>
              </Box>
              <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                <TextField label="Nombre"
                  fullWidth value={nombre}
                  onChange={(e) => setNombre(e.target.value)} />
              </Box>
              <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                <TextField
                  label="Genero"
                  select
                  fullWidth value={genero}
                  onChange={(e) => setGenero(e.target.value)} >

                  <MenuItem value="Accion">Accion</MenuItem>
                  <MenuItem value="Ciencia Ficcion">Ciencia Ficcion</MenuItem>
                  <MenuItem value="Anime">Anime</MenuItem>
                  <MenuItem value="Terror">Terror</MenuItem>
                  <MenuItem value="Comedia">Comedia</MenuItem>
                  <MenuItem value="Drama">Drama</MenuItem>
                  <MenuItem value="Animados">Animados</MenuItem>
                </TextField>
              </Box>
              <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                <TextField
                  label="IMDB Rating"
                  type="number"
                  fullWidth
                  value={imdbRating}
                  onChange={(e) => setImdbRating(e.target.value)}
                />
              </Box>
              <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                <TextField
                  label="Peso GB"
                  type="number"
                  fullWidth
                  value={pesoGB}
                  onChange={(e) => setPesoGB(e.target.value)}
                />
              </Box>
              <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                <TextField
                  label="Año"
                  type="number"
                  fullWidth
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </Box>
              <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                <TextField
                  label="Popularidad"
                  type="number"
                  fullWidth
                  value={popularidad}
                  onChange={(e) => setPopularidad(e.target.value)}
                />
              </Box>
              {tipo === "series" && (
                <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                  <TextField
                    label="Temporada"
                    type="number"
                    fullWidth
                    onChange={(e) => setTemporada(e.target.value)}
                  />
                </Box>
              )}
              <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                <TextField
                  label="Poster URL"
                  fullWidth
                  value={poster}
                  onChange={(e) => setPoster(e.target.value)}
                />
              </Box>
              <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                <TextField
                  label="Banner URL"
                  fullWidth
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                />
              </Box>
              <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                <TextField
                  label="Sinopsis"
                  multiline
                  rows={3}
                  fullWidth
                  value={sinopsis}
                  onChange={(e) => setSinopsis(e.target.value)}
                />
              </Box>
            </Box>
          </Card>
        </CardContent>
        <CardContent>
          <Card sx={{ p: 1, width: 'auto' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={destacado}
                  onChange={(e) => setDestacado(e.target.checked)}
                />
              }
              label="Contenido destacado"
            />
          </Card>
        </CardContent>
        <CardActions>
          <Card sx={{ mt: 1, p: 1, px: 2, width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(226, 45, 129, 0.9))",
              }}
              onClick={guardar}
            >
              Guardar
            </Button>
          </Card>
        </CardActions>
      </Card>
      <ActionDialog
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
      />
    </AdminMainLayout>

  )
}