import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Pelicula } from "@/lib/models/Pelicula"

export const dynamic = "force-dynamic"

// GET /api/peliculas/tendencias
export async function GET() {
  try {
    await connectDB()
    const peliculas = await Pelicula.find().sort({ popularidad: -1 }).limit(10)
    return NextResponse.json(peliculas)
  } catch {
    return NextResponse.json({ message: "Error obteniendo tendencias" }, { status: 500 })
  }
}
