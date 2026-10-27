"use client"

import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import {
  Alert, Box, Button, Checkbox, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem,
  Paper, Snackbar, Stack, TextField, Typography,
} from "@mui/material"
import MovieCreationOutlinedIcon from "@mui/icons-material/MovieCreationOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import PriceChangeOutlinedIcon from "@mui/icons-material/PriceChangeOutlined"
import CloseIcon from "@mui/icons-material/Close"
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import AdminMainLayout from "@/components/AdminMainLayout"
import ActionDialog from "@/components/ActionDialog"
import SearchBar, { type SearchSuggestion, type TipoContenido } from "@/components/SearchBar"
import { isAdmin } from "@/utils/adminGuard"

type TipoFormulario = TipoContenido | ""
type Severity = "success" | "error" | "warning" | "info"
type FormValues = {
  nombre: string; genero: string; sinopsis: string; imdbRating: string
  ratingSteam: string; pesoGB: string; year: string; popularidad: string
  temporada: string; poster: string; banner: string; destacado: boolean
}
type RecordContent = { _id: string; [key: string]: unknown }
type Prices = { precioPeliculas: string; precioSeries: string; precioJuegos: string }

const RED = "#e50914"
const EMPTY: FormValues = { nombre: "", genero: "", sinopsis: "", imdbRating: "", ratingSteam: "", pesoGB: "", year: "", popularidad: "", temporada: "", poster: "", banner: "", destacado: false }
const DEFAULT_PRICES: Prices = { precioPeliculas: "30", precioSeries: "50", precioJuegos: "150" }
const GENRES = ["Accion", "Aventura", "Ciencia Ficcion", "Anime", "Terror", "Comedia", "Drama", "Animados", "Thriller", "Suspenso", "Fantasia", "Romance", "Documental", "Deportes", "Estrategia", "RPG"]
const panel = { bgcolor: "#252525", color: "#f5f5f5", border: "1px solid rgba(255,255,255,.06)", borderRadius: 3, boxShadow: "0 12px 32px rgba(0,0,0,.2)" }
const formPanel = { bgcolor: "#1e1e1e", color: "#f5f5f5", border: "1px solid #3b3b3b", borderRadius: 3, boxShadow: "0 5px 12px rgba(0,0,0,.18)" }
const fieldSx = {
  "& .MuiOutlinedInput-root": { color: "#f6f6f6", borderRadius: 2.5, bgcolor: "#292929", "& fieldset": { borderColor: "#626262" }, "&:hover fieldset": { borderColor: "#999" }, "&.Mui-focused fieldset": { borderColor: RED } },
  "& .MuiInputLabel-root": { color: "#c9c9c9" }, "& .MuiInputLabel-root.Mui-focused": { color: "#fff" }, "& .MuiSvgIcon-root": { color: "#c9c9c9" },
}
const primary = { bgcolor: RED, color: "#fff", borderRadius: 2.5, fontWeight: 700, textTransform: "none" as const, px: 2.5, py: 1.15, boxShadow: "none", "&:hover": { bgcolor: "#bd0710", boxShadow: "none" }, "&.Mui-disabled": { bgcolor: "#555", color: "#aaa" } }
const secondary = { bgcolor: "#303030", color: "#fff", borderRadius: 2.5, textTransform: "none" as const, fontWeight: 600, px: 2, py: 1.1, "&:hover": { bgcolor: "#3b3b3b" } }
const typeButton = { ...primary, borderRadius: 999, minHeight: 42, "&.MuiButton-outlined": { borderColor: "#555", color: "#eee" }, "&.MuiButton-outlined:hover": { borderColor: RED, bgcolor: "rgba(229,9,20,.08)" } }

