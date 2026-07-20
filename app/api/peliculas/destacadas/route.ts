import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Pelicula } from "@/lib/models/Pelicula"

export const dynamic = "force-dynamic"

// GET /api/peliculas/destacadas
export async function GET() {
  try {
    await connectDB()
    const peliculas = await Pelicula.find({ destacado: true }).limit(10)
    return NextResponse.json(peliculas)
  } catch {
    return NextResponse.json({ message: "Error obteniendo destacadas" }, { status: 500 })
  }
}
