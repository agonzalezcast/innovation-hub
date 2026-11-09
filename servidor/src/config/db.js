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
