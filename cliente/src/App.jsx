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
import MisIniciativas from './paginas/MisIniciativas.jsx'
import EditarSolicitud from './paginas/EditarSolicitud.jsx'
import EditarIniciativa from './paginas/EditarIniciativa.jsx'
import SolicitudesRecibidas from './paginas/SolicitudesRecibidas.jsx'
import EquipoIniciativa from './paginas/EquipoIniciativa.jsx'
import ConvertirProyecto from './paginas/ConvertirProyecto.jsx'
import Proyectos from './paginas/Proyectos.jsx'
import DetalleProyecto from './paginas/DetalleProyecto.jsx'

function App() {
  return (
    <>
      <Encabezado />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/iniciativas/:id" element={<DetalleIniciativa />} />
        <Route path="/iniciativas/:id/editar" element={<EditarIniciativa />} />
        <Route path="/publicar" element={<PublicarIniciativa />} />
        <Route path="/login" element={<IniciarSesion />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/mi-perfil" element={<MiPerfil />} />
        <Route path="/usuarios" element={<DirectorioUsuarios />} />
        <Route path="/usuarios/:id" element={<PerfilPublico />} />
        <Route path="/mis-iniciativas" element={<MisIniciativas />} />
        <Route path="/mis-solicitudes" element={<MisSolicitudes />} />
        <Route path="/solicitudes/:id/editar" element={<EditarSolicitud />} />
        <Route path="/iniciativas/:id/solicitudes" element={<SolicitudesRecibidas />} />
        <Route path="/iniciativas/:id/equipo" element={<EquipoIniciativa />} />
        <Route path="/iniciativas/:id/convertir" element={<ConvertirProyecto />} />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/proyectos/:id" element={<DetalleProyecto />} />
        <Route path="*" element={<main className="container py-4"><h1>Página no encontrada</h1><p>La dirección solicitada no existe.</p></main>} />
      </Routes>

      <Footer />
    </>
  )
}

export default App