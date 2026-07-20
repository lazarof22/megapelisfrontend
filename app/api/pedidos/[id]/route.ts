import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { Pedido } from "@/lib/models/Pedido"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

// GET /api/pedidos/:id
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB()
    const { id } = await params
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "ID no válido" }, { status: 400 })
    }
    const pedido = await Pedido.findById(id)
    if (!pedido) {
      return NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 })
    }
    return NextResponse.json(pedido)
  } catch {
    return NextResponse.json({ message: "Error obteniendo pedido" }, { status: 500 })
  }
}

// DELETE /api/pedidos/:id
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB()
    const { id } = await params
    const pedido = await Pedido.findByIdAndDelete(id)
    if (!pedido) {
      return NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 })
    }
    return NextResponse.json(pedido)
  } catch {
    return NextResponse.json({ message: "Error eliminando pedido" }, { status: 500 })
  }
}
