import { Schema, models, model } from "mongoose"

const PrecioSchema = new Schema({
  precioPeliculas: Number,
  precioSeries: Number,
  precioJuegos: Number,
})

export const Precio = models.Precio || model("Precio", PrecioSchema)
