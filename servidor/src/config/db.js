import { setServers } from 'node:dns';
import { MongoClient } from 'mongodb';
import env from './env.js';

const client = new MongoClient(env.mongoUri);
let db;

export async function conectarDB() {
  if (process.env.MONGODB_DNS_SERVERS) {
    const servidores = process.env.MONGODB_DNS_SERVERS.split(',')
      .map((servidor) => servidor.trim())
      .filter(Boolean);
    setServers(servidores);
  }

  await client.connect();
  db = client.db(env.dbName);
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  const iniciativas = db.collection('initiatives');
  try {
    await iniciativas.createIndex({ titleKey: 1 }, {
      unique: true, partialFilterExpression: { titleKey: { $type: 'string' } }
    });
  } catch (error) {
    if (error.code !== 86) throw error;
    const indices = await iniciativas.listIndexes().toArray();
    const indiceCompatible = indices.some((indice) =>
      indice.key?.titleKey === 1 && Object.keys(indice.key).length === 1 &&
      indice.unique && !indice.partialFilterExpression && !indice.sparse && !indice.collation
    );
    if (!indiceCompatible) throw error;
  }
  await db.collection('requests').createIndex(
    { initiativeId: 1, requesterId: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'Pendiente' } }
  );
  await db.collection('projects').createIndex({ initiativeId: 1 }, { unique: true });
  await db.collection('sessions').createIndex({ tokenHash: 1 }, { unique: true });
  await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  return db;
}

export function obtenerDB() {
  if (!db) throw new Error('La base de datos no está conectada');
  return db;
}

export async function cerrarDB() {
  await client.close();
  db = undefined;
}

export async function ejecutarTransaccion(operacion) {
  const sesion = client.startSession();
  try {
    return await sesion.withTransaction(() => operacion(sesion));
  } finally {
    await sesion.endSession();
  }
}
