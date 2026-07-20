import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Serie } from "@/lib/models/Serie"

export const dynamic = "force-dynamic"

// GET /api/series
export async function GET() {
  try {
    await connectDB()
    const series = await Serie.find().sort({ fechaAgregado: -1 })
    return NextResponse.json(series)
  } catch {
    return NextResponse.json({ message: "Error obteniendo series" }, { status: 500 })
  }
}

// POST /api/series
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const serie = await Serie.create(body)
    return NextResponse.json(serie, { status: 201 })
  } catch {
    return NextResponse.json({ message: "Error creando serie" }, { status: 500 })
  }
}
