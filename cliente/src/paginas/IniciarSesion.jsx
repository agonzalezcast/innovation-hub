
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contextos/AuthContext.jsx'

function IniciarSesion() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mensaje, setMensaje] = useState('')

    const { iniciarSesion } = useAuth()
    const navigate = useNavigate()
    const [enviando, setEnviando] = useState(false)

    async function manejarSubmit(evento) {
        evento.preventDefault()
        setMensaje('')

        if (!email.trim() || !password) {
            setMensaje('Complete todos los campos.')
            return
        }

        setEnviando(true)

        try {
            await iniciarSesion(email.trim(), password)
            navigate('/')
        } catch (error) {
            setMensaje(error.message)
        } finally {
            setEnviando(false)
        }
    }

    return (
        <main className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-5">
                    <div className="card shadow-sm">
                        <div className="card-body p-4">
                            <h1 className="h3 mb-3">Iniciar sesión</h1>

                            <p className="text-body-secondary">
                                Ingrese sus credenciales para acceder a Innovation Hub.
                            </p>

                            {mensaje && (
                                <div className="alert alert-danger" role="alert">
                                    {mensaje}
                                </div>
                            )}

                            <form onSubmit={manejarSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        Correo electrónico
                                    </label>
                                    <input type="email" id="email" className="form-control" value={email} onChange={(evento) => setEmail(evento.target.value)} required />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        Contraseña
                                    </label>
                                    <input type="password" id="password" className="form-control" value={password} onChange={(evento) => setPassword(evento.target.value)} required />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={enviando}
                                >
                                    {enviando ? 'Ingresando...' : 'Ingresar'}
                                </button>
                            </form>

                            <p className="mt-3 mb-0 text-center">
                                ¿No tiene una cuenta?{' '}
                                <Link to="/registro">Registrarse</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default IniciarSesion
