import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Precio } from "@/lib/models/Precio"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

// PATCH /api/precios/:id
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const precio = await Precio.findByIdAndUpdate(id, body, { new: true })
    if (!precio) {
      return NextResponse.json({ message: "Precio no encontrado" }, { status: 404 })
    }
    return NextResponse.json(precio)
  } catch {
    return NextResponse.json({ message: "Error actualizando precio" }, { status: 500 })
  }
}

// DELETE /api/precios/:id
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB()
    const { id } = await params
    const precio = await Precio.findByIdAndDelete(id)
    if (!precio) {
      return NextResponse.json({ message: "Precio no encontrado" }, { status: 404 })
    }
    return NextResponse.json({ message: "Precio eliminado" })
  } catch {
    return NextResponse.json({ message: "Error eliminando precio" }, { status: 500 })
  }
}
