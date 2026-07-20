import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// POST /api/telegram/pedido — envía el pedido al bot de Telegram
export async function POST(req: NextRequest) {
  try {
    const { mensaje } = await req.json()

    const BOT_TOKEN = process.env.TELEGRAM_TOKEN
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: mensaje,
        parse_mode: "Markdown",
      }),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "Error enviando mensaje" }, { status: 500 })
  }
}
