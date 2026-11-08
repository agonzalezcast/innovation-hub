const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function peticion(ruta, opciones = {}) {
  const token = sessionStorage.getItem('token')

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers
    }
  })

  if (respuesta.status === 204) {
    return null
  }

  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    throw new Error(
      datos?.error?.message || 'Ocurrió un error al comunicarse con el servidor.'
    )
  }

  return datos
}