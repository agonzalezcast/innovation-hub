import { useState } from 'react'

import Encabezado from './componentes/Encabezado.jsx'
import Footer from './componentes/Footer.jsx'
import ListaIniciativas from './componentes/iniciativas/ListaIniciativas.jsx'
import FiltrosIniciativas from './componentes/iniciativas/FiltrosIniciativas.jsx'

import iniciativas from '../../avance1/datos/iniciativas.json'

function App() {
  const [busqueda, setBusqueda] = useState('')
  const [tipo, setTipo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [competencia, setCompetencia] = useState('')

  const iniciativasPublicas = iniciativas.filter(
    (iniciativa) => iniciativa.visibilidad !== 'Privada'
  )

  const categorias = [
    ...new Set(iniciativasPublicas.map((iniciativa) => iniciativa.categoria))
  ].sort()

  const competencias = [
    ...new Set(
      iniciativasPublicas.flatMap((iniciativa) => iniciativa.competencias)
    )
  ].sort()

  const iniciativasFiltradas = iniciativasPublicas.filter((iniciativa) => {
    const texto = busqueda.toLowerCase().trim()

    const coincideBusqueda =
      texto === '' ||
      iniciativa.titulo.toLowerCase().includes(texto) ||
      iniciativa.resumen.toLowerCase().includes(texto) ||
      iniciativa.etiquetas.join(' ').toLowerCase().includes(texto)

    const coincideTipo =
      tipo === '' || iniciativa.tipo === tipo

    const coincideCategoria =
      categoria === '' || iniciativa.categoria === categoria

    const coincideCompetencia =
      competencia === '' || iniciativa.competencias.includes(competencia)

    return (
      coincideBusqueda &&
      coincideTipo &&
      coincideCategoria &&
      coincideCompetencia
    )
  })

  function limpiarFiltros() {
    setBusqueda('')
    setTipo('')
    setCategoria('')
    setCompetencia('')
  }

  return (
    <>
      <Encabezado />

      <main className="container py-4">
        <h1>Catálogo de iniciativas</h1>

        <div className="row g-4">
          <div className="col-12 col-lg-3">
            <FiltrosIniciativas
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              tipo={tipo}
              setTipo={setTipo}
              categoria={categoria}
              setCategoria={setCategoria}
              competencia={competencia}
              setCompetencia={setCompetencia}
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
              {iniciativasFiltradas.length === 1
                ? '1 iniciativa encontrada'
                : `${iniciativasFiltradas.length} iniciativas encontradas`}
            </h2>

            <ListaIniciativas iniciativas={iniciativasFiltradas} />
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default App