import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { Juego } from "@/lib/models/Juego"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

// GET /api/juegos/:id
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB()
    const { id } = await params
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "ID no válido" }, { status: 400 })
    }
    const juego = await Juego.findById(id)
    if (!juego) {
      return NextResponse.json({ message: "El juego no ha sido encontrado" }, { status: 404 })
    }
    return NextResponse.json(juego)
  } catch {
    return NextResponse.json({ message: "Error obteniendo juego" }, { status: 500 })
  }
}

// PATCH /api/juegos/:id
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const juego = await Juego.findByIdAndUpdate(id, body, { new: true })
    if (!juego) {
      return NextResponse.json({ message: "El juego no ha sido encontrado" }, { status: 404 })
    }
    return NextResponse.json(juego)
  } catch {
    return NextResponse.json({ message: "Error actualizando juego" }, { status: 500 })
  }
}

// DELETE /api/juegos/:id
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB()
    const { id } = await params
    const juego = await Juego.findByIdAndDelete(id)
    if (!juego) {
      return NextResponse.json({ message: "El juego no ha sido encontrado" }, { status: 404 })
    }
    return NextResponse.json({ message: "Juego eliminado correctamente" })
  } catch {
    return NextResponse.json({ message: "Error eliminando juego" }, { status: 500 })
  }
}
