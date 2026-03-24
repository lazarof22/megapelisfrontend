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
  MenuItem
} from "@mui/material"
import "react-phone-input-2/lib/style.css"
import ActionDialog from "@/components/ActionDialog"
import axios from "axios"
import { useCart } from "@/context/CartContext"

export default function CartPage() {

  const { items, removeItem } = useCart()

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
      console.error("Error cargando precios")
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

  const isValid = telefono.trim().length > 4 && nombre.trim() !== ""

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

      mostrarDialogo(
        "Pedido enviado",
        "Tu pedido fue enviado correctamente",
        "success"
      )

    } catch (error) {

      mostrarDialogo(
        "Error",
        "No se pudo enviar el pedido",
        "error"
      )

    }

  }

  return (

    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>

      {/* IZQUIERDA - ITEMS */}

      <Box sx={{ flex: 2 }}>

        <Card sx={{ m: 1, borderRadius: 2, p: 1, px: 2 }}>
          <Box>
            <Typography variant="h5">Tu pedido</Typography>
          </Box>
        </Card>


        {items.map((item) => (

          <Card key={item.id} sx={{ m: 1, borderRadius: 2 }}>

            <CardContent
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignContent: 'center',
                alignItems: 'center'
              }}>

              <Typography variant="h6">{item.nombre}</Typography>

              <Typography color="text.secondary">
                Contenido: {item.tipo}
              </Typography>

              <Typography sx={{ m: 2 }}>
                Precio: ${getItemTotal(item)}
              </Typography>

              {item.tipo === "series" && item.temporada && (
                <Typography>
                  Temporada: {item.temporada}
                </Typography>
              )}

              <Typography sx={{ m: 2 }}>
                Peso: {item.pesoGB} GB
              </Typography>

              <Button color="error" onClick={() => removeItem(item.id)}>
                Eliminar
              </Button>

            </CardContent>

          </Card>

        ))}

      </Box>

      {/* DERECHA - RESUMEN */}

      <Box sx={{ flex: 1, minWidth: 300 }}>

        <Card sx={{ borderRadius: 3, position: "sticky", top: 20 }}>

          <CardContent>

            <Typography variant="h6" gutterBottom>
              Resumen del pedido
            </Typography>

            {items.map(item => (
              <Typography key={item.id}>
                {item.nombre}: ${getItemTotal(item)}
              </Typography>
            ))}

            <Typography sx={{ mt: 2 }}>
              Subtotal: ${subtotal}
            </Typography>

            {/* alquiler */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={alquiler}
                  onChange={(e) => setAlquiler(e.target.checked)}
                />
              }
              label="Desea alquilar un disco (+150)"
            />

            {alquiler && (
              <Typography>
                Alquiler: $150
              </Typography>
            )}

            <Typography sx={{ mt: 2, fontWeight: "bold" }}>
              Total: ${total}
            </Typography>

            {/* TELEFONO */}
            <TextField
              fullWidth
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
              variant="contained"
              sx={{ mt: 3 }}
              disabled={!isValid}
              onClick={enviarPedidoTelegram}
            >
              Finalizar compra
            </Button>

          </CardContent>

        </Card>

      </Box>
      <ActionDialog
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  )
}