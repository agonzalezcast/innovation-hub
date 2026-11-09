import { Routes, Route } from 'react-router-dom'

import Encabezado from './componentes/Encabezado.jsx'
import Footer from './componentes/Footer.jsx'
import Inicio from './paginas/Inicio.jsx'
import Catalogo from './paginas/Catalogo.jsx'
import DetalleIniciativa from './paginas/DetalleIniciativa.jsx'
import PublicarIniciativa from './paginas/PublicarIniciativa.jsx'
import IniciarSesion from './paginas/IniciarSesion.jsx'
import Registro from './paginas/Registro.jsx'
import MiPerfil from './paginas/MiPerfil.jsx'
import DirectorioUsuarios from './paginas/DirectorioUsuarios.jsx'
import PerfilPublico from './paginas/PerfilPublico.jsx'
import MisSolicitudes from './paginas/MisSolicitudes.jsx'

function App() {
  return (
    <>
      <Encabezado />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/iniciativas/:id" element={<DetalleIniciativa />} />
        <Route path="/publicar" element={<PublicarIniciativa />} />
        <Route path="/login" element={<IniciarSesion />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/mi-perfil" element={<MiPerfil />} />
        <Route path="/usuarios" element={<DirectorioUsuarios />} />
        <Route path="/usuarios/:id" element={<PerfilPublico />} />
        <Route path="/mis-solicitudes" element={<MisSolicitudes />} />
      </Routes>

      <Footer />
    </>
  )
}

export default App