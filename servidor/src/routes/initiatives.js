import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { obtenerDB } from '../config/db.js';
import { requerirSesion } from '../middlewares/autenticacion.js';

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

export default router;
