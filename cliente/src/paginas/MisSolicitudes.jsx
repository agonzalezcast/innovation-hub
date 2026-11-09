import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contextos/AuthContext.jsx'
import { peticion } from '../servicios/api.js'

function MisSolicitudes() {
  const { usuario, cargando: cargandoSesion } = useAuth()
  const idUsuario = usuario?.id

  const [solicitudes, setSolicitudes] = useState([])
  const [estado, setEstado] = useState('')
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [cancelando, setCancelando] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (cargandoSesion) return

    if (!idUsuario) return

    let activo = true

    async function cargarSolicitudes() {
      setCargando(true)
      setError('')

      const parametros = new URLSearchParams({
        page: pagina,
        size: 10
      })

      if (estado) {
        parametros.set('status', estado)
      }

      try {
        const datos = await peticion(`/requests/mine?${parametros}`)

        if (activo) {
          setSolicitudes(datos.items || [])
          setTotalPaginas(datos.totalPages || 1)
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

    cargarSolicitudes()

    return () => {
      activo = false
    }
  }, [idUsuario, cargandoSesion, estado, pagina])

  async function cancelarSolicitud(id) {
    const confirmar = window.confirm(
      '¿Está seguro de que desea cancelar esta solicitud?'
    )

    if (!confirmar) return

    setCancelando(id)
    setError('')
    setMensaje('')

    try {
      const actualizada = await peticion(`/requests/${id}/cancel`, {
        method: 'PATCH'
      })

      setSolicitudes((anteriores) =>
        anteriores
          .map((solicitud) =>
            solicitud.id === id ? actualizada : solicitud
          )
          .filter((solicitud) =>
            !estado || solicitud.status === estado
          )
      )

      setMensaje('La solicitud fue cancelada correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setCancelando(null)
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
        <h1>Mis solicitudes</h1>
        <div className="alert alert-warning">
          Debe <Link to="/login">iniciar sesión</Link> para consultar sus solicitudes.
        </div>
      </main>
    )
  }

  return (
    <main className="container py-4">
      <h1>Mis solicitudes</h1>

      <p className="text-body-secondary">
        Consulte el estado de sus solicitudes de participación.
      </p>

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

      <div className="mb-4">
        <label htmlFor="filtroEstado" className="form-label">
          Filtrar por estado
        </label>

        <select
          id="filtroEstado"
          className="form-select"
          value={estado}
          onChange={cambiarEstado}
        >
          <option value="">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aceptada">Aceptada</option>
          <option value="Rechazada">Rechazada</option>
          <option value="Cancelada">Cancelada</option>
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
                      {solicitud.initiative.title}
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
                      <strong>Competencia principal:</strong>{' '}
                      {solicitud.mainSkill?.name || 'No disponible'}
                    </p>

                    <p>
                      <strong>Rol:</strong> {solicitud.role}
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
                      to={`/iniciativas/${solicitud.initiative.id}`}
                      className="btn btn-outline-primary me-2"
                    >
                      Ver iniciativa
                    </Link>

                    {solicitud.status === 'Pendiente' && (
                      <Link to={`/solicitudes/${solicitud.id}/editar`} className="btn btn-outline-primary me-2">Modificar</Link>
                    )}
                    {solicitud.status === 'Pendiente' && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        disabled={cancelando === solicitud.id}
                        onClick={() => cancelarSolicitud(solicitud.id)}
                      >
                        {cancelando === solicitud.id
                          ? 'Cancelando...'
                          : 'Cancelar solicitud'}
                      </button>
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
    </main>
  )
}

export default MisSolicitudes