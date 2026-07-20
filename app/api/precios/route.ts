import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Precio } from "@/lib/models/Precio"

export const dynamic = "force-dynamic"

// GET /api/precios — obtiene el documento de precios (lo crea con valores por defecto si no existe)
export async function GET() {
  try {
    await connectDB()
    let precios = await Precio.findOne()
    if (!precios) {
      precios = await Precio.create({
        precioPeliculas: 30,
        precioSeries: 50,
        precioJuegos: 150,
      })
    }
    return NextResponse.json(precios)
  } catch {
    return NextResponse.json({ message: "Error obteniendo precios" }, { status: 500 })
  }
}

// POST /api/precios
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const precio = await Precio.create(body)
    return NextResponse.json(precio, { status: 201 })
  } catch {
    return NextResponse.json({ message: "Error creando precios" }, { status: 500 })
  }
}
