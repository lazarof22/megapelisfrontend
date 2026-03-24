"use client"

import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import Autocomplete from "@mui/material/Autocomplete"
import IconButton from "@mui/material/IconButton"
import EditIcon from "@mui/icons-material/Edit"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

import { isAdmin } from "@/utils/adminGuard"
import AdminMainLayout from "@/components/AdminMainLayout"
import ActionDialog from "@/components/ActionDialog"
import UpdateIcon from '@mui/icons-material/Update';

export default function EditarContenido() {

    const router = useRouter()

    const [catalogo, setCatalogo] = useState<any[]>([])
    const [contenidoSeleccionado, setContenidoSeleccionado] = useState<any>(null)

    const [tipo, setTipo] = useState("")

    const [nombre, setNombre] = useState("")
    const [genero, setGenero] = useState("")
    const [sinopsis, setSinopsis] = useState("")
    const [imdbRating, setImdbRating] = useState("")
    const [pesoGB, setPesoGB] = useState("")
    const [year, setYear] = useState("")
    const [popularidad, setPopularidad] = useState("")
    const [poster, setPoster] = useState("")
    const [banner, setBanner] = useState("")
    const [temporada, setTemporada] = useState("")
    const [destacado, setDestacado] = useState(false)

    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogTitle, setDialogTitle] = useState("")
    const [dialogMessage, setDialogMessage] = useState("")
    const [type, setType] = useState<"success" | "error" | "warning" | "info">("info")

    const mostrarDialogo = (title: string, message: string, t: "success" | "error" | "warning" | "info") => {
        setDialogTitle(title)
        setDialogMessage(message)
        setDialogOpen(true)
        setType(t)
    }

    useEffect(() => {

        if (!isAdmin()) {
            router.push("/admin/login")
        }

        cargarCatalogo()

    }, [])

    const cargarCatalogo = async () => {

        try {

            const [peliculas, series] = await Promise.all([
                axios.get("http://localhost:4000/peliculas"),
                axios.get("http://localhost:4000/series"),
            ])

            const data = [
                ...peliculas.data.map((i: any) => ({ ...i, tipo: "peliculas" })),
                ...series.data.map((i: any) => ({ ...i, tipo: "series" })),
            ]

            setCatalogo(data)

        } catch (err) {
            console.error(err)
        }

    }

    const cargarFormulario = (item: any) => {

        setContenidoSeleccionado(item)

        setTipo(item.tipo)
        setNombre(item.nombre)
        setGenero(item.genero)
        setSinopsis(item.sinopsis)
        setImdbRating(item.imdbRating)
        setPesoGB(item.pesoGB)
        setYear(item.year)
        setPopularidad(item.popularidad)
        setPoster(item.poster)
        setBanner(item.banner)
        setDestacado(item.destacado)

        if (item.temporada) {
            setTemporada(item.temporada)
        }

    }

    const actualizar = async () => {

        try {

            if (!contenidoSeleccionado) {
                mostrarDialogo("Error", "Selecciona un contenido primero", "warning")
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
                popularidad: Number(popularidad),
                destacado
            }

            if (tipo === "series") {
                data.temporada = Number(temporada)
            }

            await axios.patch(
                `http://localhost:4000/${tipo}/${contenidoSeleccionado._id}`,
                data
            )

            mostrarDialogo(
                "Actualizado",
                "El contenido fue actualizado correctamente",
                "success"
            )

        } catch (err: any) {

            mostrarDialogo(
                "Error",
                "Error actualizando contenido",
                "error"
            )

        }

    }

    return (

        <AdminMainLayout>

            <Card>

                <CardContent>

                    <Typography variant="h6">
                        Editar contenido del catálogo
                    </Typography>

                    {/* BUSCADOR */}

                    <Autocomplete
                        options={catalogo}
                        getOptionLabel={(option) => option.nombre || ""}
                        renderOption={(props, option) => (
                            <Box
                                component="li"
                                {...props}
                                sx={{ display: "flex", justifyContent: "space-between" }}
                            >

                                <Typography>
                                    {option.nombre}
                                </Typography>

                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        cargarFormulario(option)
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>

                            </Box>
                        )}
                        renderInput={(params) => (

                            <TextField
                                {...params}
                                label="Buscar contenido por nombre"
                                margin="normal"
                            />

                        )}
                    />

                </CardContent>

            </Card>

            {/* FORMULARIO */}

            <Card sx={{ mt: 2 }}>

                <CardContent>

                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 2
                        }}
                    >

                        <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                            <TextField
                                label="Nombre"
                                fullWidth
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                        </Box>

                        <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                            <TextField
                                label="Genero"
                                select
                                fullWidth
                                value={genero}
                                onChange={(e) => setGenero(e.target.value)} >

                                <MenuItem value="Accion">Película</MenuItem>
                                <MenuItem value="Ciencia Ficcion">Serie</MenuItem>
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

                        <Box sx={{ flex: "100%" }}>
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

                </CardContent>

                <CardActions>

                    <Button
                        startIcon={<UpdateIcon />}
                        fullWidth
                        variant="contained"
                        onClick={actualizar}
                    >
                        Actualizar contenido
                    </Button>
                    <Button
                        startIcon={<UpdateIcon />}
                        fullWidth
                        variant="contained"
                        onClick={actualizar}
                    >
                        Eliminar contenido
                    </Button>
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