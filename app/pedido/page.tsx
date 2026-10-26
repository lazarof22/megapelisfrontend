"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Chip
} from "@mui/material"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"
import ActionDialog from "@/components/ActionDialog"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import FavoriteIcon from "@mui/icons-material/Favorite"
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import MovieIcon from "@mui/icons-material/Movie"
import TvIcon from "@mui/icons-material/Tv"
import SportsEsportsIcon from "@mui/icons-material/SportsEsports"
import AutoStoriesIcon from "@mui/icons-material/AutoStories"
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined"
import AlbumIcon from "@mui/icons-material/Album"


// 🎨 Paleta de la referencia (IGT.GG)
const COLORS = {
  bg: "#0D0D11",       // fondo general
  card: "#18181C",     // tarjeta resumen
  pill: "#222226",     // píldoras, inputs, steppers
  red: "#E52E2E",      // botón principal / acentos
  redHover: "#C92626",
  purple: "#D946EF",    // descuentos / alquiler
  textMuted: "#8E8E93" // textos secundarios
}


const TIPO_LABEL: Record<string, string> = {
  peliculas: "Película",
  series: "Serie",
  juegos: "Juego",
  novelas: "Novela"
}


const TIPO_ICON: Record<string, React.ReactNode> = {
  peliculas: <MovieIcon sx={{ fontSize: 14, color: "#cfcfd4" }} />,
  series: <TvIcon sx={{ fontSize: 14, color: "#cfcfd4" }} />,
  juegos: <SportsEsportsIcon sx={{ fontSize: 14, color: "#cfcfd4" }} />,
  novelas: <AutoStoriesIcon sx={{ fontSize: 14, color: "#cfcfd4" }} />
}


const PRECIO_ALQUILER = 150


