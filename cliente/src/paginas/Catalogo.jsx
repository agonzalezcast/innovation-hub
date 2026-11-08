import { useEffect, useState } from 'react'

import ListaIniciativas from '../componentes/iniciativas/ListaIniciativas.jsx'
import FiltrosIniciativas from '../componentes/iniciativas/FiltrosIniciativas.jsx'
import { peticion } from '../servicios/api.js'
import { useAuth } from '../contextos/AuthContext.jsx'

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

function Catalogo() {
  const { usuario, cargando } = useAuth()

  const [iniciativas, setIniciativas] = useState([])
  const [competencias, setCompetencias] = useState([])

  const [busqueda, setBusqueda] = useState('')
  const [tipo, setTipo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [competencia, setCompetencia] = useState('')

  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  const [cargandoDatos, setCargandoDatos] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarCompetencias() {
      try {
        const datos = await peticion('/skills')
        setCompetencias(datos.items || [])
      } catch {
        setCompetencias([])
      }
    }

    cargarCompetencias()
  }, [])

  useEffect(() => {
    if (cargando) return

    let activo = true

    async function cargarIniciativas() {
      setCargandoDatos(true)
      setError('')

      const parametros = new URLSearchParams({
        page: pagina,
        size: 9
      })

      if (busqueda.trim()) parametros.set('q', busqueda.trim())
      if (tipo) parametros.set('type', tipo)
      if (categoria) parametros.set('category', categoria)
      if (competencia) parametros.set('skill', competencia)

      try {
        const datos = await peticion(`/initiatives?${parametros}`)

        if (activo) {
          setIniciativas(datos.items || [])
          setTotalPaginas(datos.totalPages || 1)
        }
      } catch (err) {
        if (activo) {
          setError(err.message)
          setIniciativas([])
        }
      } finally {
        if (activo) setCargandoDatos(false)
      }
    }

    cargarIniciativas()

    return () => {
      activo = false
    }
  }, [busqueda, tipo, categoria, competencia, pagina, usuario?.id, cargando])

  function limpiarFiltros() {
    setBusqueda('')
    setTipo('')
    setCategoria('')
    setCompetencia('')
    setPagina(1)
  }

  function cambiarFiltro(actualizar) {
    return (valor) => {
      actualizar(valor)
      setPagina(1)
    }
  }

  return (
    <main className="container py-4">
      <h1>Catálogo de iniciativas</h1>

      <div className="row g-4">
        <div className="col-12 col-lg-3">
          <FiltrosIniciativas
            busqueda={busqueda}
            setBusqueda={cambiarFiltro(setBusqueda)}
            tipo={tipo}
            setTipo={cambiarFiltro(setTipo)}
            categoria={categoria}
            setCategoria={cambiarFiltro(setCategoria)}
            competencia={competencia}
            setCompetencia={cambiarFiltro(setCompetencia)}
            categorias={categorias}
            competencias={competencias}
            onLimpiar={limpiarFiltros}
          />
        </div>

        <section
          className="col-12 col-lg-9"
          aria-labelledby="titulo-resultados"
        >
          <h2 id="titulo-resultados" className="mb-4">
            Resultados
          </h2>

          {cargandoDatos ? (
            <p>Cargando iniciativas...</p>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : (
            <>
              <p>
                {iniciativas.length} iniciativas en esta página
              </p>

              <ListaIniciativas iniciativas={iniciativas} />

              {totalPaginas > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={pagina === 1}
                    onClick={() => setPagina(pagina - 1)}
                  >
                    Anterior
                  </button>

                  <span>
                    Página {pagina} de {totalPaginas}
                  </span>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={pagina >= totalPaginas}
                    onClick={() => setPagina(pagina + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default Catalogo