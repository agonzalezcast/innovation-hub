import { Link } from 'react-router-dom'

function TarjetaIniciativa({ iniciativa }) {
  const esRestringida = iniciativa.capacity === undefined

  const espaciosDisponibles = esRestringida
    ? null
    : Math.max(0, iniciativa.capacity - iniciativa.memberCount)

  return (
    <article className="card tarjeta-iniciativa h-100">
      <div className="card-body">
        <div className="mb-2">
          <span className={`badge badge-tipo--${iniciativa.type.toLowerCase()}`}>
            {iniciativa.type}
          </span>

          {iniciativa.visibility && (
            <span className="badge badge-visibilidad ms-2">
              {iniciativa.visibility}
            </span>
          )}
        </div>

        <h3 className="card-title h5">{iniciativa.title}</h3>

        <p className="card-text">{iniciativa.summary}</p>

        <p>
          <strong>Categoría:</strong> {iniciativa.category}
        </p>

        <p>
          <strong>Competencias:</strong>{' '}
          {iniciativa.skills?.map((skill) => skill.name).join(', ')}
        </p>

        {iniciativa.status && (
          <p>
            <strong>Estado:</strong> {iniciativa.status}
          </p>
        )}

        {espaciosDisponibles !== null && (
          <p className="mb-0">
            <strong>Integrantes:</strong> {iniciativa.memberCount} de{' '}
            {iniciativa.capacity} · {espaciosDisponibles}{' '}
            {espaciosDisponibles === 1
              ? 'espacio disponible'
              : 'espacios disponibles'}
          </p>
        )}
      </div>

      <div className="card-footer bg-transparent">
        <Link
          to={`/iniciativas/${iniciativa.id}`}
          className="btn btn-primary"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  )
}

export default TarjetaIniciativa