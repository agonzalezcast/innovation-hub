import { useState } from 'react'
import { peticion } from '../../servicios/api.js'

function FormularioSolicitud({ iniciativaId, competencias = [], solicitud = null, alGuardar }) {
  const [formulario, setFormulario] = useState({
    message: solicitud?.message || '', mainSkillId: solicitud?.mainSkill?.id || '',
    role: solicitud?.role || '', availability: solicitud?.availability || ''
  })
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)
  const [error, setError] = useState('')

  function manejarCambio(evento) {
    const { name, value } = evento.target
    setFormulario((anterior) => ({ ...anterior, [name]: value }))
  }

  async function manejarSubmit(evento) {
    evento.preventDefault()
    const datos = { message: formulario.message.trim(), mainSkillId: formulario.mainSkillId,
      role: formulario.role.trim(), availability: formulario.availability.trim() }
    if (datos.message.length < 30 || datos.role.length < 3 || datos.availability.length < 3) {
      setError('Revise el mensaje, el rol y la disponibilidad.')
      return
    }
    setError('')
    setEnviando(true)
    try {
      await peticion(solicitud ? `/requests/${solicitud.id}` : '/requests', {
        method: solicitud ? 'PUT' : 'POST',
        body: JSON.stringify(solicitud ? datos : { ...datos, initiativeId: iniciativaId })
      })
      if (alGuardar) alGuardar()
      else setEnviada(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (enviada) return <div className="alert alert-success" role="status">Solicitud enviada correctamente.</div>
  return (
    <div className="card shadow-sm"><div className="card-body">
      <h2 className="h4">{solicitud ? 'Modificar solicitud' : 'Solicitar participación'}</h2>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <form onSubmit={manejarSubmit}>
        <div className="mb-3"><label htmlFor="message" className="form-label">Mensaje</label>
          <textarea id="message" name="message" className="form-control" rows="3" value={formulario.message} onChange={manejarCambio} minLength={30} maxLength={500} required />
        </div>
        <div className="mb-3"><label htmlFor="mainSkillId" className="form-label">Competencia principal</label>
          <select id="mainSkillId" name="mainSkillId" className="form-select" value={formulario.mainSkillId} onChange={manejarCambio} required>
            <option value="">Seleccione una competencia</option>
            {competencias.map((competencia) => <option key={competencia.id} value={competencia.id}>{competencia.name}</option>)}
          </select>
        </div>
        <div className="mb-3"><label htmlFor="role" className="form-label">Rol que desea desempeñar</label>
          <input id="role" name="role" className="form-control" value={formulario.role} onChange={manejarCambio} minLength={3} maxLength={60} required />
        </div>
        <div className="mb-3"><label htmlFor="availabilitySolicitud" className="form-label">Disponibilidad</label>
          <input id="availabilitySolicitud" name="availability" className="form-control" value={formulario.availability} onChange={manejarCambio} minLength={3} maxLength={60} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={enviando || competencias.length === 0}>
          {enviando ? 'Guardando...' : solicitud ? 'Guardar cambios' : 'Enviar solicitud'}
        </button>
      </form>
    </div></div>
  )
}

export default FormularioSolicitud
