
export function validarIniciativa(formulario, iniciativas = []) {
  const errores = {}

  const titulo = formulario.titulo.trim()
  const resumen = formulario.resumen.trim()
  const descripcion = formulario.descripcion.trim()
  const problema = formulario.problema.trim()
  const beneficiarios = formulario.beneficiarios.trim()

  const participantes = Number(formulario.participantes)

  const etiquetas = formulario.etiquetas
    .split(',')
    .map((etiqueta) => etiqueta.trim())
    .filter((etiqueta) => etiqueta !== '')

  if (titulo.length < 5 || titulo.length > 80) {
    errores.titulo = 'El título debe tener entre 5 y 80 caracteres.'
  } else if (
    iniciativas.some(
      (iniciativa) =>
        iniciativa.titulo.trim().toLowerCase() === titulo.toLowerCase()
    )
  ) {
    errores.titulo = 'Ya existe una iniciativa con ese título.'
  }

  if (resumen.length < 20 || resumen.length > 200) {
    errores.resumen = 'El resumen debe tener entre 20 y 200 caracteres.'
  }

  if (descripcion.length < 30 || descripcion.length > 1000) {
    errores.descripcion = 'La descripción debe tener entre 30 y 1000 caracteres.'
  }

  if (problema && (problema.length < 10 || problema.length > 500)) {
    errores.problema = 'El problema debe tener entre 10 y 500 caracteres.'
  }

  if (beneficiarios && (beneficiarios.length < 10 || beneficiarios.length > 150)) {
    errores.beneficiarios = 'Los beneficiarios deben tener entre 10 y 150 caracteres.'
  }

  if (!formulario.categoria) {
    errores.categoria = 'Seleccione una categoría.'
  }

  if (formulario.competencias.length === 0) {
    errores.competencias = 'Agregue al menos una competencia.'
  }

  if (!Number.isInteger(participantes) || participantes < 1 || participantes > 20) {
    errores.participantes = 'La cantidad de integrantes debe estar entre 1 y 20.'
  }

  if (etiquetas.length === 0) {
    errores.etiquetas = 'Agregue al menos una etiqueta.'
  } else if (
    etiquetas.some((etiqueta) => etiqueta.length < 2 || etiqueta.length > 20)
  ) {
    errores.etiquetas = 'Cada etiqueta debe tener entre 2 y 20 caracteres.'
  } else if (
    new Set(etiquetas.map((etiqueta) => etiqueta.toLowerCase())).size !==
    etiquetas.length
  ) {
    errores.etiquetas = 'No puede repetir etiquetas.'
  }

  return errores
}
