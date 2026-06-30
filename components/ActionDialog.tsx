"use client"

import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  Box
} from "@mui/material"

import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"

type DialogType = "success" | "warning" | "error" | "info"

interface Props {
  open: boolean
  title: string
  message: string
  type?: DialogType
  onClose: () => void
}

export default function ActionDialog({
  open,
  title,
  message,
  type,
  onClose
}: Props) {

  const isSuccess = type === "success"
  const isError = type === "error"

  const bgColor = isSuccess ? "#0f5132" : isError ? "#58151c" : "#1e1e1e"
  const cardColor = isSuccess ? "#198754" : isError ? "#dc3545" : "#333"

  const Icon = isSuccess ? CheckCircleIcon : ErrorIcon

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>

      <DialogContent sx={{ p: 0 }}>

        {/* FONDO */}
        <Box
          sx={{
            background: bgColor,
            color: "#fff",
            textAlign: "center",
            p: 3,
            borderRadius: 2
          }}
        >

          {/* ICONO */}
          <Box sx={{ mb: 2 }}>
            <Icon sx={{ fontSize: 50 }} />
          </Box>

          {/* TITULO */}
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>

          {/* CARD INTERNA */}
          <Box
            sx={{
              mt: 3,
              background: "#fff",
              color: "#000",
              borderRadius: 2,
              p: 2
            }}
          >
            <Typography variant="body1" fontWeight="bold">
              {message}
            </Typography>
          </Box>

          {/* BOTON */}
          <Button
            fullWidth
            variant="contained"
            onClick={onClose}
            sx={{
              mt: 3,
              background: cardColor,
              "&:hover": {
                background: cardColor
              }
            }}
          >
            OK
          </Button>

        </Box>

      </DialogContent>

    </Dialog>
  )
}