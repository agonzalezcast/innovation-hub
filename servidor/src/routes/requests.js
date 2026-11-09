import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { ejecutarTransaccion, obtenerDB } from '../config/db.js';
import { requerirSesion } from '../middlewares/autenticacion.js';

const router = Router();
const estados = ['Pendiente', 'Aceptada', 'Rechazada', 'Cancelada'];

function error(status, message) {
  return Object.assign(new Error(message), { status });
}

function texto(valor, minimo, maximo) {
  return typeof valor === 'string' && valor.trim().length >= minimo && valor.trim().length <= maximo;
}

async function representar(solicitud, iniciativa, usuario) {
  const competencia = await obtenerDB().collection('skills').findOne({ _id: solicitud.mainSkillId });
  return {
    id: String(solicitud._id),
    initiative: { id: String(iniciativa._id), title: iniciativa.title },
    requester: { id: String(usuario._id), fullName: [usuario.firstName, usuario.lastName, usuario.secondLastName].filter(Boolean).join(' ') },
    message: solicitud.message,
    mainSkill: competencia ? { id: String(competencia._id), name: competencia.name } : null,
    role: solicitud.role, availability: solicitud.availability, status: solicitud.status,
    createdAt: solicitud.createdAt, updatedAt: solicitud.updatedAt, resolvedAt: solicitud.resolvedAt
  };
}

router.post('/requests', requerirSesion, async (req, res) => {
  const datos = req.body || {};
  const { initiativeId, mainSkillId, message, role, availability } = datos;
  if (Object.keys(datos).some((campo) => !['initiativeId', 'mainSkillId', 'message', 'role', 'availability'].includes(campo)) ||
      typeof initiativeId !== 'string' || !/^[a-f\d]{24}$/i.test(initiativeId) ||
      typeof mainSkillId !== 'string' || !/^[a-f\d]{24}$/i.test(mainSkillId) ||
      !texto(message, 30, 500) || !texto(role, 3, 60) || !texto(availability, 3, 60)) {
    throw error(400, 'Los datos de la solicitud no son válidos');
  }

  const db = obtenerDB();
  const id = new ObjectId(initiativeId), competenciaId = new ObjectId(mainSkillId);
  const resultado = await ejecutarTransaccion(async (sesion) => {
    const iniciativas = db.collection('initiatives');
    const iniciativa = await iniciativas.findOne({ _id: id }, { session: sesion });
    if (!iniciativa || iniciativa.visibility === 'Privada') throw error(404, 'Iniciativa inexistente');
    const miembros = iniciativa.members || [];
    if (String(iniciativa.ownerId) === String(req.usuario._id) ||
        miembros.some((miembro) => String(miembro.userId) === String(req.usuario._id))) {
      throw error(403, 'Ya pertenece al equipo');
    }
    if (['Borrador', 'Archivada', 'Convertida en proyecto'].includes(iniciativa.status) || miembros.length >= iniciativa.capacity) {
      throw error(409, 'La iniciativa no recibe solicitudes');
    }
    if (!(iniciativa.skills || []).some((skill) => String(skill) === String(competenciaId))) {
      throw error(400, 'La competencia no corresponde a la iniciativa');
    }

    const fecha = new Date();
    const solicitud = {
      initiativeId: id, requesterId: req.usuario._id, mainSkillId: competenciaId,
      message: message.trim(), role: role.trim(), availability: availability.trim(),
      status: 'Pendiente', createdAt: fecha, updatedAt: fecha, resolvedAt: null
    };
    // La actualización coordina esta operación con cambios o archivado de la iniciativa.
    await iniciativas.updateOne({ _id: id }, { $set: { updatedAt: fecha } }, { session: sesion });
    solicitud._id = (await db.collection('requests').insertOne(solicitud, { session: sesion })).insertedId;
    return { solicitud, iniciativa };
  });
  res.status(201).json(await representar(resultado.solicitud, resultado.iniciativa, req.usuario));
});

