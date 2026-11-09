import app from './app.js';
import env from './config/env.js';
import { cerrarDB, conectarDB } from './config/db.js';

try {
  await conectarDB();
  app.listen(env.port, () => {
    console.log(`Servidor escuchando en el puerto ${env.port}`);
  });
} catch (error) {
  console.error('No se pudo iniciar el servidor. Revisá la conexión a MongoDB.');
  await cerrarDB();
  process.exitCode = 1;
}
