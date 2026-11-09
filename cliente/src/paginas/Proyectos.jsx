import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contextos/AuthContext.jsx'
import { peticion } from '../servicios/api.js'

function Proyectos() {
  const { usuario, cargando: cargandoSesion } = useAuth()
  const idUsuario = usuario?.id
  const [proyectos, setProyectos] = useState([])
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (cargandoSesion) return

    if (!idUsuario) return

    let activo = true

    async function cargarProyectos() {
      setCargando(true)
      setError('')

      try {
        const datos = await peticion(`/projects?page=${pagina}&size=9`)

        if (activo) {
          setProyectos(datos.items || [])
          setTotalPaginas(datos.totalPages || 1)
        }
      } catch (err) {
        if (activo) setError(err.message)
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarProyectos()

    return () => {
      activo = false
    }
  }, [idUsuario, cargandoSesion, pagina])

  if (cargandoSesion) {
    return <main className="container py-4">Verificando sesión...</main>
  }

  if (!usuario) {
    return (
      <main className="container py-4">
        <h1>Mis proyectos</h1>
        <div className="alert alert-warning">
          Debe <Link to="/login">iniciar sesión</Link> para consultar proyectos.
        </div>
      </main>
    )
  }

  return (
    <main className="container py-4">
      <h1>Mis proyectos</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {cargando ? (
        <p>Cargando proyectos...</p>
      ) : !error && proyectos.length === 0 ? (
        <div className="alert alert-info">No tiene proyectos disponibles.</div>
      ) : (
        <div className="row g-3">
          {proyectos.map((proyecto) => (
            <div className="col-12 col-md-6 col-lg-4" key={proyecto.id}>
              <article className="card h-100">
                <div className="card-body">
                  <h2 className="h5">{proyecto.name}</h2>
                  <p>{proyecto.objective}</p>
                  <p><strong>Estado:</strong> {proyecto.status}</p>
                  <p>
                    <strong>Tecnologías:</strong>{' '}
                    {(proyecto.technologies || []).join(', ')}
                  </p>
                </div>
                <div className="card-footer bg-transparent">
                  <Link to={`/proyectos/${proyecto.id}`} className="btn btn-primary">
                    Ver proyecto
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}

      {!cargando && !error && totalPaginas > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <button className="btn btn-outline-secondary" type="button"
            disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
            Anterior
          </button>
          <span>Página {pagina} de {totalPaginas}</span>
          <button className="btn btn-outline-secondary" type="button"
            disabled={pagina >= totalPaginas} onClick={() => setPagina(pagina + 1)}>
            Siguiente
          </button>
        </div>
      )}
    </main>
  )
}

export default Proyectos