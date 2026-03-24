"use client";

import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import MovieIcon from "@mui/icons-material/Movie";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import TvIcon from "@mui/icons-material/Tv";
import SettingsIcon from "@mui/icons-material/Settings"
import { useRouter } from "next/navigation"

const drawerWidth = 80;

export default function DrawerMenu() {
  const router = useRouter()
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          backgroundColor: "#000",
          alignItems: "center",
          pt: 2
        }
      }}
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <IconButton onClick={() => router.push("/")}>
          <HomeIcon />
        </IconButton>

        <IconButton onClick={() => router.push("/peliculas")}>
          <MovieIcon/>
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

      </Box>
    </Drawer>
  );
}