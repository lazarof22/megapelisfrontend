import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { Serie } from "@/lib/models/Serie"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

// GET /api/series/:id
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB()
    const { id } = await params
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "ID no válido" }, { status: 400 })
    }
    const serie = await Serie.findById(id)
    if (!serie) {
      return NextResponse.json({ message: "Serie no encontrada" }, { status: 404 })
    }
    return NextResponse.json(serie)
  } catch {
    return NextResponse.json({ message: "Error obteniendo serie" }, { status: 500 })
  }
}

// PATCH /api/series/:id
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const serie = await Serie.findByIdAndUpdate(id, body, { new: true })
    if (!serie) {
      return NextResponse.json({ message: "Serie no encontrada" }, { status: 404 })
    }
    return NextResponse.json(serie)
  } catch {
    return NextResponse.json({ message: "Error actualizando serie" }, { status: 500 })
  }
}

// DELETE /api/series/:id
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB()
    const { id } = await params
    const serie = await Serie.findByIdAndDelete(id)
    if (!serie) {
      return NextResponse.json({ message: "Serie no encontrada" }, { status: 404 })
    }
    return NextResponse.json({ message: "Serie eliminada correctamente" })
  } catch {
    return NextResponse.json({ message: "Error eliminando serie" }, { status: 500 })
  }
}
