import FormularioIniciativa from '../componentes/iniciativas/FormularioIniciativa.jsx'

function PublicarIniciativa() {
  return (
    <main className="container py-4">
      <h1>Publicar iniciativa</h1>
      <p className="text-body-secondary">
        Complete la información para registrar una nueva iniciativa.
      </p>

      <FormularioIniciativa />
    </main>
  )
}

export default PublicarIniciativa