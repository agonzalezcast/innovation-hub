import TarjetaIniciativa from './TarjetaIniciativa.jsx'

function ListaIniciativas({ iniciativas }) {
  if (iniciativas.length === 0) {
    return (
      <p className="alert alert-info">
        No se encontraron iniciativas.
      </p>
    )
  }

  return (
    <div className="row g-4">
      {iniciativas.map((iniciativa) => (
        <div
          className="col-12 col-md-6 col-lg-4"
          key={iniciativa.id}
        >
          <TarjetaIniciativa iniciativa={iniciativa} />
        </div>
      ))}
    </div>
  )
}

export default ListaIniciativas