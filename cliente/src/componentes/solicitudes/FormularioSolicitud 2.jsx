import { useEffect, useState } from 'react'
import { peticion } from '../../servicios/api.js'

function FormularioSolicitud({ iniciativaId }) {
    const [competencias, setCompetencias] = useState([])
    const [formulario, setFormulario] = useState({
        message: '',
        mainSkillId: '',
        role: '',
        availability: ''
    })
    const [enviando, setEnviando] = useState(false)
    const [enviada, setEnviada] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        async function cargarCompetencias() {
            try {
                const usuario = await peticion('/auth/me')
                setCompetencias(usuario.skills || [])
            } catch (err) {
                setError(err.message)
            }
        }

        cargarCompetencias()
    }, [])

    function manejarCambio(evento) {
        const { name, value } = evento.target

        setFormulario({
            ...formulario,
            [name]: value
        })
    }

    async function manejarSubmit(evento) {
        evento.preventDefault()
        setError('')
        setEnviando(true)

        try {
            await peticion('/requests', {
                method: 'POST',
                body: JSON.stringify({
                    initiativeId: iniciativaId,
                    message: formulario.message.trim(),
                    mainSkillId: formulario.mainSkillId,
                    role: formulario.role.trim(),
                    availability: formulario.availability.trim()
                })
            })

            setEnviada(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setEnviando(false)
        }
    }

    if (enviada) {
        return (
            <div className="alert alert-success" role="status">
                Solicitud enviada correctamente. El propietario deberá revisarla.
            </div>
        )
    }

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h2 className="h4">Solicitar participación</h2>

                <p className="text-body-secondary">
                    Explique cómo puede colaborar con esta iniciativa.
                </p>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={manejarSubmit}>
                    <div className="mb-3">
                        <label htmlFor="message" className="form-label">
                            Mensaje
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            className="form-control"
                            rows="3"
                            value={formulario.message}
                            onChange={manejarCambio}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="mainSkillId" className="form-label">
                            Competencia principal
                        </label>
                        <select
                            id="mainSkillId"
                            name="mainSkillId"
                            className="form-select"
                            value={formulario.mainSkillId}
                            onChange={manejarCambio}
                            required
                        >
                            <option value="">Seleccione una competencia</option>
                            {competencias.map((competencia) => (
                                <option key={competencia.id} value={competencia.id}>
                                    {competencia.name}
                                </option>
                            ))}
                        </select>
                        {competencias.length === 0 && (
                            <div className="form-text">
                                Agregue competencias a su perfil antes de solicitar participación.
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="role" className="form-label">
                            Rol que desea desempeñar
                        </label>
                        <input
                            id="role"
                            name="role"
                            className="form-control"
                            value={formulario.role}
                            onChange={manejarCambio}
                            placeholder="Ej. Desarrollador frontend"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="availabilitySolicitud" className="form-label">
                            Disponibilidad
                        </label>
                        <input
                            id="availabilitySolicitud"
                            name="availability"
                            className="form-control"
                            value={formulario.availability}
                            onChange={manejarCambio}
                            placeholder="Ej. Fines de semana"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={enviando || competencias.length === 0}
                    >
                        {enviando ? 'Enviando...' : 'Enviar solicitud'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default FormularioSolicitud