function str(v: unknown) { return v === null || v === undefined ? "" : String(v) }
function fromRecord(v: RecordContent): FormValues {
  return { nombre: str(v.nombre), genero: str(v.genero), sinopsis: str(v.sinopsis), imdbRating: str(v.imdbRating), ratingSteam: str(v.ratingSteam), pesoGB: str(v.pesoGB), year: str(v.year), popularidad: str(v.popularidad), temporada: str(v.temporada), poster: str(v.poster), banner: str(v.banner), destacado: Boolean(v.destacado) }
}
function num(v: string): number | undefined { if (!v.trim()) return undefined; const n = Number(v); return Number.isFinite(n) ? n : undefined }
function singular(t: TipoContenido) { return t === "peliculas" ? "película" : t === "series" ? "serie" : "juego" }
function makePayload(v: FormValues, tipo: TipoFormulario | TipoContenido | null) {
  const p: Record<string, unknown> = { nombre: v.nombre.trim(), genero: v.genero, sinopsis: v.sinopsis.trim(), pesoGB: num(v.pesoGB), year: num(v.year), poster: v.poster.trim(), banner: v.banner.trim(), destacado: v.destacado }
  if (v.popularidad.trim()) p.popularidad = Number(v.popularidad)
  if (tipo === "juegos") p.ratingSteam = num(v.ratingSteam)
  else p.imdbRating = num(v.imdbRating)
  if (tipo === "series") p.temporada = num(v.temporada)
  return p
}

