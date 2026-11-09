
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { peticion } from '../servicios/api.js'

function Registro() {
  const [formulario, setFormulario] = useState({
    firstName: '',
    lastName: '',
    secondLastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    memberType: '',
    career: '',
    acceptTerms: false
  })

  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')

  const navigate = useNavigate()
  const [enviando, setEnviando] = useState(false)

  function manejarCambio(evento) {
    const { name, value, type, checked } = evento.target

    setFormulario({
      ...formulario,
      [name]: type === 'checkbox' ? checked : value
    })

    setErrores({
      ...errores,
      [name]: ''
    })
  }

  function validarFormulario() {
    const nuevosErrores = {}

    if (!formulario.firstName.trim()) {
      nuevosErrores.firstName = 'Ingrese su nombre.'
    }

    if (!formulario.lastName.trim()) {
      nuevosErrores.lastName = 'Ingrese su primer apellido.'
    }

    if (!formulario.email.trim()) {
      nuevosErrores.email = 'Ingrese su correo electrónico.'
    }

    if (formulario.password.length < 8) {
      nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres.'
    }

    if (formulario.password !== formulario.passwordConfirmation) {
      nuevosErrores.passwordConfirmation = 'Las contraseñas no coinciden.'
    }

    if (!formulario.memberType) {
      nuevosErrores.memberType = 'Seleccione un tipo de miembro.'
    }

    if (!formulario.career.trim()) {
      nuevosErrores.career = 'Ingrese su carrera o área profesional.'
    }

    if (!formulario.acceptTerms) {
      nuevosErrores.acceptTerms = 'Debe aceptar los términos y condiciones.'
    }

    return nuevosErrores
  }

  async function manejarSubmit(evento) {
    evento.preventDefault()
    setMensaje('')

    const nuevosErrores = validarFormulario()
    setErrores(nuevosErrores)

    if (Object.keys(nuevosErrores).length > 0) {
      return
    }

    setEnviando(true)

    try {
      await peticion('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: formulario.firstName.trim(),
          lastName: formulario.lastName.trim(),
          secondLastName: formulario.secondLastName.trim(),
          email: formulario.email.trim(),
          password: formulario.password,
          passwordConfirmation: formulario.passwordConfirmation,
          memberType: formulario.memberType,
          career: formulario.career.trim(),
          acceptTerms: formulario.acceptTerms
        })
      })

      navigate('/login', {
        state: {
          mensaje: 'Cuenta creada correctamente. Ya puede iniciar sesión.'
        }
      })
    } catch (err) {
      setMensaje(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h3 mb-3">Crear cuenta</h1>

              <p className="text-body-secondary">
                Regístrese para participar en las iniciativas de Innovation Hub.
              </p>

              {mensaje && (
                <div className="alert alert-danger" role="alert">
                  {mensaje}
                </div>
              )}

              <form onSubmit={manejarSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="form-control"
                      value={formulario.firstName}
                      onChange={manejarCambio}
                    />
                    {errores.firstName && (
                      <div className="text-danger small">{errores.firstName}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">
                      Primer apellido
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="form-control"
                      value={formulario.lastName}
                      onChange={manejarCambio}
                    />
                    {errores.lastName && (
                      <div className="text-danger small">{errores.lastName}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="secondLastName" className="form-label">
                      Segundo apellido (opcional)
                    </label>
                    <input
                      type="text"
                      id="secondLastName"
                      name="secondLastName"
                      className="form-control"
                      value={formulario.secondLastName}
                      onChange={manejarCambio}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="emailRegistro" className="form-label">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      id="emailRegistro"
                      name="email"
                      className="form-control"
                      value={formulario.email}
                      onChange={manejarCambio}
                    />
                    {errores.email && (
                      <div className="text-danger small">{errores.email}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="passwordRegistro" className="form-label">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      id="passwordRegistro"
                      name="password"
                      className="form-control"
                      value={formulario.password}
                      onChange={manejarCambio}
                    />
                    {errores.password && (
                      <div className="text-danger small">{errores.password}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="passwordConfirmation" className="form-label">
                      Confirmar contraseña
                    </label>
                    <input
                      type="password"
                      id="passwordConfirmation"
                      name="passwordConfirmation"
                      className="form-control"
                      value={formulario.passwordConfirmation}
                      onChange={manejarCambio}
                    />
                    {errores.passwordConfirmation && (
                      <div className="text-danger small">
                        {errores.passwordConfirmation}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="memberType" className="form-label">
                      Tipo de miembro
                    </label>
                    <select
                      id="memberType"
                      name="memberType"
                      className="form-select"
                      value={formulario.memberType}
                      onChange={manejarCambio}
                    >
                      <option value="">Seleccione una opción</option>
                      <option value="Estudiante">Estudiante</option>
                      <option value="Docente">Docente</option>
                      <option value="Administrativo">Administrativo</option>
                    </select>
                    {errores.memberType && (
                      <div className="text-danger small">{errores.memberType}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="career" className="form-label">
                      Carrera o área profesional
                    </label>
                    <input
                      type="text"
                      id="career"
                      name="career"
                      className="form-control"
                      value={formulario.career}
                      onChange={manejarCambio}
                    />
                    {errores.career && (
                      <div className="text-danger small">{errores.career}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="acceptTerms"
                        name="acceptTerms"
                        className="form-check-input"
                        checked={formulario.acceptTerms}
                        onChange={manejarCambio}
                      />
                      <label htmlFor="acceptTerms" className="form-check-label">
                        Acepto los términos y condiciones
                      </label>
                    </div>
                    {errores.acceptTerms && (
                      <div className="text-danger small">{errores.acceptTerms}</div>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 mt-4" disabled={enviando}>
                  {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>

              <p className="text-center mt-3 mb-0">
                ¿Ya tiene una cuenta?{' '}
                <Link to="/login">Iniciar sesión</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Registro
