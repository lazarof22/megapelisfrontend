import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Pelicula } from "@/lib/models/Pelicula"

export const dynamic = "force-dynamic"

// GET /api/peliculas/nuevas
export async function GET() {
  try {
    await connectDB()
    const peliculas = await Pelicula.find().sort({ fechaAgregado: -1 }).limit(10)
    return NextResponse.json(peliculas)
  } catch {
    return NextResponse.json({ message: "Error obteniendo películas nuevas" }, { status: 500 })
  }
}
