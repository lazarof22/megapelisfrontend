import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Juego } from "@/lib/models/Juego"

export const dynamic = "force-dynamic"

// GET /api/juegos
export async function GET() {
  try {
    await connectDB()
    const juegos = await Juego.find().sort({ fechaAgregado: -1 })
    return NextResponse.json(juegos)
  } catch {
    return NextResponse.json({ message: "Error obteniendo juegos" }, { status: 500 })
  }
}

// POST /api/juegos
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const juego = await Juego.create(body)
    return NextResponse.json(juego, { status: 201 })
  } catch {
    return NextResponse.json({ message: "Error creando juego" }, { status: 500 })
  }
}
