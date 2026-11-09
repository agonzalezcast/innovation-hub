import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contextos/AuthContext.jsx'
import { peticion } from '../servicios/api.js'

function MisIniciativas() {
  const { usuario, cargando: cargandoSesion } = useAuth()
  const [iniciativas, setIniciativas] = useState([])
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (cargandoSesion || !usuario) return
    let activo = true
    async function cargar() {
      setCargando(true)
      setError('')
      try {
        const datos = await peticion(`/initiatives/mine?page=${pagina}&size=9`)
        if (activo) { setIniciativas(datos.items); setTotalPaginas(datos.totalPages) }
      } catch (err) {
        if (activo) setError(err.message)
      } finally {
        if (activo) setCargando(false)
      }
    }
    cargar()
    return () => { activo = false }
  }, [usuario, cargandoSesion, pagina])

  if (cargandoSesion) return <main className="container py-4"><p>Cargando sesión...</p></main>
  if (!usuario) return <main className="container py-4"><h1>Mis iniciativas</h1><p>Debe <Link to="/login">iniciar sesión</Link> para consultar sus iniciativas.</p></main>

  return <main className="container py-4">
    <h1>Mis iniciativas</h1>
    {error ? <div className="alert alert-danger" role="alert">{error}</div>
      : cargando ? <p>Cargando iniciativas...</p>
        : iniciativas.length === 0 ? <p>No tiene iniciativas registradas.</p>
          : <div className="row g-3">{iniciativas.map((iniciativa) => <div className="col-12 col-md-6" key={iniciativa.id}>
            <article className="card h-100"><div className="card-body">
              <h2 className="h5">{iniciativa.title}</h2>
              <p>{iniciativa.summary}</p><p>{iniciativa.status} · {iniciativa.visibility}</p>
              <Link to={`/iniciativas/${iniciativa.id}`} className="btn btn-outline-primary">Ver detalle</Link>
            </div></article>
          </div>)}</div>}
    {totalPaginas > 1 && <nav className="d-flex gap-3 mt-4" aria-label="Paginación de iniciativas">
      <button type="button" className="btn btn-outline-secondary" disabled={pagina <= 1 || cargando} onClick={() => setPagina((actual) => actual - 1)}>Anterior</button>
      <span>Página {pagina} de {totalPaginas}</span>
      <button type="button" className="btn btn-outline-secondary" disabled={pagina >= totalPaginas || cargando} onClick={() => setPagina((actual) => actual + 1)}>Siguiente</button>
    </nav>}
  </main>
}

export default MisIniciativas
