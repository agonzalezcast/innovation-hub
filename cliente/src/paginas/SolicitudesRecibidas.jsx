import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../contextos/AuthContext.jsx'
import { peticion } from '../servicios/api.js'

function SolicitudesRecibidas() {
  const { id } = useParams()
  const { usuario, cargando: cargandoSesion } = useAuth()

  const [iniciativa, setIniciativa] = useState(null)
  const [solicitudes, setSolicitudes] = useState([])
  const [estado, setEstado] = useState('Pendiente')
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (cargandoSesion) return

    if (!usuario) {
      setCargando(false)
      return
    }

    let activo = true

    async function cargarDatos() {
      setCargando(true)
      setError('')
      setIniciativa(null)

      try {
        const datosIniciativa = await peticion(`/initiatives/${id}`)

        if (datosIniciativa.owner?.id !== usuario.id) {
          throw new Error('Solo el propietario puede gestionar las solicitudes.')
        }

        const parametros = new URLSearchParams({
          page: pagina,
          size: 10
        })

        if (estado) {
          parametros.set('status', estado)
        }

        const datosSolicitudes = await peticion(
          `/initiatives/${id}/requests?${parametros}`
        )

        if (activo) {
          setIniciativa(datosIniciativa)
          setSolicitudes(datosSolicitudes.items || [])
          setTotalPaginas(datosSolicitudes.totalPages || 1)
        }
      } catch (err) {
        if (activo) {
          setError(err.message)
          setSolicitudes([])
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarDatos()

    return () => {
      activo = false
    }
  }, [id, usuario?.id, cargandoSesion, estado, pagina])

  async function resolverSolicitud(solicitudId, accion) {
    const verbo = accion === 'accept' ? 'aceptar' : 'rechazar'

    if (!window.confirm(`¿Desea ${verbo} esta solicitud?`)) {
      return
    }

    setProcesando(solicitudId)
    setError('')
    setMensaje('')

    try {
      const actualizada = await peticion(
        `/requests/${solicitudId}/${accion}`,
        { method: 'PATCH' }
      )

      setSolicitudes((anteriores) =>
        anteriores
          .map((solicitud) =>
            solicitud.id === solicitudId ? actualizada : solicitud
          )
          .filter((solicitud) =>
            !estado || solicitud.status === estado
          )
      )

      setMensaje(
        accion === 'accept'
          ? 'Solicitud aceptada correctamente.'
          : 'Solicitud rechazada correctamente.'
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setProcesando(null)
    }
  }

  function cambiarEstado(evento) {
    setEstado(evento.target.value)
    setPagina(1)
    setMensaje('')
  }

  function mostrarFecha(fecha) {
    return fecha
      ? new Date(fecha).toLocaleDateString('es-CR')
      : 'No especificada'
  }

  if (cargandoSesion) {
    return (
      <main className="container py-4">
        <p>Cargando sesión...</p>
      </main>
    )
  }

  if (!usuario) {
    return (
      <main className="container py-4">
        <h1>Solicitudes recibidas</h1>

        <div className="alert alert-warning">
          Debe <Link to="/login">iniciar sesión</Link> para continuar.
        </div>
      </main>
    )
  }

  return (
    <main className="container py-4">
      <Link
        to={`/iniciativas/${id}`}
        className="btn btn-outline-secondary mb-4"
      >
        Volver a la iniciativa
      </Link>

      <h1>Solicitudes recibidas</h1>

      {iniciativa && (
        <p className="lead">{iniciativa.title}</p>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="alert alert-success" role="status">
          {mensaje}
        </div>
      )}

      {iniciativa && (
        <>
          <div className="mb-4">
            <label htmlFor="estadoSolicitud" className="form-label">
              Filtrar por estado
            </label>

            <select
              id="estadoSolicitud"
              className="form-select"
              value={estado}
              onChange={cambiarEstado}
            >
              <option value="">Todas</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Aceptada">Aceptadas</option>
              <option value="Rechazada">Rechazadas</option>
              <option value="Cancelada">Canceladas</option>
            </select>
          </div>

          {cargando ? (
            <p>Cargando solicitudes...</p>
          ) : solicitudes.length === 0 ? (
            <div className="alert alert-info">
              No se encontraron solicitudes.
            </div>
          ) : (
            <>
              <div className="row g-3">
                {solicitudes.map((solicitud) => (
                  <div className="col-12 col-md-6" key={solicitud.id}>
                    <article className="card h-100">
                      <div className="card-body">
                        <h2 className="h5">
                          {solicitud.requester.fullName}
                        </h2>

                        <p>
                          <strong>Estado:</strong>{' '}
                          <span className="badge text-bg-secondary">
                            {solicitud.status}
                          </span>
                        </p>

                        <p>
                          <strong>Mensaje:</strong> {solicitud.message}
                        </p>

                        <p>
                          <strong>Competencia:</strong>{' '}
                          {solicitud.mainSkill.name}
                        </p>

                        <p>
                          <strong>Rol solicitado:</strong> {solicitud.role}
                        </p>

                        <p>
                          <strong>Disponibilidad:</strong>{' '}
                          {solicitud.availability}
                        </p>

                        <p>
                          <strong>Fecha:</strong>{' '}
                          {mostrarFecha(solicitud.createdAt)}
                        </p>

                        <Link
                          to={`/usuarios/${solicitud.requester.id}`}
                          className="btn btn-outline-primary me-2 mb-2"
                        >
                          Ver perfil
                        </Link>

                        {solicitud.status === 'Pendiente' && (
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            <button
                              type="button"
                              className="btn btn-success"
                              disabled={procesando !== null}
                              onClick={() =>
                                resolverSolicitud(solicitud.id, 'accept')
                              }
                            >
                              {procesando === solicitud.id
                                ? 'Procesando...'
                                : 'Aceptar'}
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              disabled={procesando !== null}
                              onClick={() =>
                                resolverSolicitud(solicitud.id, 'reject')
                              }
                            >
                              Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  </div>
                ))}
              </div>

              {totalPaginas > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={pagina === 1 || cargando}
                    onClick={() => setPagina(pagina - 1)}
                  >
                    Anterior
                  </button>

                  <span>
                    Página {pagina} de {totalPaginas}
                  </span>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={pagina >= totalPaginas || cargando}
                    onClick={() => setPagina(pagina + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

    </main>
  )
}

export default SolicitudesRecibidas