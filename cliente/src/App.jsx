import Encabezado from './componentes/Encabezado.jsx'
import Footer from './componentes/Footer.jsx'

function App() {
  return (
    <>
      <Encabezado />

      <main className="container py-4">
        <h1>Innovation Hub</h1>

        <p>
          Plataforma para compartir ideas, necesidades y retos
          dentro de la comunidad universitaria.
        </p>
      </main>

      <Footer />
    </>
  )
}

export default App