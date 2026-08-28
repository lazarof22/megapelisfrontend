import { Schema, models, model } from "mongoose"

const JuegoSchema = new Schema({
  nombre: String,
  genero: String,
  sinopsis: String,
  ratingSteam: Number,
  pesoGB: Number,
  precio: Number,
  poster: String,
  banner: String,
  year: Number,
  destacado: { type: Boolean, default: false },
  fechaAgregado: { type: Date, default: Date.now },
})

export const Juego = models.Juego || model("Juego", JuegoSchema)
