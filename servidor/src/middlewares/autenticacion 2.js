import { createHash } from 'node:crypto';
import { obtenerDB } from '../config/db.js';

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export async function requerirSesion(req, res, next) {
  const encabezado = req.get('Authorization') || '';
  const coincidencia = /^Bearer ([a-f0-9]{64})$/i.exec(encabezado);
  if (!coincidencia) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Inicie sesión' } });
  }

  const db = obtenerDB();
  const sesion = await db.collection('sessions').findOne({
    tokenHash: hashToken(coincidencia[1]),
    expiresAt: { $gt: new Date() }
  });
  const usuario = sesion && await db.collection('users').findOne({ _id: sesion.userId, active: true });
  if (!usuario) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Sesión inválida' } });
  }

  req.usuario = usuario;
  req.sesion = sesion;
  next();
}
