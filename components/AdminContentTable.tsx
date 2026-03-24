"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Table from "@mui/material/Table"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import TableHead from "@mui/material/TableHead"
import Button from "@mui/material/Button"

export default function AdminContentTable() {

    const [data, setData] = useState<Array<{ _id: string; poster: string; nombre: string; genero: string }>>([])

    const cargar = async () => {
        const res = await axios.get("http://localhost:4000/peliculas")
        setData(res.data)
    }

    const eliminar = async (id: string) => {

        await axios.delete(`http://localhost:4000/peliculas/${id}`)

        cargar()

    }

    useEffect(() => {
        cargar()
    }, [])

    return (

        <Table>

            <TableHead>

                <TableRow>
                    <TableCell>Poster</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Genero</TableCell>
                    <TableCell>Acciones</TableCell>
                </TableRow>

            </TableHead>

            <TableBody>

                {data.map((item) => (
                    <TableRow key={item._id}>

                        <TableCell>
                            <img src={item.poster} width={60} />
                        </TableCell>

                        <TableCell>{item.nombre}</TableCell>

                        <TableCell>{item.genero}</TableCell>

                        <TableCell>

                            <Button
                                color="error"
                                onClick={() => eliminar(item._id)}
                            >
                                Eliminar
                            </Button>

                        </TableCell>

                    </TableRow>
                ))}

            </TableBody>

        </Table>

    )
}