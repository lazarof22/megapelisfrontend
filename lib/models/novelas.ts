import { Schema, models, model } from "mongoose"

const NovelasSchema = new Schema({
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

export const Novelas = models.Novelas || model("Novelas", NovelasSchema)