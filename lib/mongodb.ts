import mongoose from "mongoose"

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/megapelistv"

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// En desarrollo (hot reload) y en serverless se reutiliza la conexión
// cacheándola en una variable global para no abrir conexiones nuevas en cada request
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null }

if (!global._mongooseCache) {
  global._mongooseCache = cached
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, { bufferCommands: false })
  }

  cached.conn = await cached.promise
  return cached.conn
}
