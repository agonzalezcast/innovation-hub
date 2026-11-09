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
  await db.collection('initiatives').createIndex({ titleKey: 1 }, {
    unique: true, partialFilterExpression: { titleKey: { $type: 'string' } }
  });
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
