import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Pelicula } from "@/lib/models/Pelicula"
import { Serie } from "@/lib/models/Serie"
import { Juego } from "@/lib/models/Juego"

// -----------------------------------------------------------------------
// GET /api/search/suggestions?q=texto
//
// Busca únicamente por el campo "nombre" en las 3 colecciones
// (Peliculas, Series, Juegos) y devuelve un resultado unificado
// que coincide con el tipo SearchSuggestion del componente SearchBar.
// -----------------------------------------------------------------------

const RESULTS_PER_TYPE = 5

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") ?? "").trim()

    if (!q) {
      return NextResponse.json({ results: [] })
    }

    await connectDB()

    // Regex case-insensitive, escapando caracteres especiales del input
    const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const nameRegex = new RegExp(safeQuery, "i")

    const [peliculas, series, juegos] = await Promise.all([
      Pelicula.find({ nombre: nameRegex })
        .sort({ popularidad: -1 })
        .limit(RESULTS_PER_TYPE)
        .select("nombre year poster")
        .lean(),
      Serie.find({ nombre: nameRegex })
        .sort({ popularidad: -1 })
        .limit(RESULTS_PER_TYPE)
        .select("nombre year poster")
        .lean(),
      Juego.find({ nombre: nameRegex })
        .sort({ popularidad: -1 })
        .limit(RESULTS_PER_TYPE)
        .select("nombre year poster")
        .lean(),
    ])

    const results = [
      ...peliculas.map((item: any) => ({
        id: item._id.toString(),
        title: item.nombre,
        tipo: "peliculas" as const,
        year: item.year,
        imagen: item.poster,
      })),
      ...series.map((item: any) => ({
        id: item._id.toString(),
        title: item.nombre,
        tipo: "series" as const,
        year: item.year,
        imagen: item.poster,
      })),
      ...juegos.map((item: any) => ({
        id: item._id.toString(),
        title: item.nombre,
        tipo: "juegos" as const,
        year: item.year,
        imagen: item.poster,
      })),
    ]

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error en /api/search/suggestions:", error)
    return NextResponse.json(
      { results: [], error: "Error al buscar" },
      { status: 500 }
    )
  }
}