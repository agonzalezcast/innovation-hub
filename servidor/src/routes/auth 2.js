import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { obtenerDB } from '../config/db.js';
import { hashToken, requerirSesion } from '../middlewares/autenticacion.js';
import { usuarioPropio } from '../utils/usuario.js';

const router = Router();

function texto(valor, min, max) {
  return typeof valor === 'string' && valor.trim().length >= min && valor.trim().length <= max;
}

router.post('/auth/register', async (req, res) => {
  const datos = req.body || {};
  const { firstName, lastName, secondLastName, email, password, passwordConfirmation, memberType, career, acceptTerms } = datos;

  if (!texto(firstName, 1, 80) || !texto(lastName, 1, 80) ||
      (secondLastName != null && secondLastName !== '' && !texto(secondLastName, 1, 80)) ||
      !texto(email, 3, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72 ||
      password !== passwordConfirmation || acceptTerms !== true ||
      !['Estudiante', 'Docente', 'Administrativo'].includes(memberType) || !texto(career, 1, 120)) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Los datos enviados no son válidos' }
    });
  }

  const fecha = new Date();
  const usuario = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    secondLastName: secondLastName?.trim() || '',
    email: email.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(password, 12),
    memberType,
    career: career.trim(),
    description: '',
    skills: [],
    interests: [],
    availability: '',
    portfolioUrl: null,
    active: true,
    createdAt: fecha,
    updatedAt: fecha
  };

  const resultado = await obtenerDB().collection('users').insertOne(usuario);
  usuario._id = resultado.insertedId;
  res.status(201).json(await usuarioPropio(usuario));
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!texto(email, 3, 254) || typeof password !== 'string' ||
      password.length < 1 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Los datos enviados no son válidos' } });
  }

  const db = obtenerDB();
  const usuario = await db.collection('users').findOne({ email: email.trim().toLowerCase() });
  if (!usuario || !usuario.active || !(await bcrypt.compare(password, usuario.passwordHash))) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Credenciales incorrectas' } });
  }

  const token = randomBytes(32).toString('hex');
  await db.collection('sessions').insertOne({
    tokenHash: hashToken(token),
    userId: usuario._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  res.json({ token, user: await usuarioPropio(usuario) });
});

router.get('/auth/me', requerirSesion, async (req, res) => {
  res.json(await usuarioPropio(req.usuario));
});

router.post('/auth/logout', requerirSesion, async (req, res) => {
  await obtenerDB().collection('sessions').deleteOne({ _id: req.sesion._id });
  res.status(204).end();

});

export default router;
