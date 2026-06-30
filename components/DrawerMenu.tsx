"use client";

import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import MovieIcon from "@mui/icons-material/Movie";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import TvIcon from "@mui/icons-material/Tv";
import SettingsIcon from "@mui/icons-material/Settings";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from "@mui/material/useMediaQuery";

const drawerWidth = 80;

type DrawerMenuProps = {
  open: boolean
  onClose: () => void
}

export default function DrawerMenu({ open, onClose }: DrawerMenuProps) {
  const router = useRouter();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); //detecta móvil
  const isMobile2 = useMediaQuery(theme.breakpoints.up("md"));

  const MenuItems = () => (
    <>
      {isMobile2 && (
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      )}

      <IconButton onClick={() => router.push("/")}>
        <HomeIcon />
      </IconButton>

      <IconButton onClick={() => router.push("/peliculas")}>
        <MovieIcon />
      </IconButton>

      <IconButton onClick={() => router.push("/series")}>
        <TvIcon />
      </IconButton>

      <IconButton onClick={() => router.push("/juegos")}>
        <SportsEsportsIcon />
      </IconButton>

      <IconButton onClick={() => router.push("/admin/login")}>
        <SettingsIcon />
      </IconButton>
    </>
  );

  // 📱 MOBILE → barra inferior
  if (isMobile) {
    return (
      <Box
        sx={{
          position: "fixed",
          bottom: 10,
          right: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: 400,
          background: "rgba(20,20,20,0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: 5,
          display: { xs: 'flex', md: 'none' },
          justifyContent: "space-around",
          alignItems: "center",
          py: 1,
          zIndex: 999,
          boxShadow: "0 0 20px rgba(0,0,0,0.5)"
        }}
      >
        <MenuItems />
      </Box>
    );
  }

  // 💻 DESKTOP → drawer lateral
  return (
    <Drawer
      variant="temporary"  // ← Cambiado de permanent a temporary
      open={open}          // ← Controlado por estado
      onClose={onClose}    // ← Cierra al hacer click fuera
      ModalProps={{
        keepMounted: true, // ← Mejor rendimiento en móvil
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          background: "#000",
          alignItems: "center",
          pt: 2,
          boxSizing: "border-box",
        }
      }}
    >
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <MenuItems />
      </Box>
    </Drawer>
  );
}