router.get('/requests/mine', requerirSesion, async (req, res) => {
  const { status = '', page = '1', size = '12' } = req.query;
  if (typeof status !== 'string' || typeof page !== 'string' || typeof size !== 'string' ||
      (status && !estados.includes(status)) || !/^\d+$/.test(page) || !/^\d+$/.test(size) ||
      Number(page) < 1 || Number(size) < 1 || Number(size) > 100 ||
      !Number.isSafeInteger(Number(page)) || !Number.isSafeInteger((Number(page) - 1) * Number(size))) {
    throw error(400, 'Filtros o paginación inválidos');
  }
  const pagina = Number(page), cantidad = Number(size);
  const filtro = { requesterId: req.usuario._id };
  if (status) filtro.status = status;
  const [resultado] = await obtenerDB().collection('requests').aggregate([
    { $match: filtro },
    { $lookup: { from: 'initiatives', localField: 'initiativeId', foreignField: '_id', as: 'iniciativa' } },
    { $unwind: '$iniciativa' },
    { $match: { $or: [
      { 'iniciativa.visibility': { $ne: 'Privada' } },
      { 'iniciativa.ownerId': req.usuario._id },
      { 'iniciativa.members.userId': req.usuario._id }
    ] } },
    { $sort: { createdAt: -1, _id: -1 } },
    { $facet: {
      items: [{ $skip: (pagina - 1) * cantidad }, { $limit: cantidad }],
      conteo: [{ $count: 'total' }]
    } }
  ]).toArray();
  const total = resultado.conteo[0]?.total || 0;
  res.json({
    items: await Promise.all(resultado.items.map((doc) => representar(doc, doc.iniciativa, req.usuario))),
    page: pagina, size: cantidad, total, totalPages: Math.ceil(total / cantidad)
  });
});

function idValido(id) {
  if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) throw error(400, 'Identificador inválido');
  return new ObjectId(id);
}

async function buscarSolicitud(id) {
  const db = obtenerDB();
  const solicitud = await db.collection('requests').findOne({ _id: idValido(id) });
  if (!solicitud) throw error(404, 'Solicitud inexistente');
  const iniciativa = await db.collection('initiatives').findOne({ _id: solicitud.initiativeId });
  if (!iniciativa) throw error(404, 'Iniciativa inexistente');
  return { solicitud, iniciativa };
}

function esPropietario(iniciativa, usuario) {
  return String(iniciativa.ownerId) === String(usuario._id);
}

async function representarCompleta(solicitud, iniciativa) {
  const usuario = await obtenerDB().collection('users').findOne({ _id: solicitud.requesterId });
  if (!usuario) throw error(404, 'Solicitante inexistente');
  return representar(solicitud, iniciativa, usuario);
}

router.get('/initiatives/:id/requests', requerirSesion, async (req, res) => {
  const db = obtenerDB();
  const iniciativa = await db.collection('initiatives').findOne({ _id: idValido(req.params.id) });
  if (!iniciativa) throw error(404, 'Iniciativa inexistente');
  if (!esPropietario(iniciativa, req.usuario)) throw error(403, 'Solo el propietario puede consultar las solicitudes');
  const { status = '', page = '1', size = '12' } = req.query;
  if (typeof status !== 'string' || typeof page !== 'string' || typeof size !== 'string' ||
      (status && !estados.includes(status)) || !/^\d+$/.test(page) || !/^\d+$/.test(size) ||
      Number(page) < 1 || Number(size) < 1 || Number(size) > 100 ||
      !Number.isSafeInteger(Number(page)) || !Number.isSafeInteger((Number(page) - 1) * Number(size))) {
    throw error(400, 'Filtros o paginación inválidos');
  }
  const filtro = { initiativeId: iniciativa._id };
  if (status) filtro.status = status;
  const pagina = Number(page), cantidad = Number(size), solicitudes = db.collection('requests');
  const [documentos, total] = await Promise.all([
    solicitudes.find(filtro).sort({ createdAt: -1, _id: -1 }).skip((pagina - 1) * cantidad).limit(cantidad).toArray(),
    solicitudes.countDocuments(filtro)
  ]);
  res.json({ items: await Promise.all(documentos.map((doc) => representarCompleta(doc, iniciativa))),
    page: pagina, size: cantidad, total, totalPages: Math.ceil(total / cantidad) });
});

router.get('/requests/:id', requerirSesion, async (req, res) => {
  const { solicitud, iniciativa } = await buscarSolicitud(req.params.id);
  if (String(solicitud.requesterId) !== String(req.usuario._id) && !esPropietario(iniciativa, req.usuario)) {
    throw error(403, 'No tiene acceso a esta solicitud');
  }
  if (iniciativa.visibility === 'Privada' && !esPropietario(iniciativa, req.usuario) &&
      !(iniciativa.members || []).some((m) => String(m.userId) === String(req.usuario._id))) {
    throw error(404, 'Solicitud inexistente');
  }
  res.json(await representarCompleta(solicitud, iniciativa));
});

