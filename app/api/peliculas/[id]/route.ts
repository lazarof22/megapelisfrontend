import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { Pelicula } from "@/lib/models/Pelicula"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

// GET /api/peliculas/:id
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB()
    const { id } = await params
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "ID no válido" }, { status: 400 })
    }
    const pelicula = await Pelicula.findById(id)
    if (!pelicula) {
      return NextResponse.json({ message: "Película no encontrada" }, { status: 404 })
    }
    return NextResponse.json(pelicula)
  } catch {
    return NextResponse.json({ message: "Error obteniendo película" }, { status: 500 })
  }
}

// PATCH /api/peliculas/:id
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const pelicula = await Pelicula.findByIdAndUpdate(id, body, { new: true })
    if (!pelicula) {
      return NextResponse.json({ message: "Película no encontrada" }, { status: 404 })
    }
    return NextResponse.json(pelicula)
  } catch {
    return NextResponse.json({ message: "Error actualizando película" }, { status: 500 })
  }
}

// DELETE /api/peliculas/:id
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB()
    const { id } = await params
    const pelicula = await Pelicula.findByIdAndDelete(id)
    if (!pelicula) {
      return NextResponse.json({ message: "Película no encontrada" }, { status: 404 })
    }
    return NextResponse.json(pelicula)
  } catch {
    return NextResponse.json({ message: "Error eliminando película" }, { status: 500 })
  }
}
