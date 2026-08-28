import { Schema, models, model } from "mongoose"

const PeliculaSchema = new Schema({
  nombre: String,
  genero: String,
  sinopsis: String,
  imdbRating: Number,
  pesoGB: Number,
  poster: String,
  banner: String,
  year: Number,
  destacado: { type: Boolean, default: false },
  fechaAgregado: { type: Date, default: Date.now },
})

export const Pelicula = models.Pelicula || model("Pelicula", PeliculaSchema)
