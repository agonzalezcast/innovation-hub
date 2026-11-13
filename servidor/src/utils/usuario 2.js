import { obtenerDB } from '../config/db.js';

export async function usuarioPublico(usuario) {
  const ids = usuario.skills || [];
  const competencias = ids.length
    ? await obtenerDB().collection('skills').find({ _id: { $in: ids } }).toArray()
    : [];

  return {
    id: String(usuario._id),
    fullName: [usuario.firstName, usuario.lastName, usuario.secondLastName].filter(Boolean).join(' '),
    memberType: usuario.memberType,
    career: usuario.career,
    description: usuario.description || '',
    skills: competencias.map(({ _id, name }) => ({ id: String(_id), name })),
    interests: usuario.interests || [],
    availability: usuario.availability || '',
    portfolioUrl: usuario.portfolioUrl || null
  };
}

export async function usuarioPropio(usuario) {
  return {
    ...await usuarioPublico(usuario),
    firstName: usuario.firstName,
    lastName: usuario.lastName,
    secondLastName: usuario.secondLastName || '',
    email: usuario.email,
    active: usuario.active,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt
  };
}
