"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

interface Props {
  titulo: string;
  descripcion: string;
  imagen: string;
}

export default function HeroBanner({
  titulo,
  descripcion,
  imagen
}: Props) {
  return (
    <Box
      sx={{
        height: 420,
        backgroundImage: `url(${imagen})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        pl: 8
      }}
    >
      <Box maxWidth={500}>
        <Typography variant="h3" fontWeight="bold">
          {titulo}
        </Typography>

        <Typography mt={2}>
          {descripcion}
        </Typography>

        <Box mt={3} display="flex" gap={2}>
          <Button variant="contained" color="primary">
            Ver
          </Button>

          <Button variant="outlined">
            Trailer
          </Button>
        </Box>
      </Box>
    </Box>
  );
}