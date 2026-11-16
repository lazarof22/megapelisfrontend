"use client";

import type { ElementType } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ButtonBase from "@mui/material/ButtonBase";
import HomeIcon from "@mui/icons-material/Home";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MovieIcon from "@mui/icons-material/Movie";
import MovieOutlinedIcon from "@mui/icons-material/MovieOutlined";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import TvIcon from "@mui/icons-material/Tv";
import TvOutlinedIcon from "@mui/icons-material/TvOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from "@mui/material/useMediaQuery";

const drawerWidth = 80;

// 🎨 Barra móvil (colores medidos de la foto de referencia)
const PILL_BG = "#8a0517";   // rojo de la píldora
const PILL_TILE = "#D21B34"; // pestaña activa (un tono más claro que la barra)

type NavItem = {
  label: string
  path: string            // ruta a la que navega
  match: string           // prefijo para saber si la pestaña está activa
  icon: ElementType       // ícono inactivo (contorno)
  activeIcon: ElementType // ícono activo (relleno)
}

const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", path: "/", match: "/", icon: HomeOutlinedIcon, activeIcon: HomeIcon },
  { label: "Películas", path: "/peliculas", match: "/peliculas", icon: MovieOutlinedIcon, activeIcon: MovieIcon },
  { label: "Series", path: "/series", match: "/series", icon: TvOutlinedIcon, activeIcon: TvIcon },
  { label: "Juegos", path: "/juegos", match: "/juegos", icon: SportsEsportsOutlinedIcon, activeIcon: SportsEsportsIcon },
  { label: "Admin", path: "/admin/login", match: "/admin", icon: SettingsOutlinedIcon, activeIcon: SettingsIcon }
];

type DrawerMenuProps = {
  open: boolean
  onClose: () => void
}

// 📱 Barra inferior estilo píldora: círculo blanco + pestañas con ícono y texto
function MobileNavBar() {
  const router = useRouter();
  const pathname = usePathname() ?? "";

  const isActive = (item: NavItem) =>
    item.match === "/" ? pathname === "/" : pathname.startsWith(item.match);

  return (
    <Box
      component="nav"
      aria-label="Navegación principal"
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        mx: "auto",
        bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        width: "calc(100% - 24px)",
        maxWidth: 420,
        display: { xs: "flex", md: "none" },
        alignItems: "center",
        gap: "10px",
        py: 1,
        pl: "14px",
        pr: "10px",
        borderRadius: 4,
        bgcolor: PILL_BG,
        boxShadow: "0 10px 28px rgba(0,0,0,0.45), 0 6px 18px rgba(203,20,45,0.30)",
        zIndex: 999
      }}
    >
      {/* Círculo blanco con el logo */}
      <ButtonBase
        onClick={() => router.push("/")}
        aria-label="Ir al inicio"
        sx={{
          flex: "none",
          width: 48,
          height: 48,
          borderRadius: "50%",
          bgcolor: "#fff",
          color: PILL_BG,
          boxShadow: "0 2px 10px rgba(0,0,0,0.18)"
        }}
      >
        {/* 🔴 Cambia este ícono por el logo de tu app */}
        <PlayArrowRoundedIcon sx={{ fontSize: 32 }} />
      </ButtonBase>

      {/* Pestañas */}
      <Box sx={{ flex: 1, minWidth: 0, display: "flex" }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = active ? item.activeIcon : item.icon;

          return (
            <ButtonBase
              key={item.path}
              onClick={() => router.push(item.path)}
              aria-current={active ? "page" : undefined}
              sx={{
                flex: 1,
                minWidth: 0,
                height: 48,
                position: "relative",
                flexDirection: "column",
                justifyContent: "flex-start",
                gap: "2px",
                pt: "7px",
                borderRadius: "15px",
                color: "#fff",
                bgcolor: active ? PILL_TILE : "transparent",
                transition: "background-color .25s ease"
              }}
            >
              <Icon sx={{ fontSize: 22 }} />

              <Box
                component="span"
                sx={{
                  fontSize: 10.5,
                  lineHeight: "12px",
                  fontWeight: active ? 600 : 500,
                  whiteSpace: "nowrap"
                }}
              >
                {item.label}
              </Box>

              {/* Punto indicador de la pestaña activa */}
              <Box
                component="span"
                sx={{
                  position: "absolute",
                  bottom: "5px",
                  left: "calc(50% - 2px)",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  bgcolor: "#fff",
                  opacity: active ? 1 : 0,
                  transform: active ? "scale(1)" : "scale(0)",
                  transition: "opacity .25s ease, transform .25s ease"
                }}
              />
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
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

  // 📱 MOBILE → barra inferior estilo píldora (diseño de la foto)
  if (isMobile) {
    return <MobileNavBar />;
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