"use client"

import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import Badge from "@mui/material/Badge"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import Typography from "@mui/material/Typography"
import { useCart } from "@/context/CartContext"
import { useRouter } from "next/navigation"

export default function AppBarMain(){

 const {items} = useCart()
 const router = useRouter()

 return(
  <AppBar position="fixed" sx={{paddingLeft:10}} color="primary" elevation={0}>
   <Toolbar>

    <Typography variant="h6" sx={{flexGrow:1}}>
      MegapelisTV
    </Typography>

    <IconButton
      color="inherit"
      onClick={()=>router.push("/pedido")}
    >
      <Badge badgeContent={items.length} color="primary">
        <ShoppingCartIcon/>
      </Badge>
    </IconButton>

   </Toolbar>
  </AppBar>
 )
}