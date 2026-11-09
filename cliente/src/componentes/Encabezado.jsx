import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contextos/AuthContext.jsx'

function Encabezado() {
  const { usuario, cargando, cerrarSesion } = useAuth()
  const navigate = useNavigate()

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
        <div className="container">
          <NavLink className="navbar-brand" to="/">
            Innovation Hub
          </NavLink>

          <div className="navbar-nav ms-auto flex-row flex-wrap gap-3">
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

            {!cargando && (
              usuario ? (
                <>
                  <span className="navbar-text">
                    {usuario.fullName}
                  </span>
                  <NavLink to="/mis-iniciativas" className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }>
                    Mis iniciativas
                  </NavLink>
                  <NavLink to="/mi-perfil" className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  >
                    Mi perfil
                  </NavLink>
                  <NavLink to="/mis-solicitudes" className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  >
                    Mis solicitudes
                  </NavLink>
                  <NavLink to="/proyectos" className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                  >
                    Mis proyectos
                  </NavLink>

                  <button type="button" className="btn btn-outline-light btn-sm" onClick={manejarCerrarSesion}>
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <NavLink to="/login" className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
                >
                  Iniciar sesión
                </NavLink>
              )
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Encabezado