import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../contextos/AuthContext.jsx'
import { peticion } from '../servicios/api.js'

function EquipoIniciativa() {
  const { id } = useParams()
  const { usuario, cargando: cargandoSesion } = useAuth()

  const [iniciativa, setIniciativa] = useState(null)
  const [miembros, setMiembros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (cargandoSesion) return

    if (!usuario) {
      setCargando(false)
      return
    }

    let activo = true

    async function cargarEquipo() {
      setCargando(true)
      setError('')

      try {
        const datosIniciativa = await peticion(`/initiatives/${id}`)

        const esPropietario = datosIniciativa.owner?.id === usuario.id
        const esMiembro = (datosIniciativa.members || []).some(
          (miembro) => miembro.user?.id === usuario.id
        )

        if (!esPropietario && !esMiembro) {
          throw new Error('No tiene permiso para consultar este equipo.')
        }

        const datosEquipo = await peticion(`/initiatives/${id}/members`)

        if (activo) {
          setIniciativa(datosIniciativa)
          setMiembros(datosEquipo.items || [])
        }
      } catch (err) {
        if (activo) {
          setError(err.message)
          setIniciativa(null)
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarEquipo()

    return () => {
      activo = false
    }
  }, [id, usuario?.id, cargandoSesion])

  async function eliminarMiembro(idUsuario) {
    const confirmar = window.confirm(
      '¿Está seguro de que desea retirar este integrante del equipo?'
    )

    if (!confirmar) return

    setEliminando(idUsuario)
    setError('')
    setMensaje('')

    try {
      await peticion(`/initiatives/${id}/members/${idUsuario}`, {
        method: 'DELETE'
      })

      setMiembros((anteriores) =>
        anteriores.filter((miembro) => miembro.user.id !== idUsuario)
      )

      setMensaje('El integrante fue retirado del equipo correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setEliminando(null)
    }
  }

  function mostrarFecha(fecha) {
    return fecha
      ? new Date(fecha).toLocaleDateString('es-CR')
      : 'No especificada'
  }

  if (cargandoSesion || cargando) {
    return (
      <main className="container py-4">
        <p>Cargando equipo...</p>
      </main>
    )
  }

  if (!usuario) {
    return (
      <main className="container py-4">
        <h1>Equipo de la iniciativa</h1>
        <div className="alert alert-warning">
          Debe <Link to="/login">iniciar sesión</Link> para continuar.
        </div>
      </main>
    )
  }

  const esPropietario = iniciativa?.owner?.id === usuario.id

  return (
    <main className="container py-4">
      <Link
        to={`/iniciativas/${id}`}
        className="btn btn-outline-secondary mb-4"
      >
        Volver a la iniciativa
      </Link>

      <h1>Equipo de la iniciativa</h1>

      {iniciativa && (
        <p className="lead">{iniciativa.title}</p>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="alert alert-success" role="status">
          {mensaje}
        </div>
      )}

      {iniciativa && (
        <>
          <p>
            <strong>Integrantes:</strong> {miembros.length} de{' '}
            {iniciativa.capacity}
          </p>

          {miembros.length === 0 ? (
            <div className="alert alert-info">
              No hay integrantes registrados.
            </div>
          ) : (
            <ul className="list-group">
              {miembros.map((miembro) => (
                <li
                  key={miembro.user.id}
                  className="list-group-item"
                >
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <h2 className="h5">
                        {miembro.user.fullName}
                      </h2>

                      <p className="mb-1">
                        <strong>Rol:</strong> {miembro.role}
                      </p>

                      <p className="mb-2">
                        <strong>Incorporación:</strong>{' '}
                        {mostrarFecha(miembro.joinedAt)}
                      </p>

                      {miembro.user.id === iniciativa.owner.id && (
                        <span className="badge text-bg-secondary">
                          Propietario
                        </span>
                      )}

                      <div className="mt-2">
                        <Link
                          to={`/usuarios/${miembro.user.id}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          Ver perfil
                        </Link>
                      </div>
                    </div>

                    {esPropietario &&
                      miembro.user.id !== iniciativa.owner.id && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          disabled={eliminando !== null}
                          onClick={() => eliminarMiembro(miembro.user.id)}
                        >
                          {eliminando === miembro.user.id
                            ? 'Retirando...'
                            : 'Retirar'}
                        </button>
                      )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  )
}

export default EquipoIniciativa