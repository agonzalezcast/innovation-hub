import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { ejecutarTransaccion, obtenerDB } from '../config/db.js';
import { requerirSesion } from '../middlewares/autenticacion.js';
import { usuarioPropio, usuarioPublico } from '../utils/usuario.js';

const router = Router();
const campos = ['firstName', 'lastName', 'secondLastName', 'memberType', 'career',
  'description', 'skillIds', 'interests', 'availability', 'portfolioUrl'];

function texto(valor, max, obligatorio = false) {
  return typeof valor === 'string' && valor.trim().length <= max &&
    (!obligatorio || valor.trim().length > 0);
}


function busquedaSegura(valor) {
  // filtro remove
  return new RegExp(valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}


router.get('/users', requerirSesion, async (req, res) => {
  const { q = '', skill = '', career = '', availability = '', page = '1', size = '12' } = req.query;
  if (![q, skill, career, availability, page, size].every((valor) => typeof valor === 'string') ||
      !/^\d+$/.test(page) || !/^\d+$/.test(size) || Number(page) < 1 ||
      Number(size) < 1 || Number(size) > 100 || !Number.isSafeInteger(Number(page)) ||
      !Number.isSafeInteger((Number(page) - 1) * Number(size)) ||
      (skill && !/^[a-f\d]{24}$/i.test(skill)) ||
      [q, career, availability].some((valor) => valor.length > 120)) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Filtros o paginación inválidos' } });
  }

  const filtro = { active: true };
  if (q.trim()) {
    filtro.$and = q.trim().split(/\s+/).map((palabra) => {
      const patron = busquedaSegura(palabra);
      return { $or: [{ firstName: patron }, { lastName: patron }, { secondLastName: patron }] };
    });
  }
  if (skill) filtro.skills = new ObjectId(skill);
  if (career.trim()) filtro.career = busquedaSegura(career.trim());
  if (availability.trim()) filtro.availability = busquedaSegura(availability.trim());

  const pagina = Number(page);
  const cantidad = Number(size);
  const usuarios = obtenerDB().collection('users');
  const [documentos, total] = await Promise.all([
    usuarios.find(filtro).sort({ createdAt: -1, _id: -1 }).skip((pagina - 1) * cantidad).limit(cantidad).toArray(),
    usuarios.countDocuments(filtro)
  ]);
  res.json({ items: await Promise.all(documentos.map(usuarioPublico)), page: pagina,
    size: cantidad, total, totalPages: Math.ceil(total / cantidad) });
});

router.get('/users/:id', requerirSesion, async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Identificador inválido' } });
  }
  //lookup usuario
  const usuario = await obtenerDB().collection('users').findOne({ _id: new ObjectId(req.params.id), active: true });
  if (!usuario) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Usuario inexistente' } });
  }
  res.json(await usuarioPublico(usuario));
});

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

router.patch('/users/me/deactivate', requerirSesion, async (req, res) => {
  if (req.body?.confirm !== true || Object.keys(req.body).some((campo) => campo !== 'confirm')) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Confirme la desactivación de la cuenta' } });
  }

  const db = obtenerDB();
  await ejecutarTransaccion(async (sesion) => {
    const iniciativa = await db.collection('initiatives').findOne({
      ownerId: req.usuario._id, status: { $ne: 'Archivada' }
    }, { session: sesion });
    if (iniciativa) {
      throw Object.assign(new Error('Archive sus iniciativas antes de desactivar la cuenta'), { status: 409 });
    }
    await db.collection('users').updateOne({ _id: req.usuario._id, active: true },
      { $set: { active: false, updatedAt: new Date() } }, { session: sesion });
    await db.collection('sessions').deleteMany({ userId: req.usuario._id }, { session: sesion });
  });
  res.status(204).end();
});

export default router;
