import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { peticion } from '../servicios/api.js'
import { useAuth } from '../contextos/AuthContext.jsx'
import FormularioIniciativa from '../componentes/iniciativas/FormularioIniciativa.jsx'

function EditarIniciativa() {
  const { id } = useParams()
  const { usuario, cargando } = useAuth()
  const [iniciativa, setIniciativa] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (cargando || !usuario) return
    let activo = true
    peticion(`/initiatives/${id}`)
      .then((datos) => { if (activo) setIniciativa(datos) })
      .catch((err) => { if (activo) setError(err.message) })
    return () => { activo = false }
  }, [id, usuario, cargando])

  return <main className="container py-4">
    <Link to={`/iniciativas/${id}`} className="btn btn-outline-secondary mb-4">Volver a la iniciativa</Link>
    <h1>Modificar iniciativa</h1>
    {cargando ? <p>Cargando sesión...</p>
      : !usuario ? <p>Debe iniciar sesión para modificar una iniciativa.</p>
        : error ? <div className="alert alert-danger" role="alert">{error}</div>
          : !iniciativa ? <p>Cargando iniciativa...</p>
            : iniciativa.owner?.id !== usuario.id ? <p>No tiene permiso para modificar esta iniciativa.</p>
              : <FormularioIniciativa iniciativa={iniciativa} />}
  </main>
}

export default EditarIniciativa
