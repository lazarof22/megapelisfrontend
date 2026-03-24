"use client"

import { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import axios from "axios"

export default function HeroBannerDynamic(){

  const [movie,setMovie] = useState<any>(null)

  useEffect(()=>{
    const fetchDestacada = async ()=>{
      const res = await axios.get("http://localhost:4000/peliculas")
      if(res.data.length > 0){
        const randomIndex = Math.floor(Math.random() * res.data.length)
        setMovie(res.data[randomIndex])
      }
    }
    fetchDestacada()
  },[])

  if(!movie) return null

  return(
    <Box
      sx={{
        height: 420,
        backgroundImage: `url(${movie.banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        pl: 8
      }}
    >
      <Box maxWidth={500} bgcolor="rgba(0,0,0,0.5)" p={2} borderRadius={2}>
        <Typography variant="h3" fontWeight="bold">{movie.nombre}</Typography>
        <Typography mt={2}>{movie.sinopsis}</Typography>
        <Box mt={3} display="flex" gap={2}>
          <Button variant="contained" color="primary">Ver</Button>
          <Button variant="outlined">Trailer</Button>
        </Box>
      </Box>
    </Box>
  )
}