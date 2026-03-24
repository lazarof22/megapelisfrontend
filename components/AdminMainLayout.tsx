"use client"

import AdminDrawerMenu from "@/components/AdminDrawerMenu"
import AdminAppBarMain from "@/components/AdminAppMainBar"
import Box from "@mui/material/Box"

export default function MainLayout({children}:any){

 return(

  <Box display="flex">

   <AdminDrawerMenu/>

   <Box flex={1}>

     <AdminAppBarMain/>

     <Box mt={10} p={4}>
       {children}
     </Box>

   </Box>

  </Box>

 )
}