import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../contextos/AuthContext.jsx'
import { peticion } from '../servicios/api.js'
import FormularioSolicitud from '../componentes/solicitudes/FormularioSolicitud.jsx'

function DetalleIniciativa() {
  const { id } = useParams()
  const { usuario, cargando: cargandoSesion } = useAuth()

  const [iniciativa, setIniciativa] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (cargandoSesion) return

    let activo = true

    async function cargarIniciativa() {
      setCargando(true)
      setError('')
      setIniciativa(null)

      try {
        const datos = await peticion(`/initiatives/${id}`)

        if (activo) {
          setIniciativa(datos)
        }
      } catch (err) {
        if (activo) {
          setError(err.message)
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarIniciativa()

    return () => {
      activo = false
    }
  }, [id, usuario?.id, cargandoSesion])

  if (cargando || cargandoSesion) {
    return (
      <main className="container py-4">
        <p>Cargando iniciativa...</p>
      </main>
    )
  }

  if (error || !iniciativa) {
    return (
      <main className="container py-4">
        <Link to="/catalogo" className="btn btn-outline-secondary mb-4">
          Volver al catálogo
        </Link>

        <div className="alert alert-warning" role="alert">
          {error || 'La iniciativa solicitada no existe.'}
        </div>
      </main>
    )
  }

  const detalleRestringido = iniciativa.description === undefined
  const miembros = iniciativa.members || []

  const esPropietario = iniciativa.owner?.id === usuario?.id

  const esMiembro = miembros.some(
    (miembro) => miembro.user?.id === usuario?.id
  )

  const espaciosDisponibles = detalleRestringido
    ? null
    : Math.max(0, iniciativa.capacity - miembros.length)

  const puedeSolicitar =
    usuario &&
    !detalleRestringido &&
    !esPropietario &&
    !esMiembro &&
    espaciosDisponibles > 0 &&
    ['Publicada', 'En formación de equipo'].includes(iniciativa.status)

  function mostrarFecha(fecha) {
    return fecha
      ? new Date(fecha).toLocaleDateString('es-CR')
      : 'No especificada'
  }

  return (
    <main className="container py-4">
      <Link to="/catalogo" className="btn btn-outline-secondary mb-4">
        Volver al catálogo
      </Link>

      <article>
        <div className="d-flex flex-wrap gap-2 mb-3">
          <span className={`badge badge-tipo--${iniciativa.type.toLowerCase()}`}>
            {iniciativa.type}
          </span>

          {iniciativa.status && (
            <span className="badge text-bg-secondary">
              {iniciativa.status}
            </span>
          )}

          {iniciativa.visibility && (
            <span className="badge badge-visibilidad">
              {iniciativa.visibility}
            </span>
          )}
        </div>

        <h1>{iniciativa.title}</h1>
        <p className="lead">{iniciativa.summary}</p>

        <section className="mb-4">
          <h2>Información general</h2>

          <p>
            <strong>Categoría:</strong> {iniciativa.category}
          </p>

          {iniciativa.owner && (
            <p>
              <strong>Propietario:</strong> {iniciativa.owner.fullName}
            </p>
          )}
        </section>

        <section className="mb-4">
          <h2>Competencias requeridas</h2>

          <ul>
            {(iniciativa.skills || []).map((competencia) => (
              <li key={competencia.id}>{competencia.name}</li>
            ))}
          </ul>
        </section>

        {detalleRestringido ? (
          <div className="alert alert-warning" role="alert">
            Esta iniciativa tiene acceso restringido.
            La descripción detallada y la información del equipo
            solo están disponibles para el propietario y los
            miembros aceptados.
          </div>
        ) : (
          <>
            <hr />

            <section className="mb-4">
              <h2>Descripción</h2>
              <p>{iniciativa.description}</p>
            </section>

            <section className="mb-4">
              <h2>Problema identificado</h2>
              <p>{iniciativa.problem || 'No especificado.'}</p>
            </section>

            <section className="mb-4">
              <h2>Beneficiarios</h2>
              <p>{iniciativa.beneficiaries || 'No especificados.'}</p>
            </section>

            <section className="mb-4">
              <h2>Información de la iniciativa</h2>

              <p>
                <strong>Identificador:</strong> {iniciativa.id}
              </p>

              <p>
                <strong>Integrantes actuales:</strong> {miembros.length} de{' '}
                {iniciativa.capacity}
              </p>

              <p>
                <strong>Espacios disponibles:</strong> {espaciosDisponibles}
              </p>

              <p>
                <strong>Estado:</strong> {iniciativa.status}
              </p>

              <p>
                <strong>Visibilidad:</strong> {iniciativa.visibility}
              </p>

              <p>
                <strong>Fecha de publicación:</strong>{' '}
                {mostrarFecha(iniciativa.publishedAt)}
              </p>

              <p>
                <strong>Última modificación:</strong>{' '}
                {mostrarFecha(iniciativa.updatedAt)}
              </p>
            </section>

            <section className="mb-4">
              <h2>Equipo</h2>

              {miembros.length === 0 ? (
                <p>No hay integrantes registrados.</p>
              ) : (
                <ul className="list-group">
                  {miembros.map((miembro) => (
                    <li
                      key={miembro.user.id}
                      className="list-group-item"
                    >
                      <strong>{miembro.user.fullName}</strong>
                      {' · '}
                      {miembro.role}

                      <div className="text-body-secondary small">
                        Incorporación: {mostrarFecha(miembro.joinedAt)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mb-4">
              <h2>Etiquetas</h2>

              {(iniciativa.tags || []).length === 0 ? (
                <p>Sin etiquetas.</p>
              ) : (
                iniciativa.tags.map((etiqueta) => (
                  <span
                    key={etiqueta}
                    className="badge text-bg-light me-1"
                  >
                    {etiqueta}
                  </span>
                ))
              )}
            </section>

            {esPropietario && (
              <section className="mb-4">
                <Link
                  to={`/iniciativas/${iniciativa.id}/solicitudes`}
                  className="btn btn-primary"
                >
                  Gestionar solicitudes recibidas
                </Link>
              </section>
            )}

            {puedeSolicitar && (
              <section className="mb-4">
                <FormularioSolicitud iniciativaId={iniciativa.id} />
              </section>
            )}

            {!usuario && espaciosDisponibles > 0 &&
              ['Publicada', 'En formación de equipo'].includes(iniciativa.status) && (
                <div className="alert alert-info">
                  Debe{' '}
                  <Link to="/login">iniciar sesión</Link>
                  {' '}para solicitar participación.
                </div>
              )}
          </>
        )}
      </article>
    </main>
  )
}

export default DetalleIniciativa