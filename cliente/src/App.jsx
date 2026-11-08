import { Routes, Route } from 'react-router-dom'

import Encabezado from './componentes/Encabezado.jsx'
import Footer from './componentes/Footer.jsx'
import Catalogo from './paginas/Catalogo.jsx'

function App() {
  return (
    <>
      <Encabezado />

      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/catalogo" element={<Catalogo />} />
      </Routes>

      <Footer />
    </>
  )
}

export default App