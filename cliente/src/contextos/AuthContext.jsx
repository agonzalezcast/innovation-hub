import { createContext, useContext, useEffect, useState } from 'react'
import { peticion } from '../servicios/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        async function recuperarSesion() {
            if (!sessionStorage.getItem('token')) {
                setCargando(false)
                return
            }

            try {
                const datos = await peticion('/auth/me')
                setUsuario(datos)
            } catch {
                sessionStorage.removeItem('token')
                setUsuario(null)
            } finally {
                setCargando(false)
            }
        }

        recuperarSesion()
    }, [])

    async function iniciarSesion(email, password) {
        const datos = await peticion('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        })

        sessionStorage.setItem('token', datos.token)
        setUsuario(datos.user)

        return datos.user
    }

    async function cerrarSesion() {
        try {
            await peticion('/auth/logout', {
                method: 'POST'
            })
        } finally {
            sessionStorage.removeItem('token')
            setUsuario(null)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                usuario,
                cargando,
                iniciarSesion,
                cerrarSesion,
                setUsuario
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}