import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Pedido } from "@/lib/models/Pedido"
import { Pelicula } from "@/lib/models/Pelicula"

export const dynamic = "force-dynamic"

// GET /api/pedidos
export async function GET() {
  try {
    await connectDB()
    const pedidos = await Pedido.find().sort({ fecha: -1 })
    return NextResponse.json(pedidos)
  } catch {
    return NextResponse.json({ message: "Error obteniendo pedidos" }, { status: 500 })
  }
}

// POST /api/pedidos
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const pedido = await Pedido.create(body)

    // Igual que en el backend NestJS: cada película pedida sube su popularidad
    for (const item of body.items || []) {
      if (item.tipo === "pelicula") {
        await Pelicula.findByIdAndUpdate(item.id, { $inc: { popularidad: 1 } }, { new: true })
      }
    }

    return NextResponse.json(pedido, { status: 201 })
  } catch {
    return NextResponse.json({ message: "Error creando pedido" }, { status: 500 })
  }
}
