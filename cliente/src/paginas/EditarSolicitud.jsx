import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { peticion } from '../servicios/api.js'
import FormularioSolicitud from '../componentes/solicitudes/FormularioSolicitud.jsx'

function EditarSolicitud() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    async function cargar() {
      try {
        const solicitud = await peticion(`/requests/${id}`)
        const iniciativa = await peticion(`/initiatives/${solicitud.initiative.id}`)
        if (activo) setDatos({ solicitud, iniciativa })
      } catch (err) {
        if (activo) setError(err.message)
      }
    }
    cargar()
    return () => { activo = false }
  }, [id])

  return <main className="container py-4">
    <Link to="/mis-solicitudes" className="btn btn-outline-secondary mb-4">Volver a mis solicitudes</Link>
    {error ? <div className="alert alert-danger" role="alert">{error}</div>
      : !datos ? <p>Cargando solicitud...</p>
        : datos.solicitud.status !== 'Pendiente' ? <p>La solicitud ya no está pendiente.</p>
          : <FormularioSolicitud solicitud={datos.solicitud} competencias={datos.iniciativa.skills || []} alGuardar={() => navigate('/mis-solicitudes')} />}
  </main>
}

export default EditarSolicitud
