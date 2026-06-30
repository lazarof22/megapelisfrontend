"use client"

import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import Badge from "@mui/material/Badge"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import Typography from "@mui/material/Typography"
import { useCart } from "@/context/CartContext"
import { useRouter } from "next/navigation"
import MenuIcon from '@mui/icons-material/Menu';
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"

type AppBarMainProps = {
  onMenuClick: () => void  // ← Nueva prop
}

export default function AppBarMain({ onMenuClick }: AppBarMainProps) {

  const { items } = useCart()
  const router = useRouter()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.up("md")) // < 900px

  return (
    <AppBar position="fixed" sx={{ paddingLeft: { xs: 0, md: 1 }, }} color="primary" elevation={0}>
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },  // Altura estándar móvil
          px: { xs: 1, sm: 2 }  // Menos padding en móvil
        }}
      >
        {isMobile && (
          <IconButton onClick={onMenuClick} edge="start" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },  // Logo más pequeño en móvil
            fontWeight: 'bold',
            letterSpacing: { xs: -0.5, sm: 0 }
          }}
        >
          MegapelisTV
        </Typography>

        <IconButton
          color="inherit"
          onClick={() => router.push("/pedido")}
        >
          <Badge badgeContent={items.length} color="primary">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>

      </Toolbar>
    </AppBar>
  )
}