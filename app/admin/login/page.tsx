"use client";

import { FormEvent, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import axios from "axios"
import { useRouter } from "next/navigation"

type AdminLoginProps = {
  backgroundImage?: string;
  backHref?: string;
};

export default function AdminLogin({
  backgroundImage = "/images/fondo_login.jfif",
  backHref = "/",
}: AdminLoginProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Introduce tu usuario y contraseña.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/auth/login", { username: username.trim(), password: password });
      if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token)
        router.push("/admin")
      } else {
        alert("Usuario o contraseña incorrecta")
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión. Comprueba tus credenciales."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100svh",
        width: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        px: 2,
        py: 5,
        color: "#fff",
        backgroundColor: "#171927",
        backgroundImage: `linear-gradient(180deg, rgba(12,15,29,.70) 0%, rgba(18,19,34,.48) 48%, rgba(12,13,24,.62) 100%), url("${backgroundImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "linear-gradient(0deg, rgba(9,10,20,.30), transparent 42%)",
        },
      }}
    >
      <Box
        component="a"
        href={backHref}
        sx={{
          position: "absolute",
          top: { xs: 18, sm: 22 },
          left: { xs: 18, sm: 26 },
          zIndex: 2,
          color: "rgba(255,255,255,.68)",
          fontSize: 11,
          textDecoration: "none",
          "&:hover": { color: "#fff" },
        }}
      >
        ← Volver al sitio
      </Box>

      <Paper
        component="section"
        elevation={0}
        sx={{
          zIndex: 1,
          width: "100%",
          maxWidth: 340,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: { xs: 2.5, sm: 3 },
          backgroundColor: "transparent",
          boxShadow: "none",
        }}
      >
        <Box
          aria-label="Megapelis administrador"
          sx={{
            width: 76,
            height: 76,
            mb: 2.6,
            border: "2px solid rgba(255,255,255,.94)",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            fontFamily: "Arial, sans-serif",
            fontSize: 43,
            fontWeight: 300,
            lineHeight: 1,
            boxShadow: "0 0 0 1px rgba(255,255,255,.12)",
          }}
        >
          A
        </Box>

        <Typography
          component="h1"
          sx={{
            mb: 2.1,
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".23em",
            textTransform: "uppercase",
            textShadow: "0 2px 10px rgba(0,0,0,.35)",
          }}
        >
          Administrador
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: "100%", display: "grid", gap: 1.05 }}
        >
          <TextField
            fullWidth
            size="small"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Usuario"
            autoComplete="username"
            autoFocus
            disabled={loading}
            inputProps={{ "aria-label": "Usuario" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineRoundedIcon sx={{ color: "rgba(255,255,255,.64)", fontSize: 16 }} />
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />

          <TextField
            fullWidth
            size="small"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Contraseña"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            disabled={loading}
            inputProps={{ "aria-label": "Contraseña" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: "rgba(255,255,255,.64)", fontSize: 15 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPassword((value) => !value)}
                    edge="end"
                    size="small"
                    disabled={loading}
                    sx={{ color: "rgba(255,255,255,.65)", mr: -0.4 }}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />

          {error && (
            <Alert
              severity="error"
              variant="filled"
              sx={{ borderRadius: 2, fontSize: 12, py: 0, backgroundColor: "rgba(145,27,54,.92)" }}
            >
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              mt: 0.45,
              minHeight: 39,
              borderRadius: 99,
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".04em",
              textTransform: "none",
              background: "linear-gradient(100deg, #f22f70 0%, #ed2860 55%, #f13b70 100%)",
              boxShadow: "0 7px 22px rgba(225,32,91,.25)",
              "&:hover": {
                background: "linear-gradient(100deg, #ff477f 0%, #f12c68 55%, #fa4b7c 100%)",
                boxShadow: "0 9px 26px rgba(225,32,91,.34)",
              },
              "&.Mui-disabled": {
                color: "rgba(255,255,255,.75)",
                background: "rgba(220,43,99,.65)",
              },
            }}
          >
            {loading ? <CircularProgress size={17} sx={{ color: "#fff" }} /> : "Iniciar sesión"}
          </Button>
        </Box>

        <Typography
          sx={{
            mt: 1.8,
            color: "rgba(255,255,255,.55)",
            fontSize: 9,
            letterSpacing: ".025em",
            textAlign: "center",
          }}
        >
          Acceso exclusivo para administración
        </Typography>
      </Paper>
    </Box>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 39,
    borderRadius: 99,
    color: "#fff",
    backgroundColor: "rgba(220,220,230,.17)",
    backdropFilter: "blur(9px)",
    fontSize: 11,
    transition: "background-color .2s ease, box-shadow .2s ease",
    "& fieldset": { border: "1px solid rgba(255,255,255,.06)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,.22)" },
    "&.Mui-focused": {
      backgroundColor: "rgba(220,220,230,.22)",
      boxShadow: "0 0 0 2px rgba(255,255,255,.08)",
    },
    "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,.35)" },
    "& input": {
      py: 1,
      px: 0.3,
      "&::placeholder": { color: "rgba(255,255,255,.78)", opacity: 1 },
    },
  },
} as const;
