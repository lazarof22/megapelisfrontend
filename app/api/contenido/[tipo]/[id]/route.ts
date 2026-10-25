import { NextRequest, NextResponse } from "next/server"
import { isValidObjectId } from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { Pelicula } from "@/lib/models/Pelicula"
import { Serie } from "@/lib/models/Serie"
import { Juego } from "@/lib/models/Juego"

export const dynamic = "force-dynamic"

type Tipo = "peliculas" | "series" | "juegos"

const MODELOS = {
  peliculas: Pelicula,
  series: Serie,
  juegos: Juego,
} as const

// GET /api/contenido/:tipo/:id
// Ruta reutilizable para recuperar un documento completo de cualquiera de las colecciones.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tipo: string; id: string }> },
) {
  try {
    const { tipo, id } = await params

    if (!Object.prototype.hasOwnProperty.call(MODELOS, tipo)) {
      return NextResponse.json({ message: "Tipo de contenido no válido." }, { status: 400 })
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Identificador de contenido no válido." }, { status: 400 })
    }

    await connectDB()
    const modelo = MODELOS[tipo as Tipo]
    const contenido = await modelo.findById(id).lean()

    if (!contenido) {
      return NextResponse.json({ message: "No se encontró el contenido solicitado." }, { status: 404 })
    }

    return NextResponse.json({ contenido })
  } catch (error) {
    console.error("Error GET /api/contenido/[tipo]/[id]:", error)
    return NextResponse.json({ message: "Error obteniendo el contenido." }, { status: 500 })
  }
}
