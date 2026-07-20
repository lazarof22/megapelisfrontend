import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Pelicula } from "@/lib/models/Pelicula"

export const dynamic = "force-dynamic"

// GET /api/peliculas/genero/:genero
export async function GET(_req: NextRequest, { params }: { params: Promise<{ genero: string }> }) {
  try {
    await connectDB()
    const { genero } = await params
    const peliculas = await Pelicula.find({ genero: decodeURIComponent(genero) })
    return NextResponse.json(peliculas)
  } catch {
    return NextResponse.json({ message: "Error obteniendo películas por género" }, { status: 500 })
  }
}
