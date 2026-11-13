import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contextos/AuthContext.jsx'

function Encabezado() {
  const { usuario, cargando, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  function cerrarMenu(event) {
    event.currentTarget.closest('details').open = false
  }

  async function manejarCerrarSesion() {
    try {
      await cerrarSesion()
      navigate('/login')
    } catch {
      navigate('/login')
    }
  }

  return (
    <header className="site-header">
      <nav className="navbar navbar-expand-lg" data-bs-theme="dark" aria-label="Principal">
        <div className="container d-flex flex-wrap align-items-center gap-3">
          <NavLink className="navbar-brand" to="/">
            Innovation Hub
          </NavLink>

          <div className="navbar-nav flex-row flex-wrap gap-3">
            <NavLink to="/" end className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }>
              Inicio
            </NavLink>

            <NavLink to="/catalogo" className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }>
              Catálogo
            </NavLink>

            {!cargando && usuario && (
              <NavLink to="/usuarios" className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              >
                Usuarios
              </NavLink>
            )}

            <NavLink to="/publicar" className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }>
              Publicar iniciativa
            </NavLink>

          </div>

          {!cargando && (
            usuario ? (
              <details className="position-relative ms-auto">
                <summary className="btn btn-outline-light btn-sm">{usuario.fullName}</summary>
                <div className="dropdown-menu dropdown-menu-end show" style={{ minWidth: '12rem' }}>
                  <NavLink className="dropdown-item" to="/mis-iniciativas" onClick={cerrarMenu}>Mis iniciativas</NavLink>
                  <NavLink className="dropdown-item" to="/mi-perfil" onClick={cerrarMenu}>Mi perfil</NavLink>
                  <NavLink className="dropdown-item" to="/mis-solicitudes" onClick={cerrarMenu}>Mis solicitudes</NavLink>
                  <NavLink className="dropdown-item" to="/proyectos" onClick={cerrarMenu}>Mis proyectos</NavLink>
                  <div className="dropdown-divider" />
                  <button type="button" className="dropdown-item" onClick={(event) => {
                    cerrarMenu(event)
                    manejarCerrarSesion()
                  }}>Cerrar sesión</button>
                </div>
              </details>
            ) : (
              <NavLink to="/login" className={({ isActive }) =>
                `nav-link ms-auto ${isActive ? 'active' : ''}`
              }>
                Iniciar sesión
              </NavLink>
            )
          )}
        </div>
      </nav>
    </header>
  )
}

export default Encabezado