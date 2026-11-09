import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { ejecutarTransaccion, obtenerDB } from '../config/db.js';
import { requerirSesion } from '../middlewares/autenticacion.js';
import { validarIniciativa } from '../services/validarIniciativa.js';

const router = Router();

function sesionOpcional(req, res, next) {
  if (!req.get('Authorization')) return next();
  return requerirSesion(req, res, next);
}

function esMiembro(iniciativa, usuario) {
  return usuario && (String(iniciativa.ownerId) === String(usuario._id) ||
    (iniciativa.members || []).some((miembro) => String(miembro.userId) === String(usuario._id)));
}

async function representar(iniciativa, usuario, resumen = false) {
  const db = obtenerDB();
  const competencias = await db.collection('skills').find({ _id: { $in: iniciativa.skills || [] } }).toArray();
  const base = {
    id: String(iniciativa._id), title: iniciativa.title, type: iniciativa.type,
    summary: iniciativa.summary, category: iniciativa.category,
    skills: competencias.map(({ _id, name }) => ({ id: String(_id), name }))
  };

  if (iniciativa.visibility === 'Restringida' && !esMiembro(iniciativa, usuario)) return base;
  const miembros = iniciativa.members || [];
  if (resumen) {
    return { ...base, visibility: iniciativa.visibility, status: iniciativa.status,
      capacity: iniciativa.capacity, memberCount: miembros.length, createdAt: iniciativa.createdAt };
  }

  const ids = miembros.map((miembro) => miembro.userId);
  if (!ids.some((id) => String(id) === String(iniciativa.ownerId))) ids.push(iniciativa.ownerId);
  const usuarios = await db.collection('users').find({ _id: { $in: ids } }).toArray();
  const nombre = (id) => {
    const persona = usuarios.find((u) => String(u._id) === String(id));
    return persona ? [persona.firstName, persona.lastName, persona.secondLastName].filter(Boolean).join(' ') : '';
  };
  return {
    ...base, description: iniciativa.description, problem: iniciativa.problem ?? null,
    beneficiaries: iniciativa.beneficiaries ?? null, capacity: iniciativa.capacity,
    visibility: iniciativa.visibility, status: iniciativa.status,
    owner: { id: String(iniciativa.ownerId), fullName: nombre(iniciativa.ownerId) },
    members: miembros.map((miembro) => ({ user: { id: String(miembro.userId), fullName: nombre(miembro.userId) },
      role: miembro.role, joinedAt: miembro.joinedAt })),
    tags: iniciativa.tags || [], publishedAt: iniciativa.publishedAt ?? null,
    createdAt: iniciativa.createdAt, updatedAt: iniciativa.updatedAt
  };
}

router.get('/initiatives', sesionOpcional, async (req, res) => {
  const { type = '', category = '', skill = '', q = '', page = '1', size = '12' } = req.query;
  if (![type, category, skill, q, page, size].every((valor) => typeof valor === 'string') ||
      !/^\d+$/.test(page) || !/^\d+$/.test(size) || Number(page) < 1 || Number(size) < 1 ||
      Number(size) > 100 || !Number.isSafeInteger(Number(page)) ||
      !Number.isSafeInteger((Number(page) - 1) * Number(size)) ||
      (skill && !/^[a-f\d]{24}$/i.test(skill)) || [type, category, q].some((valor) => valor.length > 120)) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Filtros o paginación inválidos' } });
  }
  const filtro = {
    status: { $nin: ['Borrador', 'Archivada'] },
    visibility: { $in: req.usuario ? ['Pública', 'Institucional', 'Restringida'] : ['Pública'] }
  };
  if (type) filtro.type = type;
  if (category) filtro.category = category;
  if (skill) filtro.skills = new ObjectId(skill);
  if (q.trim()) {
    const patron = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filtro.$or = [{ title: patron }, { summary: patron }];
  }
  const coleccion = obtenerDB().collection('initiatives');
  const pagina = Number(page), cantidad = Number(size);
  const [documentos, total] = await Promise.all([
    coleccion.find(filtro).sort({ createdAt: -1, _id: -1 }).skip((pagina - 1) * cantidad).limit(cantidad).toArray(),
    coleccion.countDocuments(filtro)
  ]);
  res.json({ items: await Promise.all(documentos.map((doc) => representar(doc, req.usuario, true))),
    page: pagina, size: cantidad, total, totalPages: Math.ceil(total / cantidad) });
});

