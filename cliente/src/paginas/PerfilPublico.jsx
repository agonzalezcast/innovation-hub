import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../contextos/AuthContext.jsx'
import { peticion } from '../servicios/api.js'

function PerfilPublico() {
  const { id } = useParams()
  const { usuario, cargando } = useAuth()

  const [perfil, setPerfil] = useState(null)
  const [cargandoPerfil, setCargandoPerfil] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!usuario) return

    let activo = true

    async function cargarPerfil() {
      setCargandoPerfil(true)
      setError('')

      try {
        const datos = await peticion(`/users/${id}`)
        if (activo) setPerfil(datos)
      } catch (err) {
        if (activo) setError(err.message)
      } finally {
        if (activo) setCargandoPerfil(false)
      }
    }

    cargarPerfil()

    return () => {
      activo = false
    }
  }, [id, usuario?.id])

  if (cargando) {
    return <main className="container py-5">Verificando sesión...</main>
  }

  if (!usuario) {
    return (
      <main className="container py-5">
        <div className="alert alert-warning">
          Debe <Link to="/login">iniciar sesión</Link> para ver este perfil.
        </div>
      </main>
    )
  }

  return (
    <main className="container py-5">
      <Link to="/usuarios" className="btn btn-outline-secondary mb-4">
        Volver al directorio
      </Link>

      {cargandoPerfil ? (
        <p>Cargando perfil...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : perfil ? (
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="h3">{perfil.fullName}</h1>
            <p className="text-body-secondary">
              {perfil.memberType} · {perfil.career}
            </p>

            <h2 className="h5 mt-4">Acerca de</h2>
            <p>{perfil.description || 'Sin descripción.'}</p>

            <h2 className="h5">Competencias</h2>
            {perfil.skills?.length > 0 ? (
              <div className="mb-3">
                {perfil.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="badge text-bg-secondary me-2"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p>No hay competencias registradas.</p>
            )}

            <h2 className="h5">Intereses</h2>
            <p>{perfil.interests?.join(', ') || 'Sin intereses registrados.'}</p>

            <h2 className="h5">Disponibilidad</h2>
            <p>{perfil.availability || 'No especificada.'}</p>

            {perfil.portfolioUrl && (
              <a
                href={perfil.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary"
              >
                Ver portafolio
              </a>
            )}
          </div>
        </div>
      ) : (
        <p>No se encontró el perfil solicitado.</p>
      )}
    </main>
  )
}

export default PerfilPublico