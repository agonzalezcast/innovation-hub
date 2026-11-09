import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contextos/AuthContext.jsx'
import { peticion } from '../servicios/api.js'

function DirectorioUsuarios() {
  const { usuario, cargando } = useAuth()
  const idUsuario = usuario?.id

  const [usuarios, setUsuarios] = useState([])
  const [competencias, setCompetencias] = useState([])
  const [filtros, setFiltros] = useState({
    q: '',
    skill: '',
    career: '',
    availability: ''
  })
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [cargandoDatos, setCargandoDatos] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!idUsuario) return

    let activo = true
    peticion('/skills')
      .then((datos) => { if (activo) setCompetencias(datos.items) })
      .catch(() => { if (activo) setCompetencias([]) })
    return () => { activo = false }
  }, [idUsuario])

  useEffect(() => {
    if (!idUsuario) return
    let activo = true

    async function cargarUsuarios() {
      setCargandoDatos(true)
      setError('')

      const parametros = new URLSearchParams({
        page: pagina,
        size: 9
      })

      Object.entries(filtros).forEach(([campo, valor]) => {
        if (valor.trim()) {
          parametros.set(campo, valor.trim())
        }
      })

      try {
        const datos = await peticion(`/users?${parametros}`)
        if (activo) {
          setUsuarios(datos.items || [])
          setTotalPaginas(datos.totalPages || 1)
        }
      } catch (err) {
        if (activo) {
          setError(err.message)
          setUsuarios([])
        }
      } finally {
        if (activo) setCargandoDatos(false)
      }
    }

    cargarUsuarios()
    return () => { activo = false }
  }, [idUsuario, filtros, pagina])

  function manejarCambio(evento) {
    const { name, value } = evento.target
    setBusquedaActual(name, value)
  }

  function setBusquedaActual(nombre, valor) {
    setFiltros((actuales) => ({
      ...actuales,
      [nombre]: valor
    }))
    setPagina(1)
  }

  function buscar(evento) {
    evento.preventDefault()
    setBusquedaActual('q', busqueda)
  }

  if (cargando) {
    return <main className="container py-5">Verificando sesión...</main>
  }

  if (!usuario) {
    return (
      <main className="container py-5">
        <div className="alert alert-warning">
          Debe <Link to="/login">iniciar sesión</Link> para consultar el directorio.
        </div>
      </main>
    )
  }

  return (
    <main className="container py-5">
      <h1 className="mb-3">Directorio de usuarios</h1>
      <p className="text-body-secondary">
        Encuentre personas con las competencias necesarias para colaborar.
      </p>

      <form onSubmit={buscar} className="row g-3 mb-4">
        <div className="col-md-6">
          <label htmlFor="buscarUsuario" className="form-label">
            Buscar por nombre
          </label>
          <input
            id="buscarUsuario"
            className="form-control"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Nombre del usuario"
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="skill" className="form-label">
            Competencia
          </label>
          <select
            id="skill"
            name="skill"
            className="form-select"
            value={filtros.skill}
            onChange={manejarCambio}
          >
            <option value="">Todas</option>
            {competencias.map((competencia) => (
              <option key={competencia.id} value={competencia.id}>
                {competencia.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label htmlFor="careerFiltro" className="form-label">
            Carrera
          </label>
          <input
            id="careerFiltro"
            name="career"
            className="form-control"
            value={filtros.career}
            onChange={manejarCambio}
            placeholder="Ej. Ingeniería de Software"
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="availabilityFiltro" className="form-label">
            Disponibilidad
          </label>
          <input
            id="availabilityFiltro"
            name="availability"
            className="form-control"
            value={filtros.availability}
            onChange={manejarCambio}
            placeholder="Ej. Fines de semana"
          />
        </div>

        <div className="col-12">
          <button className="btn btn-primary" type="submit">
            Buscar
          </button>
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {cargandoDatos ? (
        <p>Cargando usuarios...</p>
      ) : usuarios.length === 0 && !error ? (
        <div className="alert alert-info">
          No se encontraron usuarios con los filtros seleccionados.
        </div>
      ) : (
        <div className="row g-3">
          {usuarios.map((persona) => (
            <div className="col-md-6 col-lg-4" key={persona.id}>
              <div className="card h-100">
                <div className="card-body">
                  <h2 className="h5">{persona.fullName}</h2>
                  <p className="mb-1">{persona.memberType}</p>
                  <p className="text-body-secondary">{persona.career}</p>

                  <div className="mb-3">
                    {persona.skills?.map((skill) => (
                      <span
                        className="badge text-bg-secondary me-1 mb-1"
                        key={skill.id}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/usuarios/${persona.id}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!cargandoDatos && !error && totalPaginas > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <button
            className="btn btn-outline-secondary"
            disabled={pagina === 1}
            onClick={() => setPagina(pagina - 1)}
          >
            Anterior
          </button>

          <span>Página {pagina} de {totalPaginas}</span>

          <button
            className="btn btn-outline-secondary"
            disabled={pagina >= totalPaginas}
            onClick={() => setPagina(pagina + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </main>
  )
}

export default DirectorioUsuarios