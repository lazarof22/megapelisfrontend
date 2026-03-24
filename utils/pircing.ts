export function calcularPrecio(item:any){

 if(item.tipo==="pelicula"){
   return 30
 }

 if(item.tipo==="serie"){
   return item.temporadas.length * 50
 }

 if(item.tipo==="juego"){

   if(item.peso>50){
     return 200
   }

   return 150
 }

 return 0
}

export function totalPedido(items:any[]){

 return items.reduce((acc,item)=>{
   return acc + calcularPrecio(item)
 },0)

}