import { Router } from 'express';
import { obtenerDB } from '../config/db.js';

const router = Router();

router.get('/skills', async (req, res) => {
  const { q } = req.query;
  if (q !== undefined && typeof q !== 'string') {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'La búsqueda no es válida' }
    });
  }

  const filtro = {};
  if (q && q.trim()) {
    const texto = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filtro.name = { $regex: texto, $options: 'i' };
  }

  const competencias = await obtenerDB().collection('skills')
    .find(filtro)
    .sort({ name: 1 })
    .toArray();

  res.json({
    items: competencias.map((competencia) => ({
      id: String(competencia._id),
      name: competencia.name
    }))
  });
});

export default router;
