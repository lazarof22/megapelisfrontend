import { NextRequest, NextResponse } from "next/server"
import { validateUser, signToken } from "@/lib/auth"

export const dynamic = "force-dynamic"

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user = validateUser(body.username, body.password)

    if (!user) {
      return NextResponse.json({ error: "Credenciales incorrectas" })
    }

    return NextResponse.json({ access_token: signToken(user) })
  } catch {
    return NextResponse.json({ message: "Error en el login" }, { status: 500 })
  }
}
