import { Link, useParams } from 'react-router-dom'
import iniciativas from '../../../avance1/datos/iniciativas.json'
import { useAuth } from '../contextos/AuthContext.jsx'
import FormularioSolicitud from '../componentes/solicitudes/FormularioSolicitud.jsx'

function DetalleIniciativa() {
  
  const { id } = useParams()
  const { usuario } = useAuth()

  const iniciativa = iniciativas.find(
    (item) => item.id === Number(id)
  )

  if (!iniciativa) {
    return (
      <main className="container py-4">
        <Link to="/catalogo" className="btn btn-outline-secondary mb-4">
          Volver al catálogo
        </Link>

        <h1>Iniciativa no encontrada</h1>

        <div className="alert alert-warning" role="alert">
          La iniciativa solicitada no existe.
        </div>
      </main>
    )
  }

  const idUsuarioActual = usuario?.id
  const miembros = iniciativa.miembros ?? []

  const esPropietario = iniciativa.idPropietario === idUsuarioActual

  const esMiembro = miembros.some(
    (miembro) => miembro.idUsuario === idUsuarioActual
  )

  const espaciosDisponibles = Math.max(
    0,
    iniciativa.participantes - miembros.length
  )

  const puedeSolicitar = usuario && !esPropietario && !esMiembro && espaciosDisponibles > 0 && ['Publicada', 'En formación de equipo'].includes(iniciativa.estado)

  const tieneAccesoCompleto = esPropietario || esMiembro

  // Iniciativa privada: solamente propietario y miembros.
  if (iniciativa.visibilidad === 'Privada' && !tieneAccesoCompleto) {
    return (
      <main className="container py-4">
        <Link to="/catalogo" className="btn btn-outline-secondary mb-4">
          Volver al catálogo
        </Link>

        <h1>Iniciativa no disponible</h1>

        <div className="alert alert-warning" role="alert">
          Esta iniciativa es privada. Solo el propietario y los
          miembros aceptados del equipo pueden consultarla.
        </div>
      </main>
    )
  }

  // Iniciativa institucional: requiere usuario autenticado.
  if (iniciativa.visibilidad === 'Institucional' && !usuario) {
    return (
      <main className="container py-4">
        <Link to="/catalogo" className="btn btn-outline-secondary mb-4">
          Volver al catálogo
        </Link>

        <h1>Acceso restringido</h1>

        <div className="alert alert-warning" role="alert">
          Debe iniciar sesión para consultar el contenido
          completo de esta iniciativa institucional.
        </div>
      </main>
    )
  }

  // Iniciativa restringida: información limitada para quienes no son propietarios ni miembros del equipo.
  if (
    iniciativa.visibilidad === 'Restringida' &&
    !tieneAccesoCompleto
  ) {
    return (
      <main className="container py-4">
        <Link to="/catalogo" className="btn btn-outline-secondary mb-4">
          Volver al catálogo
        </Link>

        <article>
          <h1>{iniciativa.titulo}</h1>

          <p>
            <strong>Tipo:</strong> {iniciativa.tipo}
          </p>

          <p className="lead">{iniciativa.resumen}</p>

          <p>
            <strong>Categoría:</strong> {iniciativa.categoria}
          </p>

          <section className="mb-4">
            <h2>Competencias requeridas</h2>

            <ul>
              {iniciativa.competencias.map((competencia) => (
                <li key={competencia}>{competencia}</li>
              ))}
            </ul>
          </section>

          <div className="alert alert-warning" role="alert">
            Esta iniciativa tiene visibilidad restringida.
            La descripción detallada y el problema completo
            solamente están disponibles para el propietario
            y los miembros aceptados del equipo.
          </div>
        </article>
      </main>
    )
  }

  // Detalle completo para usuarios autorizados.
  return (
    <main className="container py-4">
      <Link to="/catalogo" className="btn btn-outline-secondary mb-4">
        Volver al catálogo
      </Link>

      <article>
        <div className="mb-3 d-flex flex-wrap gap-2">
          <span
            className={`badge badge-tipo--${iniciativa.tipo.toLowerCase()}`}
          >
            {iniciativa.tipo}
          </span>

          <span className="badge text-bg-secondary">
            {iniciativa.estado}
          </span>

          <span className="badge badge-visibilidad">
            {iniciativa.visibilidad}
          </span>
        </div>

        <h1>{iniciativa.titulo}</h1>

        <p className="lead">{iniciativa.resumen}</p>

        {iniciativa.visibilidad === 'Institucional' && (
          <div className="alert alert-info">
            Esta iniciativa es visible para usuarios
            autenticados de la institución.
          </div>
        )}

        {['Restringida', 'Privada'].includes(iniciativa.visibilidad) && (
          <div className="alert alert-info">
            Esta iniciativa tiene visibilidad {iniciativa.visibilidad.toLowerCase()}.
            Puede consultar su contenido completo porque es el propietario
            o un miembro aceptado del equipo.
          </div>
        )}

        <hr />

        <section className="mb-4">
          <h2>Descripción</h2>
          <p>{iniciativa.descripcion}</p>
        </section>

        <section className="mb-4">
          <h2>Problema identificado</h2>
          <p>{iniciativa.problema || 'No especificado.'}</p>
        </section>

        <section className="mb-4">
          <h2>Beneficiarios</h2>
          <p>{iniciativa.beneficiarios || 'No especificados.'}</p>
        </section>

        <section className="mb-4">
          <h2>Información de la iniciativa</h2>

          <p>
            <strong>Identificador:</strong> {iniciativa.id}
          </p>

          <p>
            <strong>Categoría:</strong> {iniciativa.categoria}
          </p>

          <p>
            <strong>Propietario:</strong> {iniciativa.propietario}
          </p>

          <p>
            <strong>Integrantes actuales:</strong> {miembros.length} de{' '}
            {iniciativa.participantes} estimados
          </p>

          <p>
            <strong>Espacios disponibles:</strong> {espaciosDisponibles}
          </p>

          <p>
            <strong>Estado:</strong> {iniciativa.estado}
          </p>

          <p>
            <strong>Visibilidad:</strong> {iniciativa.visibilidad}
          </p>

          <p>
            <strong>Fecha de publicación:</strong>{' '}
            {iniciativa.fechaPublicacion}
          </p>

          <p>
            <strong>Última modificación:</strong>{' '}
            {iniciativa.fechaModificacion}
          </p>
        </section>

        <section className="mb-4">
          <h2>Competencias requeridas</h2>

          <ul>
            {iniciativa.competencias.map((competencia) => (
              <li key={competencia}>{competencia}</li>
            ))}
          </ul>
        </section>

        <section className="mb-4">
          <h2>Equipo</h2>

          <ul className="list-group">
            {miembros.map((miembro) => (
              <li
                key={miembro.idUsuario}
                className="list-group-item"
              >
                <strong>{miembro.nombre}</strong> · {miembro.rol}

                <div className="text-body-secondary small">
                  {miembro.carrera}

                  {miembro.competencias?.length > 0 &&
                    ` · ${miembro.competencias.join(', ')}`}
                </div>

                <div className="text-body-secondary small">
                  Incorporación: {miembro.fechaIncorporacion}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-4">
          <h2>Etiquetas</h2>

          {iniciativa.etiquetas.map((etiqueta) => (
            <span
              key={etiqueta}
              className="badge text-bg-light me-1"
            >
              {etiqueta}
            </span>
          ))}
        </section>

        {puedeSolicitar && (
          <section className="mb-4">
            <FormularioSolicitud iniciativaId={iniciativa.id} />
          </section>
        )}

        {!usuario && espaciosDisponibles > 0 && (
          <div className="alert alert-info">
            Debe <Link to="/login">iniciar sesión</Link> para solicitar participación.
          </div>
        )}
      </article>
    </main>
  )
}

export default DetalleIniciativa