export default function AdminPage() {
  const router = useRouter()
  const [addType, setAddType] = useState<TipoFormulario>("peliculas")
  const [add, setAdd] = useState<FormValues>({ ...EMPTY })
  const [editType, setEditType] = useState<TipoContenido | null>(null)
  const [editId, setEditId] = useState("")
  const [edit, setEdit] = useState<FormValues>({ ...EMPTY })
  const [editLoading, setEditLoading] = useState(false)
  const [busy, setBusy] = useState("")
  const [priceOpen, setPriceOpen] = useState(false)
  const [prices, setPrices] = useState<Prices>({ ...DEFAULT_PRICES })
  const [priceLoading, setPriceLoading] = useState(false)
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: Severity }>({ open: false, message: "", severity: "success" })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [dialog, setDialog] = useState({ open: false, title: "", message: "" })

  useEffect(() => { if (!isAdmin()) router.push("/admin/login") }, [router])
  const notify = useCallback((message: string, severity: Severity = "success") => setSnack({ open: true, message, severity }), [])
  const setAddField = (k: keyof FormValues, v: string | boolean) => setAdd(old => ({ ...old, [k]: v }))
  const setEditField = (k: keyof FormValues, v: string | boolean) => setEdit(old => ({ ...old, [k]: v }))

  async function saveNew() {
    if (!addType) return notify("Selecciona el tipo de contenido.", "warning")
    if (!add.nombre.trim() || !add.genero || !add.sinopsis.trim()) return notify("Nombre, género y sinopsis son obligatorios.", "warning")
    if (addType === "series" && !add.temporada.trim()) return notify("Indica la temporada de la serie.", "warning")
    setBusy("add")
    try { await axios.post(`/api/${addType}`, makePayload(add, addType)); setAdd({ ...EMPTY }); notify(`${singular(addType)} añadida correctamente.`) }
    catch (e: any) { notify(e?.response?.data?.message || "No se pudo guardar el contenido.", "error") }
    finally { setBusy("") }
  }

  async function selectContent(item: SearchSuggestion) {
    setEditLoading(true); setEditType(item.tipo); setEditId(String(item.id)); setEdit({ ...EMPTY })
    try {
      const { data } = await axios.get(`/api/${item.tipo}/${encodeURIComponent(String(item.id))}`)
      const record = (data?.contenido ?? data) as RecordContent
      setEdit(fromRecord(record)); notify(`${singular(item.tipo)} cargada para editar.`, "info")
    } catch (e: any) { setEditType(null); setEditId(""); notify(e?.response?.data?.message || "No se pudieron cargar los datos del contenido.", "error") }
    finally { setEditLoading(false) }
  }

  async function saveEdit() {
    if (!editType || !editId) return notify("Busca y selecciona un contenido primero.", "warning")
    if (!edit.nombre.trim() || !edit.genero || !edit.sinopsis.trim()) return notify("Nombre, género y sinopsis son obligatorios.", "warning")
    if (editType === "series" && !edit.temporada.trim()) return notify("Indica la temporada de la serie.", "warning")
    setBusy("edit")
    try { await axios.patch(`/api/${editType}/${encodeURIComponent(editId)}`, makePayload(edit, editType)); notify(`${singular(editType)} actualizada correctamente.`) }
    catch (e: any) { notify(e?.response?.data?.message || "No se pudo actualizar el contenido.", "error") }
    finally { setBusy("") }
  }

  function clearEdit() { setEditType(null); setEditId(""); setEdit({ ...EMPTY }) }
  async function deleteEdit() {
    if (!editType || !editId) return
    setBusy("delete")
    try { await axios.delete(`/api/${editType}/${encodeURIComponent(editId)}`); notify("Contenido eliminado correctamente."); clearEdit() }
    catch (e: any) { notify(e?.response?.data?.message || "No se pudo eliminar el contenido.", "error") }
    finally { setBusy(""); setConfirmDelete(false) }
  }

  async function openPrices() {
    setPriceOpen(true); setPriceLoading(true)
    try {
      const { data } = await axios.get("/api/precios")
      setPrices({ precioPeliculas: str(data?.precioPeliculas ?? 30), precioSeries: str(data?.precioSeries ?? 50), precioJuegos: str(data?.precioJuegos ?? 150) })
    } catch { notify("No se pudieron cargar los precios actuales.", "error") }
    finally { setPriceLoading(false) }
  }
  async function savePrices() {
    const values = [prices.precioPeliculas, prices.precioSeries, prices.precioJuegos]
    if (values.some(v => !v.trim() || !Number.isFinite(Number(v)) || Number(v) < 0)) return notify("Introduce precios válidos y no negativos.", "warning")
    setBusy("prices")
    try {
      await axios.patch("/api/precios", { precioPeliculas: Number(prices.precioPeliculas), precioSeries: Number(prices.precioSeries), precioJuegos: Number(prices.precioJuegos) })
      setPriceOpen(false); notify("Precios actualizados correctamente.")
    } catch (e: any) { notify(e?.response?.data?.message || "No se pudieron guardar los precios. Usa la ruta PATCH de precios incluida en el paquete.", "error") }
    finally { setBusy("") }
  }

  return <AdminMainLayout>
    <Box sx={{ minHeight: "calc(100vh - 100px)", color: "#f5f5f5", pb: 5 }}>
      <Paper elevation={0} sx={{ ...panel, px: { xs: 2, md: 3 }, py: 1.4, mb: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box><Typography variant="h6" sx={{ fontWeight: 700 }}>Panel de Administración</Typography><Typography variant="body2" sx={{ color: "#aaa" }}>Gestiona películas, series y juegos desde un solo lugar.</Typography></Box>
        <Button onClick={openPrices} startIcon={<PriceChangeOutlinedIcon />} variant="contained" sx={primary}>Editar precios</Button>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1fr) minmax(0,1fr)" }, gap: 2.5, alignItems: "stretch" }}>
        <Paper elevation={0} sx={{ ...panel, p: { xs: 1.5, md: 2 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mb: 2 }}>
            {([ ["peliculas", "Añadir película"], ["series", "Añadir serie"], ["juegos", "Añadir juego"] ] as [TipoContenido, string][]).map(([type, label]) => <Button key={type} fullWidth onClick={() => { setAddType(type); setAdd({ ...EMPTY }) }} variant={addType === type ? "contained" : "outlined"} sx={typeButton}>{label}</Button>)}
          </Stack>
          <Paper elevation={0} sx={{ ...formPanel, p: { xs: 1.5, md: 2.5 } }}>
            <SectionTitle icon={<MovieCreationOutlinedIcon />} title={`Añadir ${addType ? singular(addType) : "contenido"}`} checked={add.destacado} onChecked={v => setAddField("destacado", v)} />
            <ContentFields tipo={addType} values={add} onChange={setAddField} />
            <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.5} sx={{ mt: 2.5 }}>
              <Button fullWidth onClick={() => setAdd({ ...EMPTY })} startIcon={<RestartAltIcon />} sx={secondary}>Cancelar / Limpiar</Button>
              <Button fullWidth onClick={saveNew} disabled={busy === "add"} startIcon={busy === "add" ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />} variant="contained" sx={primary}>{busy === "add" ? "Guardando..." : "Guardar"}</Button>
            </Stack>
          </Paper>
        </Paper>

        <Paper elevation={0} sx={{ ...panel, p: { xs: 1.5, md: 2 } }}>
          <Box sx={{ mb: 2 }}><Typography sx={{ color: "#e5e5e5", fontSize: 13, mb: .8 }}>Buscar contenido para editar</Typography><SearchBar placeholder="Buscar contenido..." onSelect={selectContent} /></Box>
          <Paper elevation={0} sx={{ ...formPanel, p: { xs: 1.5, md: 2.5 }, minHeight: 420 }}>
            <SectionTitle icon={<EditOutlinedIcon />} title={editType ? `Editar ${singular(editType)}` : "Editar contenido"} checked={edit.destacado} disabled={!editType} onChecked={v => setEditField("destacado", v)} />
            {editLoading ? <Box sx={{ minHeight: 300, display: "grid", placeItems: "center" }}><CircularProgress sx={{ color: RED }} /></Box> : <>
              {!editType && <Alert severity="info" sx={{ mb: 2, bgcolor: "rgba(25,118,210,.12)", color: "#d9eaff", "& .MuiAlert-icon": { color: "#64b5f6" } }}>Busca un contenido y selecciona una sugerencia para cargarlo aquí.</Alert>}
              <ContentFields tipo={editType} values={edit} onChange={setEditField} disabled={!editType} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mt: 2.5 }}>
                <Button fullWidth onClick={clearEdit} startIcon={<RestartAltIcon />} sx={secondary}>Limpiar</Button>
                <Button fullWidth onClick={saveEdit} disabled={!editType || busy === "edit"} startIcon={busy === "edit" ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />} variant="contained" sx={primary}>{busy === "edit" ? "Guardando..." : "Editar"}</Button>
                <Button fullWidth onClick={() => setConfirmDelete(true)} disabled={!editType || busy === "delete"} startIcon={<DeleteOutlineIcon />} variant="contained" sx={{ ...primary, bgcolor: "#b5121b", "&:hover": { bgcolor: "#8e0d14" } }}>Eliminar</Button>
              </Stack>
            </>}
          </Paper>
        </Paper>
      </Box>

      <Dialog open={priceOpen} onClose={() => busy !== "prices" && setPriceOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: "#202020", color: "#fff", border: "1px solid #414141", borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 800 }}><Stack direction="row" spacing={1} alignItems="center"><PriceChangeOutlinedIcon sx={{ color: RED }} />Editar precios</Stack><IconButton onClick={() => setPriceOpen(false)} disabled={busy === "prices"} sx={{ color: "#ddd" }}><CloseIcon /></IconButton></DialogTitle>
        <DialogContent dividers sx={{ borderColor: "#3c3c3c" }}><Typography sx={{ color: "#aaa", mb: 2 }}>Actualiza el precio de cada tipo de contenido.</Typography>
          {priceLoading ? <Box sx={{ py: 5, display: "grid", placeItems: "center" }}><CircularProgress sx={{ color: RED }} /></Box> : <Stack spacing={2}>
            <TextField label="Precio de películas" type="number" value={prices.precioPeliculas} onChange={e => setPrices(p => ({ ...p, precioPeliculas: e.target.value }))} fullWidth sx={fieldSx} inputProps={{ min: 0, step: "any" }} />
            <TextField label="Precio de series" type="number" value={prices.precioSeries} onChange={e => setPrices(p => ({ ...p, precioSeries: e.target.value }))} fullWidth sx={fieldSx} inputProps={{ min: 0, step: "any" }} />
            <TextField label="Precio de juegos" type="number" value={prices.precioJuegos} onChange={e => setPrices(p => ({ ...p, precioJuegos: e.target.value }))} fullWidth sx={fieldSx} inputProps={{ min: 0, step: "any" }} />
          </Stack>}
        </DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={() => setPriceOpen(false)} sx={secondary}>Cancelar</Button><Button onClick={savePrices} disabled={priceLoading || busy === "prices"} variant="contained" sx={primary}>{busy === "prices" ? "Guardando..." : "Guardar precios"}</Button></DialogActions>
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} PaperProps={{ sx: { bgcolor: "#202020", color: "#fff", borderRadius: 3 } }}><DialogTitle>Eliminar contenido</DialogTitle><DialogContent>¿Seguro que deseas eliminar este contenido? Esta acción no se puede deshacer.</DialogContent><DialogActions sx={{ p: 2 }}><Button onClick={() => setConfirmDelete(false)} sx={secondary}>Cancelar</Button><Button onClick={deleteEdit} disabled={busy === "delete"} variant="contained" sx={{ ...primary, bgcolor: "#b5121b" }}>{busy === "delete" ? "Eliminando..." : "Eliminar"}</Button></DialogActions></Dialog>

      <Snackbar open={snack.open} autoHideDuration={4500} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}><Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity} variant="filled" sx={{ width: "100%" }}>{snack.message}</Alert></Snackbar>
      <ActionDialog open={dialog.open} title={dialog.title} message={dialog.message} onClose={() => setDialog(d => ({ ...d, open: false }))} />
    </Box>
  </AdminMainLayout>
}

