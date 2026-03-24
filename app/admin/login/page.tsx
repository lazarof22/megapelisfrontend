"use client"

import { useState } from "react"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function AdminLogin(){

 const [user,setUser] = useState("")
 const [pass,setPass] = useState("")
 const router = useRouter()

 const login = async ()=>{
   const res = await axios.post("http://localhost:4000/auth/login",{username:user,password:pass})
   if(res.data.access_token){
     localStorage.setItem("token",res.data.access_token)
     router.push("/admin")
   }else{
     alert("Usuario o contraseña incorrecta")
   }
 }

 return(
   <Box width={300} m="auto" mt={10}>
     <TextField label="Usuario" fullWidth margin="normal" value={user} onChange={e=>setUser(e.target.value)}/>
     <TextField label="Contraseña" type="password" fullWidth margin="normal" value={pass} onChange={e=>setPass(e.target.value)}/>
     <Button variant="contained" fullWidth onClick={login}>Ingresar</Button>
   </Box>
 )
}