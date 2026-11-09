import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contextos/AuthContext.jsx'
import { peticion } from '../servicios/api.js'
import FormularioPerfil from '../componentes/usuarios/FormularioPerfil.jsx'

function MiPerfil() {
  const { usuario, cargando, setUsuario } = useAuth()
  const idUsuario = usuario?.id
  const [perfil, setPerfil] = useState(null)
  const [competencias, setCompetencias] = useState([])
  const [cargandoPerfil, setCargandoPerfil] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (cargando) return

    if (!idUsuario) return
    let activo = true

    async function cargarPerfil() {
      try {
        const [datosUsuario, datosCompetencias] = await Promise.all([
          peticion('/auth/me'),
          peticion('/skills')
        ])

        if (activo) {
          setPerfil(datosUsuario)
          setCompetencias(datosCompetencias.items)
        }
      } catch (err) {
        if (activo) setError(err.message)
      } finally {
        if (activo) setCargandoPerfil(false)
      }
    }

    cargarPerfil()
    return () => { activo = false }
  }, [idUsuario, cargando])

  async function guardarPerfil(datos) {
    setGuardando(true)
    setMensaje('')
    setError('')

    try {
      const actualizado = await peticion('/users/me', {
        method: 'PUT',
        body: JSON.stringify(datos)
      })

      setPerfil(actualizado)
      setUsuario(actualizado)
      setMensaje('Perfil actualizado correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return <main className="container py-5">Verificando sesión...</main>
  }

  if (!usuario) {
    return (
      <main className="container py-5">
        <div className="alert alert-warning">
          Debe <Link to="/login">iniciar sesión</Link> para ver su perfil.
        </div>
      </main>
    )
  }

  return (
    <main className="container py-5">
      <h1 className="mb-4">Mi perfil</h1>

      {mensaje && (
        <div className="alert alert-success" role="status">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {cargandoPerfil ? (
        <p>Cargando perfil...</p>
      ) : perfil ? (
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h2 className="h4">{perfil.fullName}</h2>
            <p className="text-body-secondary">{perfil.email}</p>

            <hr />

            <h3 className="h5 mb-3">Editar información</h3>

            <FormularioPerfil
              key={perfil.updatedAt || perfil.id}
              usuario={perfil}
              competencias={competencias}
              onGuardar={guardarPerfil}
              guardando={guardando}
            />
          </div>
        </div>
      ) : (
        <p>No fue posible cargar el perfil.</p>
      )}
    </main>
  )
}

export default MiPerfil