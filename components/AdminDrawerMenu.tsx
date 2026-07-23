"use client";

import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import { useRouter } from "next/navigation"
import VideoCallIcon from '@mui/icons-material/VideoCall';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const drawerWidth = 80;

export default function AdminDrawerMenu() {
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
        <IconButton>
          <HomeIcon onClick={() => router.push("/")}/>
        </IconButton>

        <IconButton onClick={() => router.push("/admin")}>
          <VideoCallIcon />
        </IconButton>

        <IconButton onClick={() => router.push("/admin/edit")}>
          <EditDocumentIcon />
        </IconButton>

        <IconButton onClick={() => router.push("/admin/editPrecios")}>
          <AttachMoneyIcon />
        </IconButton>

      </Box>
    </Drawer>
  );
}