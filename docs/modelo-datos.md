# Modelo de datos

La información del Innovation Hub se guarda en MongoDB. Este documento describe las colecciones y explica, para cada relación, si se resolvió con documentos embebidos o con referencias y por qué.

En la entrega final el mismo dominio se va a modelar sobre tablas, así que en cada decisión se indica también cómo quedaría en un modelo relacional.

## Convenciones

- Los nombres de los campos van en inglés y en `camelCase`, igual que en el contrato de la API.
- Los valores controlados (tipo, categoría, visibilidad, estado) se guardan en español, como aparecen en la descripción general del proyecto.
- Las fechas se guardan como `Date` y se devuelven en ISO 8601.
- La API nunca devuelve `_id`, `__v` ni `passwordHash`; el identificador se expone como `id` en texto.

## Colecciones

### `users`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `fullName` | String | Obligatorio |
| `email` | String | Obligatorio, único (RN-01). No se modifica desde el perfil |
| `passwordHash` | String | Hash con bcrypt. Nunca se devuelve |
| `memberType` | String | Estudiante, docente, egresado, etc. |
| `career` | String | |
| `description` | String | |
| `skills` | [ObjectId] | Referencias a `skills` |
| `interests` | [String] | |
| `availability` | String | |
| `portfolioUrl` | String | Opcional |
| `active` | Boolean | Solo un usuario activo puede ser propietario (RN-03) |
| `createdAt`, `updatedAt` | Date | |

### `skills`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `name` | String | Único |

### `initiatives`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `title`, `summary`, `description`, `problem`, `beneficiaries` | String | |
| `type` | String | Idea, Necesidad o Reto (RN-04) |
| `category` | String | Valor controlado |
| `skills` | [ObjectId] | Competencias requeridas, referencias a `skills` |
| `capacity` | Number | Cantidad de integrantes |
| `visibility` | String | Pública, Institucional, Restringida o Privada (RN-05) |
| `status` | String | Borrador, Publicada, En formación de equipo, Convertida en proyecto o Archivada |
| `ownerId` | ObjectId | Referencia a `users`, exactamente uno (RN-02) |
| `members` | [Miembro] | Embebido, ver abajo |
| `tags` | [String] | |
| `publishedAt`, `createdAt`, `updatedAt` | Date | |

Miembro embebido:

| Campo | Tipo | Notas |
|---|---|---|
| `userId` | ObjectId | Referencia a `users` |
| `role` | String | |
| `joinedAt` | Date | |

### `requests`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `initiativeId` | ObjectId | Referencia a `initiatives` |
| `requesterId` | ObjectId | Referencia a `users` |
| `message` | String | |
| `mainSkillId` | ObjectId | Referencia a `skills` |
| `role` | String | Rol propuesto |
| `availability` | String | |
| `status` | String | Pendiente, Aceptada, Rechazada o Cancelada |
| `createdAt`, `updatedAt`, `resolvedAt` | Date | |

### `projects`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `initiativeId` | ObjectId | Referencia a la iniciativa de origen, única (RN-18) |
| `name`, `description`, `objective` | String | |
| `startDate` | Date | |
| `status` | String | |
| `repositoryUrl` | String | Opcional, `https://github.com/{owner}/{repo}` |
| `createdAt`, `updatedAt` | Date | |

### `sessions`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `token` | String | Único |
| `userId` | ObjectId | Referencia a `users` |
| `expiresAt` | Date | Índice TTL: Mongo borra la sesión al vencer |

## Relaciones y justificación

| Relación | Decisión | Por qué | En tablas |
|---|---|---|---|
| Usuario ↔ competencias (N:M) | Referencia (`users.skills`) | El catálogo de competencias es compartido, se filtra por él y un nombre se corrige en un solo lugar | Tabla intermedia `usuario_competencia` |
| Iniciativa ↔ competencias requeridas (N:M) | Referencia (`initiatives.skills`) | Igual que en usuarios; permite buscar iniciativas por competencia con un índice | Tabla intermedia `iniciativa_competencia` |
| Iniciativa → propietario (N:1) | Referencia (`ownerId`) | El usuario existe por sí solo y sus datos cambian; copiarlos en cada iniciativa los desincroniza | Llave foránea `id_propietario` |
| Iniciativa → miembros del equipo (1:N acotado) | Embebido (`members`) | La lista está limitada por el cupo, siempre se lee junto con la iniciativa y la incorporación se puede hacer en una sola operación atómica, lo que ayuda a cumplir RN-15. Solo se guarda el `userId`, no copias del nombre ni de la carrera | Tabla `miembro_equipo` con llave compuesta (`id_iniciativa`, `id_usuario`) |
| Solicitud → iniciativa y solicitante | Referencia (colección propia) | Las solicitudes crecen sin límite, se consultan desde los dos lados (mis solicitudes y solicitudes recibidas) y se paginan y filtran por estado | Tabla `solicitud` con dos llaves foráneas |
| Proyecto → iniciativa de origen (1:1) | Referencia (`initiativeId`, único) | La iniciativa se conserva para mantener el vínculo con el problema original (RN-19) y solo puede generar un proyecto (RN-18) | Llave foránea única `id_iniciativa` |
| Sesión → usuario | Referencia | Al cerrar sesión se borra el documento y el token deja de servir | Tabla `sesion` |

## Índices

- `users.email` único.
- `skills.name` único.
- `initiatives`: índice de texto sobre `title` y `summary` para la búsqueda `q`; índices sobre `type`, `category`, `skills`, `visibility` y `ownerId`.
- `initiatives.members.userId` para listar las iniciativas de las que un usuario es miembro.
- `requests`: `{ initiativeId, status }` para las solicitudes recibidas y `{ requesterId, status }` para las propias.
- `projects.initiativeId` único.
- `sessions.token` único y TTL sobre `expiresAt`.

## Cambios respecto al avance 1

En el avance 1 cada iniciativa guardaba el id del propietario y además una copia de su nombre, y cada miembro guardaba su nombre y su carrera. En este avance solo se guardan los ids y los datos del usuario se obtienen de `users`, para que no se desincronicen.
