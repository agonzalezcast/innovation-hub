function TarjetaIniciativa({ iniciativa }) {
    const integrantes = iniciativa.miembros?.length ?? 0

    const espaciosDisponibles = Math.max(
        0,
        iniciativa.participantes - integrantes
    )

    return (
        <article className="card h-100">
            <div className="card-body">
                <div className="mb-2">
                    <span className={`badge badge-tipo--${iniciativa.tipo.toLowerCase()}`}>
                        {iniciativa.tipo}
                    </span>
                    {' '}
                    <span className="badge badge-visibilidad">
                        {iniciativa.visibilidad}
                    </span>
                </div>
                <h3 className="card-title h5">
                    {iniciativa.titulo}
                </h3>
                <p className="card-text">
                    {iniciativa.resumen}
                </p>
                <p>
                    <strong>Categoría:</strong> {iniciativa.categoria}
                </p>
                <p>
                    <strong>Propietario:</strong> {iniciativa.propietario}
                </p>
                <p>
                    <strong>Competencias:</strong>{' '}
                    {iniciativa.competencias.join(', ')}
                </p>
                <p>
                    <strong>Estado:</strong> {iniciativa.estado}
                </p>
                <p className="mb-0">
                    <strong>Integrantes:</strong> {integrantes} de{' '}
                    {iniciativa.participantes} · {espaciosDisponibles}{' '}
                    {espaciosDisponibles === 1
                        ? 'espacio disponible'
                        : 'espacios disponibles'}
                </p>
            </div>
            <div className="card-footer bg-transparent d-flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary" disabled>
                    Ver detalle
                </button>
            </div>
        </article>
    )
}

export default TarjetaIniciativa