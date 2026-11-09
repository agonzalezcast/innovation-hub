import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { obtenerDB } from '../config/db.js';
import { requerirSesion } from '../middlewares/autenticacion.js';
import { usuarioPropio } from '../utils/usuario.js';

const router = Router();
const campos = ['firstName', 'lastName', 'secondLastName', 'memberType', 'career',
  'description', 'skillIds', 'interests', 'availability', 'portfolioUrl'];

function texto(valor, max, obligatorio = false) {
  return typeof valor === 'string' && valor.trim().length <= max &&
    (!obligatorio || valor.trim().length > 0);
}

router.put('/users/me', requerirSesion, async (req, res) => {
  const datos = req.body || {};
  const { firstName, lastName, secondLastName = '', memberType, career,
    description = '', skillIds = [], interests = [], availability = '', portfolioUrl = '' } = datos;

  if (Object.keys(datos).some((campo) => !campos.includes(campo)) ||
      !texto(firstName, 80, true) || !texto(lastName, 80, true) ||
      !texto(secondLastName, 80) || !['Estudiante', 'Docente', 'Administrativo'].includes(memberType) ||
      !texto(career, 120, true) || !texto(description, 1000) || !texto(availability, 100) ||
      !texto(portfolioUrl, 500) || !Array.isArray(skillIds) || !Array.isArray(interests) ||
      interests.some((interes) => !texto(interes, 100, true)) ||
      skillIds.some((id) => typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) ||
      new Set(skillIds.map((id) => id.toLowerCase())).size !== skillIds.length) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Los datos del perfil no son válidos' } });
  }

  if (portfolioUrl.trim()) {
    try {
      const url = new URL(portfolioUrl.trim());
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Protocolo inválido');
    } catch {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'La dirección del portafolio no es válida' } });
    }
  }

  const db = obtenerDB();
  const skills = skillIds.map((id) => new ObjectId(id));
  if (skills.length && await db.collection('skills').countDocuments({ _id: { $in: skills } }) !== skills.length) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Competencia inexistente' } });
  }

  const cambios = {
    firstName: firstName.trim(), lastName: lastName.trim(), secondLastName: secondLastName.trim(),
    memberType, career: career.trim(), description: description.trim(), skills,
    interests: interests.map((interes) => interes.trim()), availability: availability.trim(),
    portfolioUrl: portfolioUrl.trim() || null, updatedAt: new Date()
  };
  await db.collection('users').updateOne({ _id: req.usuario._id }, { $set: cambios });
  res.json(await usuarioPropio({ ...req.usuario, ...cambios }));
});

export default router;
