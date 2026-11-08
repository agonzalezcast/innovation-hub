import { useState } from 'react'

function FormularioPerfil({ usuario, competencias, onGuardar, guardando }) {
  const [formulario, setFormulario] = useState(() => ({
    firstName: usuario.firstName || '',
    lastName: usuario.lastName || '',
    secondLastName: usuario.secondLastName || '',
    memberType: usuario.memberType || 'Estudiante',
    career: usuario.career || '',
    description: usuario.description || '',
    skillIds: usuario.skills?.map((skill) => skill.id) || [],
    interests: usuario.interests?.join(', ') || '',
    availability: usuario.availability || '',
    portfolioUrl: usuario.portfolioUrl || ''
  }))

  function manejarCambio(evento) {
    const { name, value } = evento.target

    setFormulario({
      ...formulario,
      [name]: value
    })
  }

  function manejarCompetencia(evento) {
    const id = evento.target.value

    setFormulario({
      ...formulario,
      skillIds: evento.target.checked
        ? [...formulario.skillIds, id]
        : formulario.skillIds.filter((skillId) => skillId !== id)
    })
  }

  function manejarSubmit(evento) {
    evento.preventDefault()

    onGuardar({
      ...formulario,
      firstName: formulario.firstName.trim(),
      lastName: formulario.lastName.trim(),
      secondLastName: formulario.secondLastName.trim(),
      career: formulario.career.trim(),
      description: formulario.description.trim(),
      availability: formulario.availability.trim(),
      portfolioUrl: formulario.portfolioUrl.trim(),
      interests: formulario.interests
        .split(',')
        .map((interes) => interes.trim())
        .filter(Boolean)
    })
  }

  return (
    <form onSubmit={manejarSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor="firstName" className="form-label">Nombre</label>
          <input
            id="firstName"
            name="firstName"
            className="form-control"
            value={formulario.firstName}
            onChange={manejarCambio}
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="lastName" className="form-label">Primer apellido</label>
          <input
            id="lastName"
            name="lastName"
            className="form-control"
            value={formulario.lastName}
            onChange={manejarCambio}
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="secondLastName" className="form-label">
            Segundo apellido
          </label>
          <input
            id="secondLastName"
            name="secondLastName"
            className="form-control"
            value={formulario.secondLastName}
            onChange={manejarCambio}
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="memberType" className="form-label">Tipo de miembro</label>
          <select
            id="memberType"
            name="memberType"
            className="form-select"
            value={formulario.memberType}
            onChange={manejarCambio}
          >
            <option value="Estudiante">Estudiante</option>
            <option value="Docente">Docente</option>
            <option value="Administrativo">Administrativo</option>
          </select>
        </div>

        <div className="col-md-6">
          <label htmlFor="career" className="form-label">
            Carrera o área profesional
          </label>
          <input
            id="career"
            name="career"
            className="form-control"
            value={formulario.career}
            onChange={manejarCambio}
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="availability" className="form-label">
            Disponibilidad
          </label>
          <input
            id="availability"
            name="availability"
            className="form-control"
            value={formulario.availability}
            onChange={manejarCambio}
            placeholder="Ej. Fines de semana"
          />
        </div>

        <div className="col-12">
          <label htmlFor="description" className="form-label">
            Descripción personal
          </label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            rows="3"
            value={formulario.description}
            onChange={manejarCambio}
          />
        </div>

        <div className="col-12">
          <label className="form-label">Competencias</label>
          <div className="d-flex flex-wrap gap-3">
            {competencias.map((competencia) => (
              <div className="form-check" key={competencia.id}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`skill-${competencia.id}`}
                  value={competencia.id}
                  checked={formulario.skillIds.includes(competencia.id)}
                  onChange={manejarCompetencia}
                />
                <label
                  className="form-check-label"
                  htmlFor={`skill-${competencia.id}`}
                >
                  {competencia.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="col-12">
          <label htmlFor="interests" className="form-label">
            Intereses
          </label>
          <input
            id="interests"
            name="interests"
            className="form-control"
            value={formulario.interests}
            onChange={manejarCambio}
            placeholder="Ej. Educación, Tecnología, Sostenibilidad"
          />
          <div className="form-text">
            Separe los intereses con comas.
          </div>
        </div>

        <div className="col-12">
          <label htmlFor="portfolioUrl" className="form-label">
            Enlace al portafolio
          </label>
          <input
            type="url"
            id="portfolioUrl"
            name="portfolioUrl"
            className="form-control"
            value={formulario.portfolioUrl}
            onChange={manejarCambio}
            placeholder="https://github.com/usuario"
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary mt-4"
        disabled={guardando}
      >
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

export default FormularioPerfil