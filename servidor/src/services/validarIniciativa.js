import { ObjectId } from 'mongodb';
import { obtenerDB } from '../config/db.js';

const tipos = ['Idea', 'Necesidad', 'Reto'];
const categorias = ['Tecnología', 'Educación', 'Sostenibilidad', 'Impacto social',
  'Negocios y emprendimiento', 'Salud y bienestar', 'Cultura y creatividad', 'Otro'];
const visibilidades = ['Pública', 'Institucional', 'Restringida', 'Privada'];
const campos = ['title', 'type', 'summary', 'description', 'problem', 'beneficiaries',
  'category', 'skillIds', 'capacity', 'visibility', 'tags'];

function error(status, message) {
  return Object.assign(new Error(message), { status });
}

function texto(valor, minimo, maximo) {
  return typeof valor === 'string' && valor.trim().length >= minimo && valor.trim().length <= maximo;
}

export async function validarIniciativa(datos) {
  const { title, type, summary, description, problem = '', beneficiaries = '', category,
    skillIds, capacity, visibility, tags = [] } = datos;
  if (Object.keys(datos).some((campo) => !campos.includes(campo)) ||
      !texto(title, 5, 80) || !tipos.includes(type) || !texto(summary, 20, 200) ||
      !texto(description, 30, 1000) || !categorias.includes(category) || !visibilidades.includes(visibility) ||
      (problem !== '' && !texto(problem, 10, 500)) ||
      (beneficiaries !== '' && !texto(beneficiaries, 10, 150)) ||
      !Number.isInteger(capacity) || capacity < 1 || capacity > 20 ||
      !Array.isArray(skillIds) || skillIds.length === 0 ||
      skillIds.some((id) => typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) ||
      new Set(skillIds.map((id) => id.toLowerCase())).size !== skillIds.length ||
      !Array.isArray(tags) || tags.some((tag) => !texto(tag, 2, 20)) ||
      new Set(tags.map((tag) => tag.trim().toLocaleLowerCase('es'))).size !== tags.length) {
    throw error(400, 'Los datos de la iniciativa no son válidos');
  }

  const skills = skillIds.map((id) => new ObjectId(id));
  const cantidad = await obtenerDB().collection('skills').countDocuments({ _id: { $in: skills } });
  if (cantidad !== skills.length) throw error(404, 'Competencia inexistente');

  const titulo = title.trim();
  return {
    title: titulo, titleKey: titulo.toLocaleLowerCase('es'), type, summary: summary.trim(),
    description: description.trim(), problem: problem.trim() || null,
    beneficiaries: beneficiaries.trim() || null, category, skills, capacity, visibility,
    tags: tags.map((tag) => tag.trim())
  };
}
