import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Pelicula } from "@/lib/models/Pelicula"

export const dynamic = "force-dynamic"

// GET /api/peliculas — catálogo público completo
export async function GET() {
  try {
    await connectDB()
    const peliculas = await Pelicula.find().sort({ year: -1 })
    return NextResponse.json(peliculas)
  } catch {
    return NextResponse.json({ message: "Error obteniendo películas" }, { status: 500 })
  }
}

// POST /api/peliculas — crear película (panel admin)
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const pelicula = await Pelicula.create(body)
    return NextResponse.json(pelicula, { status: 201 })
  } catch {
    return NextResponse.json({ message: "Error creando película" }, { status: 500 })
  }
}
