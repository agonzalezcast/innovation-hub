export function rutaNoEncontrada(req, res) {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Ruta inexistente' }
  });
}

export function manejarError(err, req, res, next) {
  const status = err.code === 11000 ? 409 : (err.type === 'entity.parse.failed' ? 400 : (err.status || 500));
  const codes = {
    400: 'VALIDATION_ERROR',
    401: 'UNAUTHENTICATED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    500: 'INTERNAL_ERROR'
  };

  res.status(status).json({
    error: {
      code: codes[status] || 'INTERNAL_ERROR',
      message: status >= 500 ? 'Ocurrió un error interno' : (err.code === 11000 ? 'El correo ya está registrado' : err.message)
    }
  });
}
