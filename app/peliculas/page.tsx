"use client"

import MainLayout from "@/components/MainLayout"
import HeroBannerDynamic from "@/components/HeroBannerDynamic"
import MediaSection from "@/components/MediaSection"
import Box from "@mui/material/Box"
import MediaCard from "@/components/MediaCard"

export default function moviePage() {

  return (

    <MainLayout>

      <HeroBannerDynamic />

      <Box mt={4}>

        <MediaSection titulo="Películas" tipo="peliculas" />

      </Box>

    </MainLayout>

  )
}