
import { useState } from 'react'
import iniciativas from '../../../../avance1/datos/iniciativas.json'
import { validarIniciativa } from '../../utils/validacionesIniciativa.js'

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

    const [errores, setErrores] = useState({})
    const [mensaje, setMensaje] = useState('')

    function manejarCambio(evento) {
        const { name, value } = evento.target

        setFormulario({ ...formulario, [name]: value })

        setErrores({ ...errores, [name]: ''})

        setMensaje('')
    }

    function agregarCompetencia() {
        const nuevaCompetencia = competencia.trim()

        if (nuevaCompetencia && !formulario.competencias.includes(nuevaCompetencia)) {
            setFormulario({ ...formulario, competencias: [...formulario.competencias, nuevaCompetencia] })

            setCompetencia('')
        }
    }

    function quitarCompetencia(competenciaEliminar) {
        setFormulario({ ...formulario, competencias: formulario.competencias.filter((item) => item !== competenciaEliminar) })
    }

    function manejarEnvio(evento) {
        evento.preventDefault()

        const erroresEncontrados = validarIniciativa(formulario, iniciativas)

        setErrores(erroresEncontrados)
        setMensaje('')

        if (Object.keys(erroresEncontrados).length > 0) {
            return
        }

        const nuevaIniciativa = {
            ...formulario,
            titulo: formulario.titulo.trim(),
            resumen: formulario.resumen.trim(),
            descripcion: formulario.descripcion.trim(),
            problema: formulario.problema.trim(),
            beneficiarios: formulario.beneficiarios.trim(),
            participantes: Number(formulario.participantes),
            etiquetas: formulario.etiquetas
                .split(',')
                .map((etiqueta) => etiqueta.trim())
                .filter((etiqueta) => etiqueta !== '')
        }

        console.log('Iniciativa validada:', nuevaIniciativa)

        setMensaje('Formulario validado correctamente. Pendiente de guardar en el servidor.')
    }

    return (
        <form onSubmit={manejarEnvio} noValidate>
            <div className="mb-3">
                <label htmlFor="titulo" className="form-label">
                    Título
                </label>
                <input type="text" id="titulo" name="titulo" className={`form-control ${errores.titulo ? 'is-invalid' : ''}`} value={formulario.titulo} onChange={manejarCambio} />
                {errores.titulo && (<div className="invalid-feedback">{errores.titulo}</div>)}
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
                <textarea id="resumen" name="resumen" className={`form-control ${errores.resumen ? 'is-invalid' : ''}`} rows="3" value={formulario.resumen} onChange={manejarCambio} />
                {errores.resumen && (<div className="invalid-feedback">{errores.resumen}</div>)}
            </div>

            <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">
                    Descripción detallada
                </label>
                <textarea id="descripcion" name="descripcion" className={`form-control ${errores.descripcion ? 'is-invalid' : ''}`} rows="5" value={formulario.descripcion} onChange={manejarCambio} />
                {errores.descripcion && (<div className="invalid-feedback">{errores.descripcion}</div>)}
            </div>

            <div className="mb-3">
                <label htmlFor="problema" className="form-label">
                    Problema identificado
                </label>
                <textarea id="problema" name="problema" className={`form-control ${errores.problema ? 'is-invalid' : ''}`} rows="3" value={formulario.problema} onChange={manejarCambio} />
                {errores.problema && (<div className="invalid-feedback">{errores.problema}</div>)}
            </div>

            <div className="mb-3">
                <label htmlFor="beneficiarios" className="form-label">
                    Beneficiarios
                </label>
                <input type="text" id="beneficiarios" name="beneficiarios" className={`form-control ${errores.beneficiarios ? 'is-invalid' : ''}`} value={formulario.beneficiarios} onChange={manejarCambio} />
                {errores.beneficiarios && (<div className="invalid-feedback">{errores.beneficiarios}</div>)}
            </div>

            <div className="mb-3">
                <label htmlFor="categoria" className="form-label">
                    Categoría
                </label>
                <select id="categoria" name="categoria" className={`form-select ${errores.categoria ? 'is-invalid' : ''}`} value={formulario.categoria} onChange={manejarCambio}>
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
                {errores.categoria && (<div className="invalid-feedback">{errores.categoria}</div>)}
            </div>

            <div className="mb-3">
                <label htmlFor="competencia" className="form-label">
                    Competencias requeridas
                </label>

                <div className="d-flex gap-2">
                    <input type="text" id="competencia" className="form-control" value={competencia} onChange={(evento) => setCompetencia(evento.target.value)} />

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
                {errores.competencias && (<div className="text-danger small mt-2">{errores.competencias}</div>)}
            </div>

            <div className="mb-3">
                <label htmlFor="participantes" className="form-label">
                    Cantidad estimada de integrantes
                </label>
                <input type="number" id="participantes" name="participantes" className={`form-control ${errores.participantes ? 'is-invalid' : ''}`} min="1" max="20" value={formulario.participantes} onChange={manejarCambio} />
                {errores.participantes && (<div className="invalid-feedback">{errores.participantes}</div>)}
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
                <input type="text" id="etiquetas" name="etiquetas" className={`form-control ${errores.etiquetas ? 'is-invalid' : ''}`} value={formulario.etiquetas} onChange={manejarCambio} placeholder="innovación, educación, tecnología" />
                {errores.etiquetas && (<div className="invalid-feedback">{errores.etiquetas}</div>)}
            </div>

            {mensaje && (
                <div className="alert alert-success" role="status">
                    {mensaje}
                </div>
            )}

            <button type="submit" className="btn btn-primary">
                Publicar iniciativa
            </button>
        </form>
    )
}

export default FormularioIniciativa
