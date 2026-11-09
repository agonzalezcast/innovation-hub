import { MongoClient } from 'mongodb';
import env from './env.js';

const client = new MongoClient(env.mongoUri);
let db;

export async function conectarDB() {
  await client.connect();
  db = client.db(env.dbName);
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
