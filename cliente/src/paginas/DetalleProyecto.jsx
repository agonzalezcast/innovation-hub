import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../contextos/AuthContext.jsx'
import { peticion } from '../servicios/api.js'

function DetalleProyecto() {
  const { id } = useParams()
  const { usuario, cargando: cargandoSesion } = useAuth()

  const [proyecto, setProyecto] = useState(null)
  const [repositorio, setRepositorio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorGitHub, setErrorGitHub] = useState('')

  useEffect(() => {
    if (cargandoSesion) return

    if (!usuario) {
      setCargando(false)
      return
    }

    let activo = true

    async function cargarProyecto() {
      setCargando(true)
      setError('')
      setErrorGitHub('')
      setRepositorio(null)
      setProyecto(null)

      try {
        const datos = await peticion(`/projects/${id}`)

        if (!activo) return
        setProyecto(datos)

        if (datos.repositoryUrl) {
          try {
            const url = new URL(datos.repositoryUrl)

            if (
              url.protocol !== 'https:' ||
              url.hostname.toLowerCase() !== 'github.com'
            ) {
              throw new Error('La dirección del repositorio no es válida.')
            }

            const partes = url.pathname.split('/').filter(Boolean)

            if (partes.length !== 2) {
              throw new Error('La dirección del repositorio no es válida.')
            }

            const respuesta = await fetch(
              `https://api.github.com/repos/${partes[0]}/${partes[1]}`
            )

            if (!respuesta.ok) {
              if (respuesta.status === 404) {
                throw new Error('El repositorio no existe o es privado.')
              }

              if (respuesta.status === 403 || respuesta.status === 429) {
                throw new Error('GitHub limitó las consultas. Inténtelo más tarde.')
              }

              throw new Error('No fue posible consultar GitHub.')
            }

            const datosGitHub = await respuesta.json()

            if (!datosGitHub.full_name || !datosGitHub.owner?.login) {
              throw new Error('GitHub devolvió información incompleta.')
            }

            if (activo) setRepositorio(datosGitHub)
          } catch (err) {
            if (activo) {
              setErrorGitHub(
                err instanceof TypeError
                  ? 'No fue posible conectar con GitHub.'
                  : err.message
              )
            }
          }
        }
      } catch (err) {
        if (activo) setError(err.message)
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarProyecto()

    return () => {
      activo = false
    }
  }, [id, usuario?.id, cargandoSesion])

  function mostrarFecha(fecha) {
    return fecha
      ? new Date(fecha).toLocaleDateString('es-CR')
      : 'No especificada'
  }

  if (cargando || cargandoSesion) {
    return <main className="container py-4">Cargando proyecto...</main>
  }

  if (!usuario) {
    return (
      <main className="container py-4">
        Debe <Link to="/login">iniciar sesión</Link> para continuar.
      </main>
    )
  }

  return (
    <main className="container py-4">
      <Link to="/proyectos" className="btn btn-outline-secondary mb-4">
        Volver a proyectos
      </Link>

      {error && <div className="alert alert-danger">{error}</div>}

      {proyecto && (
        <article>
          <h1>{proyecto.name}</h1>
          <p className="lead">{proyecto.objective}</p>

          <section className="mb-4">
            <h2>Información del proyecto</h2>
            <p><strong>Descripción:</strong> {proyecto.description}</p>
            <p><strong>Estado:</strong> {proyecto.status}</p>
            <p><strong>Propietario:</strong> {proyecto.owner?.fullName}</p>
            <p><strong>Iniciativa original:</strong>{' '}
              <Link to={`/iniciativas/${proyecto.initiative.id}`}>
                {proyecto.initiative.title}
              </Link>
            </p>
            <p><strong>Tecnologías:</strong>{' '}
              {(proyecto.technologies || []).join(', ')}
            </p>
            <p><strong>Inicio:</strong> {mostrarFecha(proyecto.startDate)}</p>
            <p><strong>Finalización estimada:</strong>{' '}
              {mostrarFecha(proyecto.estimatedEndDate)}
            </p>
          </section>

          <section className="mb-4">
            <h2>Equipo</h2>
            <ul className="list-group">
              {(proyecto.members || []).map((miembro) => (
                <li key={miembro.user.id} className="list-group-item">
                  {miembro.user.fullName} · {miembro.role}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-4">
            <h2>Repositorio GitHub</h2>

            {!proyecto.repositoryUrl ? (
              <p>No se ha registrado un repositorio.</p>
            ) : (
              <>
                <p>
                  <a href={proyecto.repositoryUrl} target="_blank"
                    rel="noopener noreferrer">
                    Abrir repositorio
                  </a>
                </p>

                {errorGitHub && (
                  <div className="alert alert-warning">{errorGitHub}</div>
                )}

                {repositorio && (
                  <div className="card">
                    <div className="card-body">
                      <h3 className="h5">{repositorio.full_name}</h3>
                      <p>{repositorio.description || 'Sin descripción.'}</p>
                      <p><strong>Propietario:</strong> {repositorio.owner.login}</p>
                      <p><strong>Lenguaje principal:</strong>{' '}
                        {repositorio.language || 'No especificado'}
                      </p>
                      <p><strong>Rama principal:</strong> {repositorio.default_branch}</p>
                      <p><strong>Última actualización:</strong>{' '}
                        {mostrarFecha(repositorio.updated_at)}
                      </p>
                      <p><strong>Asuntos abiertos:</strong> {repositorio.open_issues_count}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </article>
      )}
    </main>
  )
}

export default DetalleProyecto