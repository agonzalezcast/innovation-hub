import { NavLink } from 'react-router-dom'

function Encabezado() {
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
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Encabezado