router.get('/initiatives/mine', requerirSesion, async (req, res) => {
  const { page = '1', size = '12' } = req.query;
  if (typeof page !== 'string' || typeof size !== 'string' || !/^\d+$/.test(page) ||
      !/^\d+$/.test(size) || Number(page) < 1 || Number(size) < 1 || Number(size) > 100 ||
      !Number.isSafeInteger(Number(page)) || !Number.isSafeInteger((Number(page) - 1) * Number(size))) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Paginación inválida' } });
  }

  const coleccion = obtenerDB().collection('initiatives');
  const pagina = Number(page), cantidad = Number(size);
  const filtro = { ownerId: req.usuario._id };
  const [documentos, total] = await Promise.all([
    coleccion.find(filtro).sort({ createdAt: -1, _id: -1 }).skip((pagina - 1) * cantidad).limit(cantidad).toArray(),
    coleccion.countDocuments(filtro)
  ]);
  res.json({ items: await Promise.all(documentos.map((doc) => representar(doc, req.usuario))),
    page: pagina, size: cantidad, total, totalPages: Math.ceil(total / cantidad) });
});

router.get('/initiatives/:id', sesionOpcional, async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Identificador inválido' } });
  }
  const iniciativa = await obtenerDB().collection('initiatives').findOne({ _id: new ObjectId(req.params.id) });
  if (!iniciativa || (iniciativa.visibility === 'Privada' && !esMiembro(iniciativa, req.usuario))) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Iniciativa inexistente' } });
  }
  if (!req.usuario && ['Institucional', 'Restringida'].includes(iniciativa.visibility)) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Inicie sesión' } });
  }
  res.json(await representar(iniciativa, req.usuario));
});

router.post('/initiatives', requerirSesion, async (req, res) => {
  const datos = await validarIniciativa(req.body || {});
  const fecha = new Date();
  const iniciativa = {
    ...datos, ownerId: req.usuario._id,
    members: [{ userId: req.usuario._id, role: 'Propietario', joinedAt: fecha }],
    status: 'Publicada', publishedAt: fecha, createdAt: fecha, updatedAt: fecha
  };
  const resultado = await obtenerDB().collection('initiatives').insertOne(iniciativa);
  iniciativa._id = resultado.insertedId;
  res.status(201).json(await representar(iniciativa, req.usuario));
});

router.put('/initiatives/:id', requerirSesion, async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Identificador inválido' } });
  }
  const coleccion = obtenerDB().collection('initiatives');
  const iniciativa = await coleccion.findOne({ _id: new ObjectId(req.params.id) });
  if (!iniciativa) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Iniciativa inexistente' } });
  }
  if (String(iniciativa.ownerId) !== String(req.usuario._id)) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Solo el propietario puede modificar la iniciativa' } });
  }
  if (['Archivada', 'Convertida en proyecto'].includes(iniciativa.status)) {
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'La iniciativa no se puede modificar' } });
  }
  const datos = await validarIniciativa(req.body || {});
  if (datos.capacity < (iniciativa.members || []).length) {
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'La capacidad es menor al equipo actual' } });
  }
  const cambios = { ...datos, updatedAt: new Date() };
  const resultado = await coleccion.updateOne({
    _id: iniciativa._id, ownerId: req.usuario._id,
    status: { $nin: ['Archivada', 'Convertida en proyecto'] },
    $expr: { $lte: [{ $size: { $ifNull: ['$members', []] } }, datos.capacity] }
  }, { $set: cambios });
  if (!resultado.matchedCount) {
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'La iniciativa cambió y no se pudo actualizar' } });
  }
  const actualizada = await coleccion.findOne({ _id: iniciativa._id });
  res.json(await representar(actualizada, req.usuario));
});

router.delete('/initiatives/:id', requerirSesion, async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Identificador inválido' } });
  }

  const db = obtenerDB();
  const id = new ObjectId(req.params.id);
  await ejecutarTransaccion(async (sesion) => {
    const iniciativas = db.collection('initiatives');
    const iniciativa = await iniciativas.findOne({ _id: id }, { session: sesion });
    if (!iniciativa) throw Object.assign(new Error('Iniciativa inexistente'), { status: 404 });
    if (String(iniciativa.ownerId) !== String(req.usuario._id)) {
      throw Object.assign(new Error('Solo el propietario puede eliminar o archivar la iniciativa'), { status: 403 });
    }

    const solicitudes = await db.collection('requests').findOne({ initiativeId: id }, { session: sesion });
    const proyecto = await db.collection('projects').findOne({ initiativeId: id }, { session: sesion });
    const miembrosAdicionales = (iniciativa.members || []).some(
      (miembro) => String(miembro.userId) !== String(iniciativa.ownerId)
    );
    if (solicitudes || proyecto || miembrosAdicionales) {
      await iniciativas.updateOne({ _id: id }, { $set: { status: 'Archivada', updatedAt: new Date() } }, { session: sesion });
    } else {
      await iniciativas.deleteOne({ _id: id }, { session: sesion });
    }
  });
  res.status(204).end();
});

export default router;
