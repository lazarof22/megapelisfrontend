import { Schema, models, model } from "mongoose"

const PedidoSchema = new Schema({
  nombreCliente: { type: String, required: true },
  telefono: { type: String, required: true },
  contenidos: { type: Array, required: true },
  precioTotal: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
})

export const Pedido = models.Pedido || model("Pedido", PedidoSchema)
