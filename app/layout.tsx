"use client"

import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import theme from "@/theme/theme"
import { CartProvider } from "@/context/CartContext"

export default function RootLayout({children}:any){

 return(
  <html>
   <body>

    <ThemeProvider theme={theme}>
     <CssBaseline/>

      <CartProvider>
        {children}
      </CartProvider>

    </ThemeProvider>

   </body>
  </html>
 )
}