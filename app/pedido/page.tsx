"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  MenuItem,
  Divider
} from "@mui/material"
import "react-phone-input-2/lib/style.css"
import ActionDialog from "@/components/ActionDialog"
import axios from "axios"
import { useCart } from "@/context/CartContext"
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CartPage() {

  const { items, removeItem } = useCart()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState("")
  const [dialogMessage, setDialogMessage] = useState("")
  const [type, setType] = useState<"success" | "error" | "warning" | "info">('success')

  const mostrarDialogo = (title: string, message: string, dialogType: "success" | "error" | "warning" | "info") => {
    setDialogTitle(title)
    setDialogMessage(message)
    setType(dialogType)
    setDialogOpen(true)
  }

  const [alquiler, setAlquiler] = useState(false)
  const [telefono, setTelefono] = useState("+53 ")
  const [nombre, setNombre] = useState("")

  const [precios, setPrecios] = useState<any>(null)

  useEffect(() => {
    obtenerPrecios()
  }, [])

  const obtenerPrecios = async () => {
    try {
      const res = await axios.get("http://localhost:4000/precios")
      setPrecios(res.data)
    } catch (error) {
      mostrarDialogo("Error", "No se pudo cargar los precios, Por favor vuelva a intentarlo", "error")
    }
  }

  const getItemTotal = (items: any) => {

    if (!precios) {
      return 0
    }

    if (items.tipo === "peliculas") {
      return precios.precioPeliculas
    }

    if (items.tipo === "series") {
      return precios.precioSeries
    }

    if (items.tipo === "juegos") {
      return precios.precioJuegos
    }
  }

  const subtotal = precios
    ? items.reduce((acc, item) => acc + getItemTotal(item), 0)
    : 0

  const total = subtotal + (alquiler ? 150 : 0)

  const isValid = telefono.trim().length > 7 && nombre.trim() !== ""

  //Funcioanlidad para crear el mensaje
  const generarMensaje = () => {

    let msg = `🛒 *Nuevo Pedido MegapelisTV*\n\n`

    items.forEach(item => {

      const totalItem = getItemTotal(item)

      msg += `🎬 *${item.nombre}*\n`
      msg += `Tipo: ${item.tipo}\n`

      if (item.tipo === "series") {
        msg += `Temporadas: ${item.temporada}\n`
      }

      msg += `Precio: $${totalItem}\n\n`
    })

    msg += `💰 *Subtotal:* $${subtotal}\n`

    if (alquiler) {
      msg += `📀 Alquiler de disco: $150\n`
    }

    msg += `🧾 *Importe Total:* $${total}\n\n`

    msg += `👤 *Cliente:* ${nombre}\n`
    msg += `📱 *Teléfono:* ${telefono}`

    return msg
  }

  const enviarPedidoTelegram = async () => {

    const mensaje = generarMensaje()

    try {

      await fetch("http://localhost:4000/telegram/pedido", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mensaje })
      })

      mostrarDialogo("Pedido enviado", "Tu pedido fue enviado correctamente", "success")

    } catch (error) {

      mostrarDialogo("Error", "No se pudo enviar el pedido", "error")

    }

  }

  return (

    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>

      {/* IZQUIERDA - ITEMS (en móvil va arriba, en desktop a la izquierda) */}
      <Box sx={{ flex: { xs: "none", md: 2 } }}>

        <Card sx={{ m: { xs: 1, sm: 1 }, borderRadius: 2, p: 1, px: 2 }}>
          <Box>
            <Typography variant="h5">Tu pedido</Typography>
          </Box>
        </Card>


        {items.map((item) => (

          <Card key={item.id} sx={{ m: { xs: 1, sm: 1 }, borderRadius: 2 }}>

            <CardContent
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },  // ← En móvil: columna, en desktop: fila
                gap: { xs: 1, sm: 0 },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },  // ← En móvil: alineado a la izquierda
                p: { xs: 2, sm: 2 }  // ← Padding consistente
              }}>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {item.nombre}
                </Typography>

                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },  // ← Móvil: vertical, Desktop: horizontal
                  gap: { xs: 2, sm: 5 },
                  alignItems: { xs: 'flex-start', sm: 'flex-end' },
                  mt: { xs: 1, sm: 0 }
                }}>

                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    🎬Contenido: {item.tipo}
                  </Typography>

                  {item.tipo === "series" && item.temporada && (
                    <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      📺Temporada: {item.temporada}
                    </Typography>
                  )}

                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    🧱Peso: {item.pesoGB} GB
                  </Typography>

                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    💰Precio: ${getItemTotal(item)}
                  </Typography>
                </Box>

              </Box>

              <Button
                startIcon={<DeleteIcon />}
                variant="contained"
                color="error"
                onClick={() => removeItem(item.id)}
                sx={{
                  mt: { xs: 1, sm: 0 },
                  alignSelf: { xs: 'stretch', sm: 'auto' }  // ← Móvil: botón ancho completo
                }}
              >
              </Button>

            </CardContent>

          </Card>

        ))}

      </Box>

      {/* DERECHA - RESUMEN */}

      <Box
        sx={{
          flex: { xs: "none", md: 1 },
          minWidth: { xs: 'auto', md: 300 },
          order: { xs: 2, md: 1 }  // ← En móvil: va después de los items
        }}>

        <Card
          sx={{
            borderRadius: 3,
            position: { xs: "static", md: "sticky" },  // ← Sticky solo en desktop
            top: 20,
            mt: 1,
            mr: { xs: 0, md: 1 },
            mx: { xs: 1, md: 0 }  // ← Margen horizontal en móvil
          }}>

          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

            <Card sx={{ mb: 2, borderRadius: 2, px: 2, py: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Resumen del pedido
              </Typography>
            </Card>

            {items.map(item => (
              <Box key={item.id} sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 1,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                <Typography noWrap sx={{ maxWidth: '60%' }}>
                  {item.nombre}
                </Typography>
                <Typography>
                  ${getItemTotal(item)}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Card sx={{ display: 'flex', justifyContent: 'space-between', borderRadius: 2, p: 1.5, mb: 2 }}>
              <Typography sx={{ color: "primary.main", fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                💰 Costo del Contenido:
              </Typography>
              <Typography sx={{ color: "primary", fontWeight: 600 }}>
                ${subtotal}
              </Typography>
            </Card>


            {/* alquiler */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={alquiler}
                  onChange={(e) => setAlquiler(e.target.checked)}
                />
              }
              label={
                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Desea alquilar un disco? (+$150)
                </Typography>
              }
            />

            {alquiler && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Disco alquilado:</Typography>
                <Typography>$150</Typography>
              </Box>
            )}

            <Card sx={{ display: 'flex', width: 'auto', justifyContent: 'space-between', mt: 1, borderRadius: 2, p: 1 }}>
              <Typography sx={{ color: "primary.main" }}>
                💰 Costo Total del Pedido:
              </Typography>
              <Typography sx={{ color: "primary" }}>
                ${total}
              </Typography>
            </Card>

            {/* TELEFONO */}
            <TextField
              fullWidth
              type="tel"
              label="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="+53 5XXXXXXX"
            />

            {/* NOMBRE */}
            <TextField
              fullWidth
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              sx={{ mt: 2 }}
            />

            {/* BOTON */}
            <Button
              fullWidth
              startIcon={<CheckCircleOutlineIcon />}
              variant="contained"
              sx={{ mt: 3 }}
              disabled={!isValid}
              onClick={enviarPedidoTelegram}
            >
              Finalizar compra
            </Button>

          </CardContent>

        </Card>
        <ActionDialog
          open={dialogOpen}
          type={type}
          title={dialogTitle}
          message={dialogMessage}
          onClose={() => setDialogOpen(false)}
        />
      </Box>
    </Box>
  )
}