router.put('/requests/:id', requerirSesion, async (req, res) => {
  const { solicitud, iniciativa } = await buscarSolicitud(req.params.id);
  if (String(solicitud.requesterId) !== String(req.usuario._id)) throw error(403, 'Solo el solicitante puede modificarla');
  if (iniciativa.visibility === 'Privada' && !esPropietario(iniciativa, req.usuario) &&
      !(iniciativa.members || []).some((m) => String(m.userId) === String(req.usuario._id))) {
    throw error(404, 'Solicitud inexistente');
  }
  if (solicitud.status !== 'Pendiente') throw error(409, 'La solicitud ya no está pendiente');
  const { message, mainSkillId, role, availability } = req.body || {};
  if (Object.keys(req.body || {}).some((campo) => !['message', 'mainSkillId', 'role', 'availability'].includes(campo)) ||
      !texto(message, 30, 500) || !texto(role, 3, 60) || !texto(availability, 3, 60)) {
    throw error(400, 'Los datos de la solicitud no son válidos');
  }
  const competenciaId = idValido(mainSkillId);
  if (!(iniciativa.skills || []).some((id) => String(id) === String(competenciaId))) throw error(400, 'La competencia no corresponde a la iniciativa');
  const cambios = { message: message.trim(), mainSkillId: competenciaId, role: role.trim(),
    availability: availability.trim(), updatedAt: new Date() };
  const resultado = await obtenerDB().collection('requests').updateOne(
    { _id: solicitud._id, requesterId: req.usuario._id, status: 'Pendiente' }, { $set: cambios }
  );
  if (!resultado.matchedCount) throw error(409, 'La solicitud ya cambió');
  res.json(await representarCompleta({ ...solicitud, ...cambios }, iniciativa));
});

router.patch('/requests/:id/:accion', requerirSesion, async (req, res) => {
  const { accion } = req.params;
  if (!['cancel', 'accept', 'reject'].includes(accion)) throw error(404, 'Ruta inexistente');
  const id = idValido(req.params.id), db = obtenerDB();
  const resultado = await ejecutarTransaccion(async (sesion) => {
    const solicitudes = db.collection('requests'), iniciativas = db.collection('initiatives');
    const solicitud = await solicitudes.findOne({ _id: id }, { session: sesion });
    if (!solicitud) throw error(404, 'Solicitud inexistente');
    const iniciativa = await iniciativas.findOne({ _id: solicitud.initiativeId }, { session: sesion });
    if (!iniciativa) throw error(404, 'Iniciativa inexistente');
    if (accion === 'cancel' ? String(solicitud.requesterId) !== String(req.usuario._id) : !esPropietario(iniciativa, req.usuario)) {
      throw error(403, 'No tiene permiso para realizar esta acción');
    }
    if (accion === 'cancel' && iniciativa.visibility === 'Privada' && !esPropietario(iniciativa, req.usuario) &&
        !(iniciativa.members || []).some((m) => String(m.userId) === String(req.usuario._id))) {
      throw error(404, 'Solicitud inexistente');
    }
    if (solicitud.status !== 'Pendiente') throw error(409, 'La solicitud ya no está pendiente');
    const fecha = new Date();
    if (accion === 'accept') {
      const miembros = iniciativa.members || [];
      if (['Borrador', 'Archivada', 'Convertida en proyecto'].includes(iniciativa.status) ||
          miembros.length >= iniciativa.capacity || miembros.some((m) => String(m.userId) === String(solicitud.requesterId))) {
        throw error(409, 'No se puede incorporar al equipo');
      }
      await iniciativas.updateOne({ _id: iniciativa._id }, {
        $push: { members: { userId: solicitud.requesterId, role: solicitud.role, joinedAt: fecha } },
        $set: { updatedAt: fecha }
      }, { session: sesion });
    }
    const estado = { cancel: 'Cancelada', accept: 'Aceptada', reject: 'Rechazada' }[accion];
    const cambios = { status: estado, updatedAt: fecha, resolvedAt: accion === 'cancel' ? null : fecha };
    const actualizado = await solicitudes.updateOne({ _id: id, status: 'Pendiente' }, { $set: cambios }, { session: sesion });
    if (!actualizado.matchedCount) throw error(409, 'La solicitud ya cambió');
    return { solicitud: { ...solicitud, ...cambios }, iniciativa };
  });
  res.json(await representarCompleta(resultado.solicitud, resultado.iniciativa));
});

export default router;
