"use client"

import DrawerMenu from "@/components/DrawerMenu"
import AppBarMain from "@/components/AppMainBar"
import Box from "@mui/material/Box"
import { useState } from "react"

export default function MainLayout({ children }: any) {

  // ← ESTADO para controlar el drawer
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleDrawerOpen = () => setDrawerOpen(true)
  const handleDrawerClose = () => setDrawerOpen(false)

  return (

    <Box display="flex" flexDirection="column" minHeight="100vh">

      <DrawerMenu
        open={drawerOpen}
        onClose={handleDrawerClose}
      />

      <Box flex={1} display="flex" flexDirection="column">

        <AppBarMain onMenuClick={handleDrawerOpen} />

        <Box component="main"
          mt={{ xs: 7, sm: 8, md: 10 }}  // Menos margen top en móvil
          p={{ xs: 1, sm: 2, md: 4 }}    // Padding reducido en móvil
          pb={{ xs: 8, md: 4 }}          // Padding bottom para nav móvil
          flex={1}>
          {children}
        </Box>

      </Box>

    </Box>

  )
}