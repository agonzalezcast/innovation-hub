# Innovation Hub

Proyecto de SOFT-12, Programación Web Avanzada. Innovation Hub es una aplicación para publicar iniciativas, encontrar personas con competencias complementarias, gestionar solicitudes de participación y organizar equipos y proyectos.

## Integrantes

- Alexander González Castillo
- Carlos I. Morales Rojas

**Sección:** SCV2

**Periodo:** III cuatrimestre 2026

**Docente:** Álvaro Cordero Peña

## Tecnologías

- `avance1/`: prototipo inicial en HTML, Sass, Bootstrap y JavaScript.
- `cliente/`: interfaz en React y Vite.
- `servidor/`: API REST en Express y MongoDB.
- `docs/`: contrato de la API, especificación OpenAPI y modelo de datos.
- `pruebas/`: colección de solicitudes para Postman.

## Requisitos

- Node.js y npm.
- Una base de datos MongoDB accesible desde el equipo (RECORDAR ALLOW DE LA IP. )
- Completar el .env

## Configuración local

1. Desde la raíz del repositorio, instale las dependencias del cliente y del servidor:

   ```bash
   cd cliente
   npm install
   cd ../servidor
   npm install
   ```

2. Prepare MongoDB Atlas:

   - Cree un proyecto y un clúster de MongoDB Atlas.
   - Cree un usuario de base de datos y permita en Network Access la dirección IP desde la que ejecutará el proyecto.
   - Copie la cadena de conexión del clúster y sustituya en ella las credenciales de ejemplo por las del usuario creado.

   El servidor usa la base indicada por `DB_NAME`; MongoDB la crea al guardar los primeros datos, así que no necesita crearla manualmente en Atlas. Para cargar datos de ejemplo, consulte la sección [Datos de prueba](#datos-de-prueba).

3. Genere o cree el archivo local `servidor/dev.env`, ignorado por Git. Guarde la cadena de conexión como `MONGODB_URI` (también se acepta `mongodbstring`). Configure además:

   ```env
   PORT=3000
   DB_NAME=innovation-hub
   CLIENT_ORIGIN=http://localhost:5173
   ```


4. Configure `cliente/.env` con la URL de la API. Puede partir de `cliente/.env.example`:

   ```env
   VITE_API_URL=http://localhost:3000/api
   ```


## Ejecutar en desarrollo

Inicie el servidor en una terminal:

```bash
cd servidor
npm run dev
```

Inicie la interfaz en otra terminal:

```bash
cd cliente
npm run dev
```

Abra la dirección local que indique Vite, normalmente `http://localhost:5173`. La API usa `http://localhost:3000/api`; su verificación de estado está en `/api/health` y la documentación interactiva en `/api/docs`.

## Datos de prueba

Para poblar una base separada con datos de ejemplo, siga las instrucciones de [`servidor/datos-prueba/README.md`](servidor/datos-prueba/README.md). El script es idempotente y está destinado al desarrollo local.

## Documentación y pruebas de API

- Contrato: [`docs/api-contract.md`](docs/api-contract.md)
- OpenAPI: [`docs/openapi.json`](docs/openapi.json)
- Modelo de datos: [`docs/modelo-datos.md`](docs/modelo-datos.md)
- Colección Postman: [`pruebas/InnovationHub.postman_collection.json`](pruebas/InnovationHub.postman_collection.json)



## Comandos útiles

El prototipo del Avance 1 también puede servirse por separado desde la raíz del repositorio:

```bash
npx serve avance1
```
