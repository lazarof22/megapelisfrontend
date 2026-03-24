"use client"

import DrawerMenu from "@/components/DrawerMenu"
import AppBarMain from "@/components/AppMainBar"
import Box from "@mui/material/Box"

export default function MainLayout({children}:any){

 return(

  <Box display="flex">

   <DrawerMenu/>

   <Box flex={1}>

     <AppBarMain/>

     <Box mt={10} p={4}>
       {children}
     </Box>

   </Box>

  </Box>

 )
}