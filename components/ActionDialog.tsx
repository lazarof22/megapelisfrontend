"use client"

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from "@mui/material"

import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import WarningIcon from "@mui/icons-material/Warning"
import ErrorIcon from "@mui/icons-material/Error"
import InfoIcon from "@mui/icons-material/Info"

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
  type = "info",
  onClose
}: Props) {

  const config = {
    success: {
      color: "success",
      icon: <CheckCircleIcon color="success" />
    },
    warning: {
      color: "warning",
      icon: <WarningIcon color="warning" />
    },
    error: {
      color: "error",
      icon: <ErrorIcon color="error" />
    },
    info: {
      color: "info",
      icon: <InfoIcon color="info" />
    }
  }

  const current = config[type]

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>

      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {current.icon}
          {title}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          variant="contained"
          color={current.color as any}
        >
          OK
        </Button>
      </DialogActions>

    </Dialog>
  )
}