"use client"

import Checkbox from "@mui/material/Checkbox"
import FormControlLabel from "@mui/material/FormControlLabel"
import Box from "@mui/material/Box"
import { useState } from "react"

export default function SeasonSelector({total,onChange}:any){

 const [selected,setSelected] = useState<number[]>([])

 const toggle=(season:number)=>{

  let newValue:number[]

  if(selected.includes(season)){
    newValue = selected.filter(s=>s!==season)
  }else{
    newValue = [...selected,season]
  }

  setSelected(newValue)
  onChange(newValue)

 }

 return(

  <Box display="flex" flexWrap="wrap">

   {Array.from({length:total}).map((_,i)=>{

    const season = i+1

    return(
      <FormControlLabel
        key={season}
        control={
          <Checkbox
           checked={selected.includes(season)}
           onChange={()=>toggle(season)}
          />
        }
        label={`T${season}`}
      />
    )

   })}

  </Box>
 )
}