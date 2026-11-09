const env = {
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME || 'innovation-hub',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
};

if (!env.mongoUri) {
  throw new Error('Falta configurar MONGODB_URI');
}

if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
  throw new Error('El puerto configurado no es válido');
}

export default env;
