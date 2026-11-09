import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contextos/AuthContext.jsx'
import { peticion } from '../servicios/api.js'

function ConvertirProyecto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario, cargando: cargandoSesion } = useAuth()
  const idUsuario = usuario?.id

  const [iniciativa, setIniciativa] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const [formulario, setFormulario] = useState({
    name: '',
    objective: '',
    description: '',
    technologies: '',
    startDate: '',
    estimatedEndDate: '',
    repositoryUrl: ''
  })

  useEffect(() => {
    if (cargandoSesion) return

    if (!idUsuario) return

    let activo = true

    async function cargarIniciativa() {
      try {
        const datos = await peticion(`/initiatives/${id}`)

        if (datos.owner?.id !== idUsuario) {
          throw new Error('Solo el propietario puede convertir esta iniciativa.')
        }

        if (datos.status === 'Convertida en proyecto') {
          throw new Error('Esta iniciativa ya fue convertida en proyecto.')
        }

        if ((datos.members || []).length < 2) {
          throw new Error(
            'La iniciativa necesita al menos un integrante adicional para convertirse.'
          )
        }

        if (activo) {
          setIniciativa(datos)
          setFormulario((anterior) => ({
            ...anterior,
            name: datos.title,
            description: datos.description
          }))
        }
      } catch (err) {
        if (activo) setError(err.message)
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarIniciativa()

    return () => {
      activo = false
    }
  }, [id, idUsuario, cargandoSesion])

  function manejarCambio(evento) {
    const { name, value } = evento.target
    setFormulario({ ...formulario, [name]: value })
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setError('')
    setEnviando(true)

    const datos = {
      name: formulario.name.trim(),
      objective: formulario.objective.trim(),
      description: formulario.description.trim(),
      technologies: formulario.technologies
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      startDate: formulario.startDate,
      estimatedEndDate: formulario.estimatedEndDate || null,
      repositoryUrl: formulario.repositoryUrl.trim() || null
    }

    if (datos.technologies.length === 0) {
      setError('Ingrese al menos una tecnología.')
      setEnviando(false)
      return
    }

    if (datos.estimatedEndDate && datos.estimatedEndDate < datos.startDate) {
      setError('La fecha estimada de finalización no puede ser anterior al inicio.')
      setEnviando(false)
      return
    }

    try {
      const proyecto = await peticion(`/initiatives/${id}/convert`, {
        method: 'POST',
        body: JSON.stringify(datos)
      })

      navigate(`/proyectos/${proyecto.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (cargandoSesion || (usuario && cargando)) {
    return <main className="container py-4">Cargando iniciativa...</main>
  }

  if (!usuario) {
    return (
      <main className="container py-4">
        Debe <Link to="/login">iniciar sesión</Link> para continuar.
      </main>
    )
  }

  return (
    <main className="container py-4">
      <Link to={`/iniciativas/${id}`} className="btn btn-outline-secondary mb-4">
        Volver a la iniciativa
      </Link>

      <h1>Convertir iniciativa en proyecto</h1>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {iniciativa && (
        <form onSubmit={manejarEnvio}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Nombre del proyecto</label>
            <input id="name" name="name" className="form-control"
              value={formulario.name} onChange={manejarCambio} required />
          </div>

          <div className="mb-3">
            <label htmlFor="objective" className="form-label">Objetivo</label>
            <textarea id="objective" name="objective" className="form-control"
              value={formulario.objective} onChange={manejarCambio} required />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">Descripción</label>
            <textarea id="description" name="description" className="form-control"
              rows="4" value={formulario.description} onChange={manejarCambio} required />
          </div>

          <div className="mb-3">
            <label htmlFor="technologies" className="form-label">
              Tecnologías (separadas por comas)
            </label>
            <input id="technologies" name="technologies" className="form-control"
              placeholder="React, Node.js, MongoDB"
              value={formulario.technologies} onChange={manejarCambio} required />
          </div>

          <div className="mb-3">
            <label htmlFor="startDate" className="form-label">Fecha de inicio</label>
            <input type="date" id="startDate" name="startDate"
              className="form-control" value={formulario.startDate}
              onChange={manejarCambio} required />
          </div>

          <div className="mb-3">
            <label htmlFor="estimatedEndDate" className="form-label">
              Fecha estimada de finalización (opcional)
            </label>
            <input type="date" id="estimatedEndDate" name="estimatedEndDate"
              className="form-control" value={formulario.estimatedEndDate}
              onChange={manejarCambio} />
          </div>

          <div className="mb-3">
            <label htmlFor="repositoryUrl" className="form-label">
              URL del repositorio GitHub (opcional)
            </label>
            <input type="url" id="repositoryUrl" name="repositoryUrl"
              className="form-control" placeholder="https://github.com/usuario/repositorio"
              value={formulario.repositoryUrl} onChange={manejarCambio} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Convirtiendo...' : 'Crear proyecto'}
          </button>
        </form>
      )}
    </main>
  )
}

export default ConvertirProyecto