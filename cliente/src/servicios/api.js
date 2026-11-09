const API_URL = import.meta.env.VITE_API_URL

export async function peticion(ruta, opciones = {}) {
  if (!API_URL) throw new Error('Configure VITE_API_URL para conectar con el servidor.')
  const token = sessionStorage.getItem('token')

  let respuesta

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: {
        ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opciones.headers
      }
    })
  } catch {
    throw new Error(
      'No fue posible conectar con el servidor. Verifique su conexión e inténtelo nuevamente.'
    )
  }

  if (respuesta.status === 204) {
    return null
  }

  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    const mensajes = {
      400: 'Los datos enviados no son válidos. Revise la información.',
      401: 'Debe iniciar sesión para realizar esta acción.',
      403: 'No tiene permisos para realizar esta acción.',
      404: 'No se encontró la información solicitada.',
      409: 'La operación no pudo completarse porque existe un conflicto con los datos.',
      429: 'Ha realizado demasiadas solicitudes. Inténtelo más tarde.',
      500: 'Ocurrió un problema en el servidor. Inténtelo más tarde.',
      502: 'El servidor no está disponible temporalmente.',
      503: 'El servicio no está disponible temporalmente.'
    }

    const mensajeServidor = datos?.error?.message

    // Utilizar mensajes del backend solamente si están en español.
    const mensaje = mensajeServidor && /[áéíóúñ¿¡]|\b(el|la|los|las|debe|datos|solicitud|usuario|contraseña|correo|iniciativa)\b/i.test(mensajeServidor)
      ? mensajeServidor
      : mensajes[respuesta.status] || 'No fue posible completar la operación.'

    throw new Error(mensaje)
  }

  return datos
}