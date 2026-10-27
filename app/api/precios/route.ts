import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Precio } from "@/lib/models/Precio"

export const dynamic = "force-dynamic"
const DEFAULTS = { precioPeliculas: 30, precioSeries: 50, precioJuegos: 150 }

export async function GET() {
  try {
    await connectDB()
    let precios = await Precio.findOne().sort({ _id: 1 })
    if (!precios) precios = await Precio.create(DEFAULTS)
    return NextResponse.json(precios)
  } catch {
    return NextResponse.json({ message: "Error obteniendo precios" }, { status: 500 })
  }
}

// POST mantiene compatibilidad con clientes anteriores y actualiza un único documento.
export async function POST(req: NextRequest) { return savePrices(req) }
export async function PATCH(req: NextRequest) { return savePrices(req) }

async function savePrices(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const payload = {
      precioPeliculas: Number(body.precioPeliculas),
      precioSeries: Number(body.precioSeries),
      precioJuegos: Number(body.precioJuegos),
    }
    if (Object.values(payload).some(value => !Number.isFinite(value) || value < 0)) {
      return NextResponse.json({ message: "Los precios deben ser números válidos no negativos." }, { status: 400 })
    }
    const existing = await Precio.findOne().sort({ _id: 1 })
    const precios = existing
      ? await Precio.findByIdAndUpdate(existing._id, payload, { new: true })
      : await Precio.create(payload)
    return NextResponse.json(precios)
  } catch {
    return NextResponse.json({ message: "Error guardando precios" }, { status: 500 })
  }
}