function SectionTitle({ icon, title, checked, onChecked, disabled = false }: { icon: React.ReactNode; title: string; checked: boolean; onChecked: (value: boolean) => void; disabled?: boolean }) {
  return <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1} sx={{ mb: 2.5 }}>
    <Stack direction="row" alignItems="center" spacing={1.2}><Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: "#fff", color: "#222", display: "grid", placeItems: "center" }}>{icon}</Box><Typography sx={{ fontWeight: 800, fontSize: 18 }}>{title}</Typography></Stack>
    <FormControlLabel sx={{ m: 0, color: disabled ? "#777" : RED, "& .MuiFormControlLabel-label": { fontSize: 14, whiteSpace: "nowrap" } }} control={<Checkbox checked={checked} disabled={disabled} onChange={e => onChecked(e.target.checked)} sx={{ color: "#bbb", "&.Mui-checked": { color: RED } }} />} label="Contenido destacado" />
  </Stack>
}

function ContentFields({ tipo, values, onChange, disabled = false }: { tipo: TipoFormulario | TipoContenido | null; values: FormValues; onChange: (key: keyof FormValues, value: string | boolean) => void; disabled?: boolean }) {
  const game = tipo === "juegos", series = tipo === "series"
  const common = { fullWidth: true, size: "small" as const, sx: fieldSx, disabled }
  return <Stack spacing={2}>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
      <TextField {...common} label="Nombre" value={values.nombre} onChange={e => onChange("nombre", e.target.value)} />
      <TextField {...common} select label="Género" value={values.genero} onChange={e => onChange("genero", e.target.value)}><MenuItem value="">Seleccionar género</MenuItem>{GENRES.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}</TextField>
    </Box>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,minmax(0,1fr))" }, gap: 1.5 }}>
      <TextField {...common} label={game ? "Rating Steam" : "IMDb"} type="number" value={game ? values.ratingSteam : values.imdbRating} onChange={e => onChange(game ? "ratingSteam" : "imdbRating", e.target.value)} />
      <TextField {...common} label="Peso (GB)" type="number" value={values.pesoGB} onChange={e => onChange("pesoGB", e.target.value)} />
      <TextField {...common} label="Año" type="number" value={values.year} onChange={e => onChange("year", e.target.value)} />
      {series && <TextField {...common} label="Temporada" type="number" value={values.temporada} onChange={e => onChange("temporada", e.target.value)} />}
    </Box>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}><TextField {...common} label="Poster URL" value={values.poster} onChange={e => onChange("poster", e.target.value)} /><TextField {...common} label="Banner URL" value={values.banner} onChange={e => onChange("banner", e.target.value)} /></Box>
    <TextField {...common} label="Sinopsis" multiline minRows={3} value={values.sinopsis} onChange={e => onChange("sinopsis", e.target.value)} />
  </Stack>
}
