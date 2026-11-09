import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import { manejarError, rutaNoEncontrada } from './middlewares/errores.js';

const app = express();

app.use(cors({
  origin: env.clientOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(rutaNoEncontrada);
app.use(manejarError);

export default app;
