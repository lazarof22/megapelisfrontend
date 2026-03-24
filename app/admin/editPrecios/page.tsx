"use client"

import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

import { isAdmin } from "@/utils/adminGuard"
import AdminMainLayout from "@/components/AdminMainLayout"
import ActionDialog from "@/components/ActionDialog"
import UpdateIcon from '@mui/icons-material/Update';

export default function ActualizarPrecios() {

    const router = useRouter()

    const [precioId, setPrecioId] = useState("")

    const [precioPeliculas, setPrecioPeliculas] = useState("")
    const [precioSeries, setPrecioSeries] = useState("")
    const [precioJuegos, setPrecioJuegos] = useState("")

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

        obtenerPrecios()

    }, [])

    // 🔥 Obtener precios actuales
    const obtenerPrecios = async () => {
        try {

            const res = await axios.get("http://localhost:4000/precios")

            const precios = res.data

            // asumiendo que solo tienes 1 documento
            setPrecioId(precios._id)
            setPrecioPeliculas(precios.precioPeliculas.toString())
            setPrecioSeries(precios.precioSeries.toString())
            setPrecioJuegos(precios.precioJuegos.toString())

        } catch (error) {

            mostrarDialogo(
                "Error",
                "No se pudieron cargar los precios",
                "error"
            )

        }
    }

    // 🔥 Actualizar precios
    const actualizarPrecios = async () => {

        try {

            if (!precioPeliculas || !precioSeries || !precioJuegos) {
                mostrarDialogo("Error", "Todos los campos son obligatorios", "warning")
                return
            }

            const data = {
                precioPeliculas: Number(precioPeliculas),
                precioSeries: Number(precioSeries),
                precioJuegos: Number(precioJuegos)
            }

            await axios.patch(`http://localhost:4000/precios/${precioId}`, data)

            mostrarDialogo(
                "Actualizado",
                "Los precios fueron actualizados correctamente",
                "success"
            )

        } catch (err: any) {

            mostrarDialogo(
                "Error",
                "Error actualizando precios",
                "error"
            )

        }

    }

    return (

        <AdminMainLayout>

            <Card>
                <CardContent>
                    <Typography variant="h6">
                        Editar precios
                    </Typography>
                </CardContent>
            </Card>

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
                                label="Precio de las Películas"
                                type="number"
                                fullWidth
                                value={precioPeliculas}
                                onChange={(e) => setPrecioPeliculas(e.target.value)}
                            />
                        </Box>

                        <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                            <TextField
                                label="Precio de las Series"
                                type="number"
                                fullWidth
                                value={precioSeries}
                                onChange={(e) => setPrecioSeries(e.target.value)}
                            />
                        </Box>

                        <Box sx={{ flex: { xs: "100%", md: "32%" } }}>
                            <TextField
                                label="Precio de los Juegos"
                                type="number"
                                fullWidth
                                value={precioJuegos}
                                onChange={(e) => setPrecioJuegos(e.target.value)}
                            />
                        </Box>

                    </Box>

                </CardContent>

                <CardActions>

                    <Button
                        startIcon={<UpdateIcon />}
                        fullWidth
                        variant="contained"
                        onClick={actualizarPrecios}
                    >
                        Actualizar precios
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