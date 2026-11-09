import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { obtenerDB } from '../config/db.js';

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
  res.status(201).json({
    id: String(resultado.insertedId),
    fullName: [usuario.firstName, usuario.lastName, usuario.secondLastName].filter(Boolean).join(' '),
    memberType: usuario.memberType,
    career: usuario.career,
    description: usuario.description,
    skills: usuario.skills,
    interests: usuario.interests,
    availability: usuario.availability,
    portfolioUrl: usuario.portfolioUrl,
    email: usuario.email,
    active: usuario.active,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt
  });
});

export default router;
