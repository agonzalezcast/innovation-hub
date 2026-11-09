import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contextos/AuthContext.jsx'
import { peticion } from '../../servicios/api.js'

const categorias = [
  'Tecnología',
  'Educación',
  'Sostenibilidad',
  'Impacto social',
  'Negocios y emprendimiento',
  'Salud y bienestar',
  'Cultura y creatividad',
  'Otro'
]

function FormularioIniciativa() {
  const navigate = useNavigate()
  const { usuario, cargando } = useAuth()

  const [competencias, setCompetencias] = useState([])
  const [formulario, setFormulario] = useState({
    title: '',
    type: 'Idea',
    summary: '',
    description: '',
    problem: '',
    beneficiaries: '',
    category: '',
    skillIds: [],
    capacity: 1,
    visibility: 'Pública',
    tags: ''
  })

  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarCompetencias() {
      try {
        const datos = await peticion('/skills')
        setCompetencias(datos.items || [])
      } catch (err) {
        setError(err.message)
      }
    }

    cargarCompetencias()
  }, [])

  function manejarCambio(evento) {
    const { name, value } = evento.target

    setFormulario({
      ...formulario,
      [name]: value
    })
  }

  function cambiarCompetencia(evento) {
    const id = evento.target.value

    if (!id || formulario.skillIds.includes(id)) return

    setFormulario({
      ...formulario,
      skillIds: [...formulario.skillIds, id]
    })
  }

  function quitarCompetencia(id) {
    setFormulario({
      ...formulario,
      skillIds: formulario.skillIds.filter((item) => item !== id)
    })
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setError('')

    if (formulario.skillIds.length === 0) {
      setError('Debe seleccionar al menos una competencia.')
      return
    }

    setEnviando(true)

    const datos = {
      title: formulario.title.trim(),
      type: formulario.type,
      summary: formulario.summary.trim(),
      description: formulario.description.trim(),
      problem: formulario.problem.trim(),
      beneficiaries: formulario.beneficiaries.trim(),
      category: formulario.category,
      skillIds: formulario.skillIds,
      capacity: Number(formulario.capacity),
      visibility: formulario.visibility,
      tags: formulario.tags
        .split(',')
        .map((etiqueta) => etiqueta.trim())
        .filter(Boolean)
    }

    try {
      const iniciativa = await peticion('/initiatives', {
        method: 'POST',
        body: JSON.stringify(datos)
      })

      navigate(`/iniciativas/${iniciativa.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return <p>Cargando sesión...</p>
  }

  if (!usuario) {
    return (
      <div className="alert alert-warning">
        Debe <Link to="/login">iniciar sesión</Link> para publicar una iniciativa.
      </div>
    )
  }

  return (
    <form onSubmit={manejarEnvio}>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="title" className="form-label">Título</label>
        <input
          id="title"
          name="title"
          className="form-control"
          value={formulario.title}
          onChange={manejarCambio}
          minLength={5}
          maxLength={80}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="type" className="form-label">Tipo</label>
        <select
          id="type"
          name="type"
          className="form-select"
          value={formulario.type}
          onChange={manejarCambio}
        >
          <option value="Idea">Idea</option>
          <option value="Necesidad">Necesidad</option>
          <option value="Reto">Reto</option>
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="summary" className="form-label">Resumen</label>
        <textarea
          id="summary"
          name="summary"
          className="form-control"
          rows="3"
          value={formulario.summary}
          onChange={manejarCambio}
          minLength={20}
          maxLength={200}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Descripción detallada
        </label>
        <textarea
          id="description"
          name="description"
          className="form-control"
          rows="5"
          value={formulario.description}
          onChange={manejarCambio}
          minLength={30}
          maxLength={1000}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="problem" className="form-label">
          Problema identificado (opcional)
        </label>
        <textarea
          id="problem"
          name="problem"
          className="form-control"
          rows="3"
          value={formulario.problem}
          onChange={manejarCambio}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="beneficiaries" className="form-label">
          Beneficiarios (opcional)
        </label>
        <input
          id="beneficiaries"
          name="beneficiaries"
          className="form-control"
          value={formulario.beneficiaries}
          onChange={manejarCambio}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="category" className="form-label">Categoría</label>
        <select
          id="category"
          name="category"
          className="form-select"
          value={formulario.category}
          onChange={manejarCambio}
          required
        >
          <option value="">Seleccione una categoría</option>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="skill" className="form-label">
          Competencias requeridas
        </label>
        <select
          id="skill"
          className="form-select"
          value=""
          onChange={cambiarCompetencia}
        >
          <option value="">Seleccione una competencia</option>
          {competencias.map((competencia) => (
            <option key={competencia.id} value={competencia.id}>
              {competencia.name}
            </option>
          ))}
        </select>

        <div className="mt-2 d-flex flex-wrap gap-2">
          {formulario.skillIds.map((id) => {
            const competencia = competencias.find((item) => item.id === id)

            return (
              <span key={id} className="badge text-bg-secondary">
                {competencia?.name || id}
                <button
                  type="button"
                  className="btn btn-sm text-white ms-1"
                  onClick={() => quitarCompetencia(id)}
                  aria-label={`Quitar ${competencia?.name || 'competencia'}`}
                >
                  ×
                </button>
              </span>
            )
          })}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="capacity" className="form-label">
          Cantidad máxima de integrantes (incluye al propietario)
        </label>
        <input
          type="number"
          id="capacity"
          name="capacity"
          className="form-control"
          min="1"
          max="20"
          value={formulario.capacity}
          onChange={manejarCambio}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="visibility" className="form-label">Visibilidad</label>
        <select
          id="visibility"
          name="visibility"
          className="form-select"
          value={formulario.visibility}
          onChange={manejarCambio}
        >
          <option value="Pública">Pública</option>
          <option value="Institucional">Institucional</option>
          <option value="Restringida">Restringida</option>
          <option value="Privada">Privada</option>
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="tags" className="form-label">
          Etiquetas (separadas por comas)
        </label>
        <input
          id="tags"
          name="tags"
          className="form-control"
          value={formulario.tags}
          onChange={manejarCambio}
          placeholder="innovación, educación, tecnología"
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={enviando}
      >
        {enviando ? 'Publicando...' : 'Publicar iniciativa'}
      </button>
    </form>
  )
}

export default FormularioIniciativa