export default function CartPage() {

  const router = useRouter()
  const { items, removeItem, addItem } = useCart()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState("")
  const [dialogMessage, setDialogMessage] = useState("")
  const [type, setType] = useState<"success" | "error" | "warning" | "info">("success")

  const mostrarDialogo = (title: string, message: string, dialogType: "success" | "error" | "warning" | "info") => {
    setDialogTitle(title)
    setDialogMessage(message)
    setType(dialogType)
    setDialogOpen(true)
  }

  const [alquiler, setAlquiler] = useState(false)
  const [telefono, setTelefono] = useState("+53 ")
  const [nombre, setNombre] = useState("")
  const [promoCode, setPromoCode] = useState("")
  const [promoAplicado, setPromoAplicado] = useState(false)
  const [pago, setPago] = useState("efectivo")
  const [favoritos, setFavoritos] = useState<string[]>([])

  const [precios, setPrecios] = useState<any>(null)
  const [imagenes, setImagenes] = useState<Record<string, string>>({})
  const [recomendados, setRecomendados] = useState<any[]>([])

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [resPrecios, resPelis, resSeries, resJuegos] = await Promise.all([
        axios.get("/api/precios"),
        axios.get("/api/peliculas"),
        axios.get("/api/series"),
        axios.get("/api/juegos")
      ])

      setPrecios(resPrecios.data)

      // Mapa id → imagen para las miniaturas del carrito
      const map: Record<string, string> = {}
      const addToMap = (arr: any[]) =>
        arr.forEach((i: any) => {
          if (i.poster || i.banner) map[i._id] = i.poster || i.banner
        })
      addToMap(resPelis.data)
      addToMap(resSeries.data)
      addToMap(resJuegos.data)
      setImagenes(map)

      // Recomendados: películas destacadas
      setRecomendados(resPelis.data.filter((p: any) => p.destacado).slice(0, 5))
    } catch {
      mostrarDialogo("Error", "No se pudo cargar la información, por favor vuelva a intentarlo", "error")
    }
  }

  // 💰 Precios
  const getPrecioUnitario = (tipo: string) => {
    if (!precios) return 0
    if (tipo === "peliculas") return precios.precioPeliculas ?? 0
    if (tipo === "series") return precios.precioSeries ?? 0
    if (tipo === "juegos") return precios.precioJuegos ?? 0
    return 0
  }

  const getPrecioItem = (item: any) => getPrecioUnitario(item.tipo)

  const subtotal = items.reduce((acc, item) => acc + getPrecioItem(item), 0)
  const total = subtotal + (alquiler ? PRECIO_ALQUILER : 0)

  const isValid = telefono.trim().length > 7 && nombre.trim() !== ""

  const toggleFavorito = (id: string) => {
    setFavoritos(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  // 🧾 Generar el mensaje del pedido
  const generarMensaje = () => {

    let msg = `🛒 *Nuevo Pedido MegapelisTV*\n\n`

    items.forEach(item => {

      msg += `🎬 *${item.nombre}*\n`

      if (item.tipo === "series" && item.temporada) {
        const temp = Array.isArray(item.temporada)
          ? item.temporada.join(", ")
          : item.temporada
        msg += `Temporadas: ${temp}\n`
      }

      if (item.pesoGB) {
        msg += `Peso: ${item.pesoGB} GB\n`
      }

      msg += `Precio: $${getPrecioItem(item)}\n\n`
    })

    msg += `💰 *Subtotal:* $${subtotal}\n`

    if (alquiler) {
      msg += `📀 Alquiler de disco: $${PRECIO_ALQUILER}\n`
    }

    msg += `🧾 *Importe Total:* $${total}\n\n`

    msg += `💳 *Forma de pago:* ${pago === "efectivo" ? "Efectivo" : "Transferencia"}\n\n`

    msg += `👤 *Cliente:* ${nombre}\n`
    msg += `📱 *Teléfono:* ${telefono}`

    return msg
  }

  const enviarPedidoTelegram = async () => {

    const mensaje = generarMensaje()

    try {
      await fetch("/api/telegram/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje })
      })

      mostrarDialogo("Pedido enviado", "Tu pedido fue enviado correctamente", "success")
    } catch {
      mostrarDialogo("Error", "No se pudo enviar el pedido", "error")
    }
  }

  // 🖼️ Miniatura con fallback
  const Miniatura = ({ item, width, height }: { item: any; width: number; height: number }) => {
    const img = imagenes[item.id]
    if (img) {
      return (
        <Box
          component="img"
          src={img}
          alt={item.nombre}
          sx={{
            width,
            height,
            borderRadius: "12px",
            objectFit: "cover",
            flexShrink: 0
          }}
        />
      )
    }
    return (
      <Box
        sx={{
          width,
          height,
          borderRadius: "12px",
          bgcolor: COLORS.pill,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}
      >
        {TIPO_ICON[item.tipo] ?? <MovieIcon sx={{ color: "#555" }} />}
      </Box>
    )
  }

  // 🏷️ Píldora de badge
  const Pill = ({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) => (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        bgcolor: COLORS.pill,
        borderRadius: 999,
        px: 1.2,
        py: 0.3
      }}
    >
      {icon}
      <Typography sx={{ fontSize: 12, color: "#cfcfd4", whiteSpace: "nowrap" }}>
        {children}
      </Typography>
    </Box>
  )

  const darkTextFieldSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: COLORS.pill,
      borderRadius: 2.5,
      "& fieldset": { borderColor: "transparent" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.12)" },
      "&.Mui-focused fieldset": { borderColor: COLORS.red }
    },
    "& .MuiInputLabel-root": { color: COLORS.textMuted },
    "& .MuiOutlinedInput-input": { color: "#fff" }
  }

  return (
    <Box sx={{ bgcolor: COLORS.bg, minHeight: "100vh", py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2 } }}>
      <Box
        sx={{
          maxWidth: 1180,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 360px" },
          gap: { xs: 4, md: 6 },
          alignItems: "start"
        }}
      >
        {/* ══════════ COLUMNA IZQUIERDA: ITEMS ══════════ */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
            <Typography variant="h5" fontWeight={700} color="#fff">
              Tu Carrito
            </Typography>
            <Chip
              variant="filled"
              label={`${items.length} ${items.length === 1 ? "contenido" : "contenidos"}`}
              sx={{
                bgcolor: COLORS.red,
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                height: 30,
                "& .MuiChip-label": { p: 2.5 }
              }}
            />
          </Box>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 0.5 }} />

          {items.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                py: 8,
                textAlign: "center"
              }}
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 64, color: "#3a3a40" }} />
              <Typography color={COLORS.textMuted}>
                Tu carrito está vacío
              </Typography>
              <Button
                onClick={() => router.push("/")}
                sx={{
                  bgcolor: COLORS.red,
                  color: "#fff",
                  borderRadius: 999,
                  px: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { bgcolor: COLORS.redHover }
                }}
              >
                Explorar contenido
              </Button>
            </Box>
          ) : (
            items.map((item, index) => (
              <Box key={item.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 1.5
                  }}
                >
                  <Miniatura item={item} width={76} height={106} />

                  {/* Info del contenido */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} color="#fff" noWrap>
                      {item.nombre}
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                      <Pill icon={TIPO_ICON[item.tipo]}>
                        {TIPO_LABEL[item.tipo] ?? item.tipo}
                      </Pill>

                      {item.tipo === "series" && item.temporada && (
                        <Pill icon={<TvIcon sx={{ fontSize: 14, color: "#cfcfd4" }} />}>
                          {Array.isArray(item.temporada)
                            ? `T${item.temporada.join(", T")}`
                            : `T${item.temporada}`}
                        </Pill>
                      )}

                      {item.pesoGB && (
                        <Pill>{item.pesoGB} GB</Pill>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                      <IconButton
                        onClick={() => toggleFavorito(item.id)}
                        sx={{
                          bgcolor: COLORS.pill,
                          color: favoritos.includes(item.id) ? COLORS.red : "#cfcfd4",
                          "&:hover": { bgcolor: "#2a2a30" },
                          p: 1
                        }}
                      >
                        {favoritos.includes(item.id)
                          ? <FavoriteIcon sx={{ fontSize: 18 }} />
                          : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                      <IconButton
                        onClick={() => removeItem(item.id)}
                        sx={{
                          bgcolor: COLORS.pill,
                          color: "#cfcfd4",
                          "&:hover": { bgcolor: "#2a2a30", color: "#fff" },
                          p: 1
                        }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Precio */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: { xs: "space-between", sm: "flex-end" },
                      bgcolor: COLORS.red,
                      borderRadius: 2,
                      gap: 2,
                      px: 1.5,
                      py: 0.5,
                      maxWidth: { xs: 130, sm: 130 }
                    }}
                  >
                    <Typography fontWeight={600} fontSize={{ xs: 15, sm: 17 }} color="#fff">
                      Precio: ${getPrecioItem(item)}
                    </Typography>
                  </Box>
                </Box>
                {index < items.length - 1 && (
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                )}
              </Box>
            ))
          )}

          {/* ══════════ RECOMENDADOS ══════════ */}
          {recomendados.length > 0 && (
            <Box sx={{ mt: 5 }}>
              <Typography fontWeight={700} fontSize={18} color="#fff" sx={{ mb: 1 }}>
                Recomendados para ti
              </Typography>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 0.5 }} />

              {recomendados.map(rec => {
                const enCarrito = items.some(i => i.id === rec._id)
                return (
                  <Box
                    key={rec._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      py: 1.5
                    }}
                  >
                    <Miniatura item={{ id: rec._id, tipo: "peliculas", nombre: rec.nombre }} width={48} height={66} />

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={600} color="#fff" noWrap>
                        {rec.nombre}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: COLORS.textMuted }} noWrap>
                        Película{rec.pesoGB ? ` • ${rec.pesoGB} GB` : ""}
                      </Typography>
                    </Box>

                    <Typography fontWeight={700} color="#fff" fontSize={15}>
                      ${precios ? (precios.precioPeliculas ?? 0) : 0}
                    </Typography>

                    <Button
                      disabled={enCarrito}
                      startIcon={<AddIcon />}
                      onClick={() =>
                        addItem({
                          id: rec._id,
                          tipo: "peliculas",
                          nombre: rec.nombre,
                          pesoGB: rec.pesoGB
                        })
                      }
                      sx={{
                        bgcolor: enCarrito ? COLORS.pill : COLORS.red,
                        color: enCarrito ? COLORS.textMuted : "#fff",
                        borderRadius: 999,
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2,
                        "&:hover": { bgcolor: enCarrito ? COLORS.pill : COLORS.redHover },
                        whiteSpace: "nowrap"
                      }}
                    >
                      {enCarrito ? "Agregado" : "Agregar"}
                    </Button>
                  </Box>
                )
              })}
            </Box>
          )}
        </Box>

        {/* ══════════ COLUMNA DERECHA: RESUMEN ══════════ */}
        <Box
          sx={{
            bgcolor: COLORS.card,
            borderRadius: "20px",
            p: { xs: 2.5, sm: 3 },
            position: { xs: "static", md: "sticky" },
            top: 24,
            border: "1px solid rgba(255,255,255,0.05)"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
            <Typography fontWeight={700} fontSize={18} color="#fff">
              Tu Carrito
            </Typography>
            <Chip
              label={`${items.length} ${items.length === 1 ? "contenido" : "contenidos"}`}
              sx={{
                bgcolor: COLORS.pill,
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                height: 26,
                "& .MuiChip-label": { px: 1.5 }
              }}
            />
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1 }} />

          {/* Desglose por contenido (con scroll vertical) */}
          <Box
            sx={{
              maxHeight: 220,
              overflowY: "auto",
              pr: 0.5,
              "&::-webkit-scrollbar": { width: 2 },
              "&::-webkit-scrollbar-thumb": { bgcolor: "#333338", borderRadius: 999 },
              "&::-webkit-scrollbar-track": { bgcolor: "transparent" }
            }}
          >
            {items.map(item => (
              <Box
                key={item.id}
                sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 1.5 }}
              >
                <Typography
                  color={COLORS.textMuted}
                  fontSize={14}
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textAlign: "left",
                    flexShrink: 1
                  }}
                >
                  {item.nombre}
                </Typography>
                <Typography color="#fff" fontWeight={600} fontSize={14} sx={{ flexShrink: 0 }}>
                  ${getPrecioItem(item)}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1 }} />

          {/* Alquiler de disco */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "rgba(168,85,247,0.08)",
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              mb: 1.5
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={alquiler}
                  onChange={(e) => setAlquiler(e.target.checked)}
                  sx={{
                    color: COLORS.purple,
                    "&.Mui-checked": { color: COLORS.purple },
                    p: 1
                  }}
                />
              }
              label={
                <Typography sx={{ color: COLORS.purple, fontSize: 14 }}>
                  Alquilar disco
                </Typography>
              }
            />
            <Typography sx={{ color: COLORS.purple, fontWeight: 600, fontSize: 14 }}>
              +${PRECIO_ALQUILER}
            </Typography>
          </Box>

          {alquiler && (
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
              <Typography color={COLORS.textMuted} fontSize={14}>
                Disco alquilado
              </Typography>
              <Typography sx={{ color: COLORS.purple, fontSize: 14 }}>
                ${PRECIO_ALQUILER}
              </Typography>
            </Box>
          )}

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1 }} />

          {/* Total */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography color={COLORS.textMuted} fontSize={14}>
              Costo Total
            </Typography>
            <Typography fontWeight={800} fontSize={{ xs: 22, sm: 26 }} color="#fff">
              ${total}
            </Typography>
          </Box>

          {/* Forma de pago */}
          <Typography color={COLORS.textMuted} fontSize={13}>
            Forma de pago
          </Typography>
          <RadioGroup
            value={pago}
            onChange={(e) => setPago(e.target.value)}
            sx={{ display: "flex", flexDirection: "row", gap: 1, mb: 2.5 }}
          >
            <FormControlLabel
              value="efectivo"
              control={
                <Radio
                  sx={{
                    color: "#555",
                    "&.Mui-checked": { color: COLORS.red },
                    "&.Mui-checked .MuiSvgIcon-root": { color: COLORS.red }
                  }}
                />
              }
              label={<Typography color="#fff" fontSize={14}>Efectivo</Typography>}
            />
            <FormControlLabel
              value="transferencia"
              control={
                <Radio
                  sx={{
                    color: "#555",
                    "&.Mui-checked": { color: COLORS.red },
                    "&.Mui-checked .MuiSvgIcon-root": { color: COLORS.red }
                  }}
                />
              }
              label={<Typography color="#fff" fontSize={14}>Transferencia</Typography>}
            />
          </RadioGroup>

          {/* Datos del cliente */}
          <TextField
            fullWidth
            label="Nombre"
            size="small"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            sx={{ ...darkTextFieldSx, mb: 2 }}
          />
          <TextField
            fullWidth
            type="tel"
            label="Teléfono"
            size="small"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+53 5XXXXXXX"
            sx={darkTextFieldSx}
          />

          {/* Botón principal */}
          <Button
            fullWidth
            size="large"
            startIcon={<ShoppingCartIcon />}
            disabled={!isValid}
            onClick={enviarPedidoTelegram}
            sx={{
              mt: 3,
              bgcolor: COLORS.red,
              color: "#fff",
              borderRadius: 999,
              py: 1.3,
              fontWeight: 700,
              fontSize: 15,
              textTransform: "none",
              "&:hover": { bgcolor: COLORS.redHover },
              "&.Mui-disabled": { bgcolor: "#3a3a40", color: "#777" }
            }}
          >
            Realizar Pedido
          </Button>
        </Box>
      </Box>

      <ActionDialog
        open={dialogOpen}
        type={type}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  )
}