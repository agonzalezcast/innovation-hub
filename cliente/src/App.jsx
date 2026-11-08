import Encabezado from './componentes/Encabezado.jsx'
import Footer from './componentes/Footer.jsx'
import TarjetaIniciativa from './componentes/iniciativas/TarjetaIniciativa.jsx'

function App() {
  const iniciativaEjemplo = {
    id: 1,
    titulo: 'Plataforma de tutorías universitarias',
    tipo: 'Idea',
    resumen: 'Plataforma para conectar estudiantes que necesitan apoyo académico con estudiantes que pueden brindar tutorías.',
    categoria: 'Educación',
    competencias: ['JavaScript', 'Comunicación', 'Trabajo en equipo'],
    participantes: 3,
    visibilidad: 'Pública',
    propietario: 'María Rodríguez',
    estado: 'Publicada',
    miembros: [{ idUsuario: 2, nombre: 'María Rodríguez' }]
  }

  return (
    <>
      <Encabezado />

      <main className="container py-4">
        <h1>Catálogo de iniciativas</h1>

        <div className="row g-4">
          <div className="col-12 col-md-6 col-lg-4">
            <TarjetaIniciativa iniciativa={iniciativaEjemplo} />
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default App