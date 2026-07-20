import { Schema, models, model } from "mongoose"

const SerieSchema = new Schema({
  nombre: String,
  genero: String,
  sinopsis: String,
  imdbRating: Number,
  pesoGB: Number,
  poster: String,
  banner: String,
  year: Number,
  temporada: Number,
  destacado: { type: Boolean, default: false },
  popularidad: { type: Number, default: 0 },
  fechaAgregado: { type: Date, default: Date.now },
})

export const Serie = models.Serie || model("Serie", SerieSchema)
