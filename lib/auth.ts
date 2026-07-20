import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

// Mismo secret por defecto que usaba el backend de NestJS
// (en producción define JWT_SECRET en las variables de entorno de Vercel)
const JWT_SECRET = process.env.JWT_SECRET || "megapelis-secret"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
// Igual que en el backend NestJS: el hash se genera al arrancar
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "megapelis123", 10)

export function validateUser(username: string, password: string) {
  if (username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    return { username }
  }
  return null
}

export function signToken(user: { username: string }) {
  return jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1d" })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}
