import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { ejecutarTransaccion, obtenerDB } from '../config/db.js';
import { requerirSesion } from '../middlewares/autenticacion.js';

const router = Router();

function error(status, message) {
  return Object.assign(new Error(message), { status });
}

function idValido(valor) {
  if (typeof valor !== 'string' || !/^[a-f\d]{24}$/i.test(valor)) throw error(400, 'Identificador inválido');
  return new ObjectId(valor);
}

function pertenece(iniciativa, usuario) {
  return String(iniciativa.ownerId) === String(usuario._id) ||
    (iniciativa.members || []).some((miembro) => String(miembro.userId) === String(usuario._id));
}

function fechaValida(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00.000Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

function datosProyecto(datos) {
  const campos = ['name', 'objective', 'description', 'technologies', 'startDate', 'estimatedEndDate', 'repositoryUrl'];
  const valido = (valor, maximo) => typeof valor === 'string' && valor.trim().length > 0 && valor.trim().length <= maximo;
  if (Object.keys(datos).some((campo) => !campos.includes(campo)) ||
      !valido(datos.name, 120) || !valido(datos.objective, 1000) || !valido(datos.description, 2000) ||
      !Array.isArray(datos.technologies) || datos.technologies.some((valor) => !valido(valor, 60)) ||
      !fechaValida(datos.startDate) || (datos.estimatedEndDate != null && datos.estimatedEndDate !== '' && !fechaValida(datos.estimatedEndDate))) {
    throw error(400, 'Los datos del proyecto no son válidos');
  }
  let repositoryUrl = null;
  if (datos.repositoryUrl != null && datos.repositoryUrl !== '') {
    if (typeof datos.repositoryUrl !== 'string') throw error(400, 'Repositorio inválido');
    try {
      const url = new URL(datos.repositoryUrl);
      if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password ||
          url.pathname.split('/').filter(Boolean).length !== 2 || url.search || url.hash) throw new Error();
      repositoryUrl = url.href;
    } catch {
      throw error(400, 'Repositorio inválido');
    }
  }
  return { name: datos.name.trim(), objective: datos.objective.trim(), description: datos.description.trim(),
    technologies: datos.technologies.map((valor) => valor.trim()), startDate: datos.startDate,
    estimatedEndDate: datos.estimatedEndDate || null, repositoryUrl };
}

async function representar(proyecto, iniciativa) {
  const miembros = iniciativa.members || [];
  const ids = miembros.map((m) => m.userId);
  if (!ids.some((id) => String(id) === String(iniciativa.ownerId))) ids.push(iniciativa.ownerId);
  const usuarios = await obtenerDB().collection('users').find({ _id: { $in: ids } }).toArray();
  const nombre = (id) => {
    const usuario = usuarios.find((u) => String(u._id) === String(id));
    return usuario ? [usuario.firstName, usuario.lastName, usuario.secondLastName].filter(Boolean).join(' ') : '';
  };
  return {
    id: String(proyecto._id), initiative: { id: String(iniciativa._id), title: iniciativa.title },
    name: proyecto.name, objective: proyecto.objective, description: proyecto.description,
    technologies: proyecto.technologies, startDate: proyecto.startDate, estimatedEndDate: proyecto.estimatedEndDate,
    status: proyecto.status, repositoryUrl: proyecto.repositoryUrl,
    owner: { id: String(iniciativa.ownerId), fullName: nombre(iniciativa.ownerId) },
    members: miembros.map((m) => ({ user: { id: String(m.userId), fullName: nombre(m.userId) }, role: m.role, joinedAt: m.joinedAt })),
    createdAt: proyecto.createdAt, updatedAt: proyecto.updatedAt
  };
}

router.post('/initiatives/:id/convert', requerirSesion, async (req, res) => {
  const id = idValido(req.params.id), datos = datosProyecto(req.body || {}), db = obtenerDB();
  const resultado = await ejecutarTransaccion(async (sesion) => {
    const iniciativa = await db.collection('initiatives').findOne({ _id: id }, { session: sesion });
    if (!iniciativa) throw error(404, 'Iniciativa inexistente');
    if (String(iniciativa.ownerId) !== String(req.usuario._id)) throw error(403, 'Solo el propietario puede convertir la iniciativa');
    if (['Borrador', 'Archivada', 'Convertida en proyecto'].includes(iniciativa.status) ||
        !(iniciativa.members || []).some((m) => String(m.userId) !== String(iniciativa.ownerId))) {
      throw error(409, 'La iniciativa no cumple las condiciones para convertirse en proyecto');
    }
    const fecha = new Date();
    const proyecto = { ...datos, initiativeId: id, status: 'Planificación', createdAt: fecha, updatedAt: fecha };
    proyecto._id = (await db.collection('projects').insertOne(proyecto, { session: sesion })).insertedId;
    await db.collection('initiatives').updateOne({ _id: id }, { $set: { status: 'Convertida en proyecto', updatedAt: fecha } }, { session: sesion });
    return { proyecto, iniciativa };
  });
  res.status(201).json(await representar(resultado.proyecto, resultado.iniciativa));
});

router.get('/projects', requerirSesion, async (req, res) => {
  const { page = '1', size = '12' } = req.query;
  if (typeof page !== 'string' || typeof size !== 'string' || !/^\d+$/.test(page) || !/^\d+$/.test(size) ||
      Number(page) < 1 || Number(size) < 1 || Number(size) > 100 || !Number.isSafeInteger(Number(page)) ||
      !Number.isSafeInteger((Number(page) - 1) * Number(size))) throw error(400, 'Paginación inválida');
  const db = obtenerDB(), pagina = Number(page), cantidad = Number(size);
  const [resultado] = await db.collection('projects').aggregate([
    { $lookup: { from: 'initiatives', localField: 'initiativeId', foreignField: '_id', as: 'iniciativa' } },
    { $unwind: '$iniciativa' },
    { $match: { $or: [{ 'iniciativa.ownerId': req.usuario._id }, { 'iniciativa.members.userId': req.usuario._id }] } },
    { $sort: { createdAt: -1, _id: -1 } },
    { $facet: { items: [{ $skip: (pagina - 1) * cantidad }, { $limit: cantidad }], conteo: [{ $count: 'total' }] } }
  ]).toArray();
  const total = resultado.conteo[0]?.total || 0;
  res.json({ items: await Promise.all(resultado.items.map((p) => representar(p, p.iniciativa))),
    page: pagina, size: cantidad, total, totalPages: Math.ceil(total / cantidad) });
});

router.get('/projects/:id', requerirSesion, async (req, res) => {
  const db = obtenerDB(), proyecto = await db.collection('projects').findOne({ _id: idValido(req.params.id) });
  if (!proyecto) throw error(404, 'Proyecto inexistente');
  const iniciativa = await db.collection('initiatives').findOne({ _id: proyecto.initiativeId });
  if (!iniciativa) throw error(404, 'Iniciativa inexistente');
  if (!pertenece(iniciativa, req.usuario)) throw error(403, 'No tiene acceso al proyecto');
  res.json(await representar(proyecto, iniciativa));
});

export default router;
