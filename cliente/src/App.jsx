import Encabezado from './componentes/Encabezado.jsx'
import Footer from './componentes/Footer.jsx'
import ListaIniciativas from './componentes/iniciativas/ListaIniciativas.jsx'

import iniciativas from '../../avance1/datos/iniciativas.json'

function App() {
  const iniciativasPublicas = iniciativas.filter(
    (iniciativa) => iniciativa.visibilidad !== 'Privada'
  )

  return (
    <>
      <Encabezado />

      <main className="container py-4">
        <h1>Catálogo de iniciativas</h1>

        <h2 className="h5 mb-4">
          {iniciativasPublicas.length} iniciativas encontradas
        </h2>

        <ListaIniciativas iniciativas={iniciativasPublicas} />
      </main>

      <Footer />
    </>
  )
}

export default App