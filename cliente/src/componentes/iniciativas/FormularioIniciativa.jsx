
import { useState } from 'react'

function FormularioIniciativa() {
    const [formulario, setFormulario] = useState({
        titulo: '',
        tipo: 'Idea',
        resumen: '',
        descripcion: '',
        problema: '',
        beneficiarios: '',
        categoria: '',
        competencias: [],
        participantes: 1,
        visibilidad: 'Pública',
        etiquetas: ''
    })

    const [competencia, setCompetencia] = useState('')

    function manejarCambio(evento) {
        const { name, value } = evento.target

        setFormulario({ ...formulario, [name]: value })
    }

    function agregarCompetencia() {
        const nuevaCompetencia = competencia.trim()

        if ( nuevaCompetencia && !formulario.competencias.includes(nuevaCompetencia)) {
            setFormulario({ ...formulario, competencias: [...formulario.competencias, nuevaCompetencia]})

            setCompetencia('')
        }
    }

    function quitarCompetencia(competenciaEliminar) {
        setFormulario({ ...formulario, competencias: formulario.competencias.filter((item) => item !== competenciaEliminar)})
    }

    function manejarEnvio(evento) {
        evento.preventDefault()
        console.log('Datos de la iniciativa:', formulario)
    }

    return (
        <form onSubmit={manejarEnvio}>
            <div className="mb-3">
                <label htmlFor="titulo" className="form-label">
                    Título
                </label>
                <input type="text" id="titulo" name="titulo" className="form-control" value={formulario.titulo} onChange={manejarCambio}/>
            </div>

            <div className="mb-3">
                <label htmlFor="tipo" className="form-label">
                    Tipo de iniciativa
                </label>
                <select id="tipo" name="tipo" className="form-select" value={formulario.tipo} onChange={manejarCambio}>
                    <option value="Idea">Idea</option>
                    <option value="Necesidad">Necesidad</option>
                    <option value="Reto">Reto</option>
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="resumen" className="form-label">
                    Resumen
                </label>
                <textarea id="resumen" name="resumen" className="form-control" rows="3" value={formulario.resumen} onChange={manejarCambio}/>
            </div>

            <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">
                    Descripción detallada
                </label>
                <textarea id="descripcion" name="descripcion" className="form-control" rows="5" value={formulario.descripcion} onChange={manejarCambio}/>
            </div>

            <div className="mb-3">
                <label htmlFor="problema" className="form-label">
                    Problema identificado
                </label>
                <textarea id="problema" name="problema" className="form-control" rows="3" value={formulario.problema} onChange={manejarCambio}/>
            </div>

            <div className="mb-3">
                <label htmlFor="beneficiarios" className="form-label">
                    Beneficiarios
                </label>
                <input type="text" id="beneficiarios" name="beneficiarios" className="form-control" value={formulario.beneficiarios} onChange={manejarCambio}/>
            </div>

            <div className="mb-3">
                <label htmlFor="categoria" className="form-label">
                    Categoría
                </label>
                <select id="categoria" name="categoria" className="form-select" value={formulario.categoria} onChange={manejarCambio}>
                    <option value="">Seleccione una categoría</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Educación">Educación</option>
                    <option value="Sostenibilidad">Sostenibilidad</option>
                    <option value="Impacto social">Impacto social</option>
                    <option value="Negocios y emprendimiento">Negocios y emprendimiento</option>
                    <option value="Salud y bienestar">Salud y bienestar</option>
                    <option value="Cultura y creatividad">Cultura y creatividad</option>
                    <option value="Otro">Otro</option>
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="competencia" className="form-label">
                    Competencias requeridas
                </label>

                <div className="d-flex gap-2">
                    <input type="text" id="competencia" className="form-control" value={competencia} onChange={(evento) => setCompetencia(evento.target.value)}/>

                    <button type="button" className="btn btn-outline-primary" onClick={agregarCompetencia}>
                        Agregar
                    </button>
                </div>

                <ul className="list-group mt-3">
                    {formulario.competencias.map((item) => (
                        <li
                            key={item}
                            className="list-group-item d-flex justify-content-between align-items-center"
                        >
                            {item}

                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => quitarCompetencia(item)}>
                                Quitar
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mb-3">
                <label htmlFor="participantes" className="form-label">
                    Cantidad estimada de integrantes
                </label>
                <input type="number" id="participantes" name="participantes" className="form-control" min="1" max="20" value={formulario.participantes} onChange={manejarCambio}/>
            </div>

            <div className="mb-3">
                <label htmlFor="visibilidad" className="form-label">
                    Visibilidad
                </label>
                <select id="visibilidad" name="visibilidad" className="form-select" value={formulario.visibilidad} onChange={manejarCambio}>
                    <option value="Pública">Pública</option>
                    <option value="Institucional">Institucional</option>
                    <option value="Restringida">Restringida</option>
                    <option value="Privada">Privada</option>
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="etiquetas" className="form-label">
                    Etiquetas (separadas por comas)
                </label>
                <input type="text" id="etiquetas" name="etiquetas" className="form-control" value={formulario.etiquetas} onChange={manejarCambio} placeholder="innovación, educación, tecnología"/>
            </div>

            <button type="submit" className="btn btn-primary">
                Publicar iniciativa
            </button>
        </form>
    )
}

export default FormularioIniciativa
