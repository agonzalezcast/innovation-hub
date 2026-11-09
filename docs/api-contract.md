# Contrato de API — Innovation Hub

**Ámbito:** Avance 2 (React + Express + MongoDB), con rutas adicionales ya definidas para la entrega final en ASP.NET Core.

## 1. Convenciones generales

- Prefijo: `/api`. React obtiene la URL base desde `VITE_API_URL`; nunca consulta MongoDB directamente.

- Transporte: HTTP(S), JSON UTF-8. En peticiones con cuerpo: `Content-Type: application/json`.

- Nombres de propiedades: inglés y `camelCase`. Los **valores controlados** permanecen en español y son sensibles a su escritura exacta.

- `id` y todos los identificadores relacionados: **cadenas opacas**, nunca números ni tipos internos de MongoDB. No se exponen `_id`, `__v`, `passwordHash`, tokens ajenos ni secretos.

- Fechas y horas: ISO 8601 UTC (`2026-11-08T18:00:00.000Z`); fechas de solo calendario, cuando corresponda, `YYYY-MM-DD` en las peticiones.

- No se aceptan campos de propiedad o autorización suministrados por el cliente (`ownerId`, `requesterId`, `active`, `members`, etc.) cuando el servidor debe calcularlos.

- Autenticación: `Authorization: Bearer \<token>` para rutas protegidas. Token opaco de sesión almacenada en el servidor; `POST /api/auth/logout` lo invalida. No se promete JWT. Token inválido/expirado: `401`.

- El backend aplica **todas** las validaciones, autorizaciones, filtros de visibilidad y reglas de negocio, aunque React también valide para mejorar la experiencia.

- Una ruta de lectura pública puede aceptar un token opcional para devolver más información cuando el usuario tenga acceso; un token inválido no concede acceso.

- Las rutas con `{id}` usan IDs opacos. ID mal formado: `400`; inexistente o no visible: `404`; existente pero operación prohibida para un usuario autenticado: `403`.

- Una operación exitosa que devuelve JSON usa `200` (lectura/edición) o `201` (creación); una operación sin cuerpo usa `204` (sin JSON). `500` es error interno. Una dependencia externa fallida puede producir `502` o `503` cuando corresponda.

### 1.1 Paginación

Para endpoints paginados: `page` (entero desde 1; por defecto 1), `size` (entero 1–100; por defecto 12). Parámetros inválidos: `400`. Orden predeterminado: `createdAt` descendente, con `id` como desempate estable. El servidor filtra y ordena **antes** de paginar.

```json

{

  "items": [],

  "page": 1,

  "size": 12,

  "total": 0,

  "totalPages": 0

}

```

`total` es el número de resultados **visibles y filtrados**, no el total de documentos de la colección. Sin resultados: `200` con `items: []`.

### 1.2 Errores uniformes

```json

{

  "error": {

    "code": "VALIDATION_ERROR",

    "message": "Los datos enviados no son válidos.",

    "details": { "title": "El título debe tener entre 5 y 80 caracteres." }

  }

}

```

`details` es opcional. Códigos de error estables: `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `INTERNAL_ERROR` (500), `UPSTREAM_ERROR` (502), `SERVICE_UNAVAILABLE` (503). Nunca se incluyen trazas, cadenas de conexión ni detalles sensibles.

### 1.3 Valores controlados

| Campo | Valores válidos |

|---|---|

| `type` | `Idea`, `Necesidad`, `Reto` |

| `visibility` | `Pública`, `Institucional`, `Restringida`, `Privada` |

| `initiative.status` | `Borrador`, `Publicada`, `En formación de equipo`, `Convertida en proyecto`, `Archivada` |

| `request.status` | `Pendiente`, `Aceptada`, `Rechazada`, `Cancelada` |

| `project.status` | `Planificación`, `En desarrollo`, `Pausado`, `Finalizado`, `Archivado` |

| `memberType` | `Estudiante`, `Docente`, `Administrativo` |

| `category` | `Tecnología`, `Educación`, `Sostenibilidad`, `Impacto social`, `Negocios y emprendimiento`, `Salud y bienestar`, `Cultura y creatividad`, `Otro` |

Los nombres de competencias son datos del catálogo `skills`, no valores arbitrarios enviados por cada iniciativa.

## 2. Formatos compartidos

### 2.1 Usuario público (`UserPublic`)

```json

{

  "id": "user-1",

  "fullName": "Ana Rodríguez Mora",

  "memberType": "Estudiante",

  "career": "Ingeniería de Software",

  "description": "Me interesa el desarrollo web.",

  "skills": [{ "id": "skill-1", "name": "Programación" }],

  "interests": ["Educación"],

  "availability": "Fines de semana",

  "portfolioUrl": "https://github.com/ana"

}

```

`UserSelf` añade `email`, `active`, `createdAt`, `updatedAt`. `password`, `passwordConfirmation`, `passwordHash` y token **nunca** se incluyen en objetos de usuario.

### 2.2 Competencia (`Skill`)

```json

{ "id": "skill-1", "name": "Programación" }

```

Las respuestas de lectura presentan competencias como **objetos** `{id,name}`; las peticiones de escritura usan `skillIds: ["skill-1"]`. Esta convención se aplica a perfiles e iniciativas y evita mezclar nombres e identificadores.

### 2.3 Miembro (`TeamMember`)

```json

{

  "user": { "id": "user-1", "fullName": "Ana Rodríguez Mora" },

  "role": "Propietario",

  "joinedAt": "2026-11-08T18:00:00.000Z"

}

```

### 2.4 Iniciativa: resumen (`InitiativeSummary`)

```json

{

  "id": "initiative-1",

  "title": "Plataforma de tutorías",

  "type": "Idea",

  "summary": "Conectar estudiantes con tutores voluntarios de la universidad.",

  "category": "Educación",

  "skills": [{ "id": "skill-1", "name": "Programación" }],

  "visibility": "Pública",

  "status": "Publicada",

  "capacity": 5,

  "memberCount": 2,

  "createdAt": "2026-11-08T18:00:00.000Z"

}

```

### 2.5 Iniciativa: detalle completo (`InitiativeDetail`)

```json

{

  "id": "initiative-1",

  "title": "Plataforma de tutorías",

  "type": "Idea",

  "summary": "Conectar estudiantes con tutores voluntarios de la universidad.",

  "description": "Una plataforma para gestionar tutorías académicas y voluntariado.",

  "problem": "Dificultad para encontrar apoyo académico a tiempo.",

  "beneficiaries": "Estudiantes universitarios",

  "category": "Educación",

  "skills": [{ "id": "skill-1", "name": "Programación" }],

  "capacity": 5,

  "visibility": "Pública",

  "status": "Publicada",

  "owner": { "id": "user-1", "fullName": "Ana Rodríguez Mora" },

  "members": [{ "user": { "id": "user-1", "fullName": "Ana Rodríguez Mora" }, "role": "Propietario", "joinedAt": "2026-11-08T18:00:00.000Z" }],

  "tags": ["educación", "tutorías"],

  "publishedAt": "2026-11-08T18:00:00.000Z",

  "createdAt": "2026-11-08T18:00:00.000Z",

  "updatedAt": "2026-11-08T18:00:00.000Z"

}

```

Campos opcionales `problem`, `beneficiaries`, `publishedAt`: se devuelven como `null` si no tienen valor; las propiedades de acceso restringido **se omiten** en vez de devolverse con `null`.

### 2.6 Iniciativa restringida (`InitiativeRestricted`)

```json

{

  "id": "initiative-1",

  "title": "Plataforma de tutorías",

  "type": "Idea",

  "summary": "Conectar estudiantes con tutores voluntarios de la universidad.",

  "category": "Educación",

  "skills": [{ "id": "skill-1", "name": "Programación" }]

}

```

Solo esos campos, además de `id` para navegación. No incluir `description`, `problem`, `beneficiaries`, `owner`, `members`, `capacity`, `status`, `tags` ni fechas en la vista restringida.

## 3. Visibilidad y autorización

| Visibilidad | Visitante | Usuario autenticado ajeno | Propietario / miembro aceptado |

|---|---|---|---|

| Pública | Completa | Completa | Completa |

| Institucional | No accede al detalle | Completa | Completa |

| Restringida | No accede al detalle ni al catálogo restringido | Solo `InitiativeRestricted` | Completa |

| Privada | No aparece / 404 | No aparece / 404 | Completa |

El catálogo general muestra únicamente iniciativas públicas a visitantes. Para usuarios autenticados incluye iniciativas públicas, institucionales y restringidas; las restringidas se representan exclusivamente con `InitiativeRestricted` si el usuario no es propietario ni miembro aceptado. Las privadas se consultan únicamente mediante vistas propias o por acceso autorizado directo, nunca en el catálogo general. Las iniciativas en borrador o archivadas no aparecen en el catálogo general. El servidor aplica estas reglas también a listados, búsquedas, solicitudes, miembros y proyectos vinculados. La restricción para visitantes se deriva del rol de visitante definido en la descripción general del proyecto: solo consulta información pública.

## 4. Autenticación

### `POST /api/auth/register`

Pública. Petición:

```json

{

  "firstName": "Ana",

  "lastName": "Rodríguez",

  "secondLastName": "Mora",

  "email": "ana@universidad.ac.cr",

  "password": "ClaveSegura123",

  "passwordConfirmation": "ClaveSegura123",

  "memberType": "Estudiante",

  "career": "Ingeniería de Software",

  "acceptTerms": true

}

```

`secondLastName` es opcional; `acceptTerms` debe ser `true`; contraseña y confirmación deben coincidir. El servidor calcula `fullName`, crea la cuenta activa y almacena el hash, nunca la contraseña. Respuesta `201`: `UserSelf` (sin token; el usuario inicia sesión aparte). Errores: `400`, `409` (correo duplicado), `500`.

### `POST /api/auth/login`

Pública. Petición: `{ "email": "ana@universidad.ac.cr", "password": "ClaveSegura123" }`. Respuesta `200`:

```json

{ "token": "TOKEN_OPACO_DE_EJEMPLO", "user": { "id": "user-1", "fullName": "Ana Rodríguez Mora", "email": "ana@universidad.ac.cr", "memberType": "Estudiante", "active": true } }

```

Credenciales incorrectas, sesión inválida o cuenta inactiva: `401` con mensaje genérico. Otros errores: `400`, `500`.

### `POST /api/auth/logout`

Protegida. Sin cuerpo. Invalida la sesión actual. Respuesta `204`. Errores: `401`, `500`.

### `GET /api/auth/me`

Protegida. Respuesta `200`: `UserSelf`. Errores: `401`, `500`.

## 5. Usuarios

### `GET /api/users?q=&skill=&career=&availability=&page=&size=`

Protegida. `q` busca nombre; `skill` es ID de competencia; `career` y `availability` filtran por valores textuales. Respuesta `200`: paginada, `items` de `UserPublic`. Errores: `400`, `401`, `500`.

### `GET /api/users/{id}`

Protegida. Respuesta `200`: `UserPublic`. Errores: `400`, `401`, `404`, `500`.

### `PUT /api/users/me`

Protegida. Reemplaza los campos editables del perfil. Petición:

```json

{

  "firstName": "Ana",

  "lastName": "Rodríguez",

  "secondLastName": "Mora",

  "memberType": "Estudiante",

  "career": "Ingeniería de Software",

  "description": "Me interesa el desarrollo web.",

  "skillIds": ["skill-1"],

  "interests": ["Educación"],

  "availability": "Fines de semana",

  "portfolioUrl": "https://github.com/ana"

}

```

Respuesta `200`: `UserSelf`. `email`, `id`, `active` y contraseña no se modifican aquí. Errores: `400`, `401`, `404` (competencia inexistente), `500`.

### `PATCH /api/users/me/deactivate`

Protegida. Petición: `{ "confirm": true }`. Respuesta `204`. Desactiva la cuenta sin borrar el historial relacionado e invalida sus sesiones. El usuario debe archivar sus iniciativas propias antes de desactivar la cuenta. Errores: `400`, `401`, `409` (tiene iniciativas propias sin archivar), `500`.

## 6. Competencias

### `GET /api/skills?q=`

Pública. `q` opcional, búsqueda por nombre. Respuesta `200`:

```json

{ "items": [{ "id": "skill-1", "name": "Programación" }] }

```

Errores: `400`, `500`. En Avance 2 se requiere principalmente consultar el catálogo y asociar competencias a usuarios/iniciativas. Las operaciones administrativas de crear/editar/eliminar competencias quedan fuera del flujo obligatorio de este avance y requerirían autorización de administrador.

## 7. Iniciativas

### `GET /api/initiatives?type=&category=&skill=&q=&page=&size=`

Pública con visibilidad dependiente de sesión. `skill` recibe ID de competencia; `q` busca título, resumen o etiquetas. Respuesta `200`: objeto paginado, `items` de `InitiativeSummary` o `InitiativeRestricted` según permisos. Errores: `400`, `500`.

### `GET /api/initiatives/{id}`

Pública con visibilidad dependiente de sesión. Respuesta `200`: `InitiativeDetail` o `InitiativeRestricted`, según permisos. Errores: `400`, `401` (institucional/restringida sin sesión), `404` (no existe o es privada sin acceso), `500`.

### `GET /api/initiatives/mine?page=&size=`

Protegida. Iniciativas del propietario autenticado, incluyendo borradores, privadas y archivadas; paginación estándar. Respuesta `200`: `items` de `InitiativeDetail`. Errores: `400`, `401`, `500`. **Ruta auxiliar necesaria para gestionar iniciativas propias sin exponerlas en el catálogo general.**

### `POST /api/initiatives`

Protegida. Petición:

```json

{

  "title": "Plataforma de tutorías",

  "type": "Idea",

  "summary": "Conectar estudiantes con tutores voluntarios de la universidad.",

  "description": "Una plataforma para gestionar tutorías académicas y voluntariado.",

  "problem": "Dificultad para encontrar apoyo académico a tiempo.",

  "beneficiaries": "Estudiantes universitarios",

  "category": "Educación",

  "skillIds": ["skill-1"],

  "capacity": 5,

  "visibility": "Pública",

  "tags": ["educación", "tutorías"]

}

```

Obligatorios: `title`, `type`, `summary`, `description`, `category`, `visibility`, `capacity` y al menos una competencia. `problem`, `beneficiaries`, `tags` opcionales según reglas aplicables. `capacity` entero positivo (en este contrato: 1–20) **incluye al propietario**. Se valida título 5–80, resumen 20–200, descripción 30–1000, problema opcional 10–500, beneficiarios opcional 10–150; tags, si se envían, únicos sin distinguir mayúsculas y de 2–20 caracteres cada uno. El título debe ser único sin distinguir mayúsculas. El servidor asigna `owner`, agrega automáticamente al propietario a `members` con rol `Propietario`, fija fechas y estado inicial `Publicada`. Respuesta `201`: `InitiativeDetail`. Errores: `400`, `401`, `404` (competencia inexistente), `409` (título duplicado), `500`.

### `PUT /api/initiatives/{id}`

Protegida; solo propietario. Petición: mismos campos editables que `POST` (reemplazo completo); no admite `owner`, `members`, `status` ni fechas. Respuesta `200`: `InitiativeDetail` actualizado. No se permite modificar iniciativas archivadas ni convertidas en proyecto. Errores: `400`, `401`, `403`, `404`, `409`, `500`.

### `DELETE /api/initiatives/{id}`

Protegida; solo propietario. Sin cuerpo. Si no hay solicitudes, miembros adicionales ni proyecto asociado, se elimina físicamente; si existe información relacionada, se cambia `status` a `Archivada` preservando relaciones. El propietario automático no impide la eliminación física. Respuesta `204` en ambos casos. Errores: `400`, `401`, `403`, `404`, `409`, `500`.

## 8. Solicitudes de participación

Formato de lectura `ParticipationRequest`:

```json

{

  "id": "request-1",

  "initiative": { "id": "initiative-1", "title": "Plataforma de tutorías" },

  "requester": { "id": "user-2", "fullName": "Luis Pérez" },

  "message": "Me interesa participar y puedo contribuir con el desarrollo frontend.",

  "mainSkill": { "id": "skill-1", "name": "Programación" },

  "role": "Desarrollador frontend",

  "availability": "Fines de semana",

  "status": "Pendiente",

  "createdAt": "2026-11-08T18:00:00.000Z",

  "updatedAt": "2026-11-08T18:00:00.000Z",

  "resolvedAt": null

}

```

### `POST /api/requests`

Protegida. Petición:

```json

{

  "initiativeId": "initiative-1",

  "message": "Me interesa participar y puedo contribuir con el desarrollo frontend.",

  "mainSkillId": "skill-1",

  "role": "Desarrollador frontend",

  "availability": "Fines de semana"

}

```

El servidor asigna `requester`, estado `Pendiente` y fechas. Se prohíbe solicitar participación en iniciativas propias, no accesibles, archivadas, convertidas o sin cupos, así como crear otra solicitud pendiente para la misma iniciativa o incorporarse de nuevo si ya es miembro. Respuesta `201`: `ParticipationRequest`. Errores: `400`, `401`, `403`, `404`, `409`, `500`.

### `GET /api/requests/mine?status=&page=&size=`

Protegida. Respuesta `200`: paginada, `items` de `ParticipationRequest` del solicitante autenticado. Errores: `400`, `401`, `500`.

### `GET /api/initiatives/{id}/requests?status=&page=&size=`

Protegida; solo propietario. Respuesta `200`: paginada, `items` de `ParticipationRequest` para esa iniciativa. Errores: `400`, `401`, `403`, `404`, `500`.

### `GET /api/requests/{id}`

Protegida; visible al solicitante y al propietario de la iniciativa. Respuesta `200`: `ParticipationRequest`. Errores: `400`, `401`, `403`, `404`, `500`.

### `PUT /api/requests/{id}`

Protegida; solo solicitante, únicamente si `status=Pendiente`. Petición: `message`, `mainSkillId`, `role`, `availability` (reemplazo completo). Respuesta `200`: `ParticipationRequest`. Errores: `400`, `401`, `403`, `404`, `409`, `500`.

### `PATCH /api/requests/{id}/cancel`

Protegida; solo solicitante, únicamente pendiente. Sin cuerpo. Respuesta `200`: `ParticipationRequest` con estado `Cancelada`. Errores: `400`, `401`, `403`, `404`, `409`, `500`.

### `PATCH /api/requests/{id}/accept`

Protegida; solo propietario de la iniciativa; únicamente pendiente. Sin cuerpo. Respuesta `200`: `ParticipationRequest` con estado `Aceptada` y `resolvedAt`. En la misma operación lógica, se agrega el usuario al equipo; se comprueban capacidad, ausencia de membresía duplicada y estado de iniciativa. Si no se puede agregar al equipo, **no** se acepta la solicitud. Errores: `400`, `401`, `403`, `404`, `409`, `500`.

### `PATCH /api/requests/{id}/reject`

Protegida; solo propietario; únicamente pendiente. Sin cuerpo. Respuesta `200`: `ParticipationRequest` con estado `Rechazada` y `resolvedAt`. Errores: `400`, `401`, `403`, `404`, `409`, `500`.

## 9. Equipos

### `GET /api/initiatives/{id}/members`

Protegida; propietario o miembro aceptado. Respuesta `200`: `{ "items": [TeamMember] }`. Errores: `400`, `401`, `403`, `404`, `500`.

### `DELETE /api/initiatives/{id}/members/{userId}`

Protegida; solo propietario. Sin cuerpo. No se permite eliminar al propietario; el usuario indicado debe pertenecer al equipo. Respuesta `204`. Errores: `400`, `401`, `403`, `404`, `409`, `500`.

## 10. Proyectos

`Project` (lectura):

```json

{

  "id": "project-1",

  "initiative": { "id": "initiative-1", "title": "Plataforma de tutorías" },

  "name": "Plataforma de tutorías",

  "objective": "Facilitar el acceso a tutorías académicas.",

  "description": "Sistema de coordinación de tutorías universitarias.",

  "technologies": ["React", "Node.js"],

  "startDate": "2026-11-15",

  "estimatedEndDate": null,

  "status": "Planificación",

  "repositoryUrl": "https://github.com/ejemplo/tutorias",

  "owner": { "id": "user-1", "fullName": "Ana Rodríguez Mora" },

  "members": [],

  "createdAt": "2026-11-08T18:00:00.000Z",

  "updatedAt": "2026-11-08T18:00:00.000Z"

}

```

`owner` y `members` se obtienen de la iniciativa de origen; no se envían en la creación. `repositoryUrl` y `estimatedEndDate` pueden ser `null`.

### `POST /api/initiatives/{id}/convert`

Protegida; solo propietario. Petición:

```json

{

  "name": "Plataforma de tutorías",

  "objective": "Facilitar el acceso a tutorías académicas.",

  "description": "Sistema de coordinación de tutorías universitarias.",

  "technologies": ["React", "Node.js"],

  "startDate": "2026-11-15",

  "estimatedEndDate": null,

  "repositoryUrl": "https://github.com/ejemplo/tutorias"

}

```

El servidor exige al menos un miembro adicional al propietario, impide convertir dos veces la misma iniciativa, conserva la iniciativa original y cambia su estado a `Convertida en proyecto`. El proyecto comienza en `Planificación` y conserva referencias a iniciativa, propietario y equipo. Respuesta `201`: `Project`. Errores: `400`, `401`, `403`, `404`, `409`, `500`.

### `GET /api/projects?q=&status=&page=&size=`

Protegida. Lista únicamente proyectos accesibles al usuario autenticado (propietario o miembro aceptado). En el Avance 2 se utilizan `page` y `size`; los filtros opcionales `q` y `status` se implementan en la entrega final, según la definición de esta sección. Respuesta `200`: paginada, `items` de `Project`. Errores: `400`, `401`, `500`.

### `GET /api/projects/{id}`

Protegida. Solo propietario o miembro aceptado. Respuesta `200`: `Project`. Errores: `400`, `401`, `403`, `404`, `500`.

### Información del repositorio GitHub — Avance 2

El cliente usa `repositoryUrl` del proyecto para consultar directamente la API pública de GitHub. Muestra nombre, propietario, descripción, lenguaje principal, rama principal, fecha de última actualización y cantidad de asuntos abiertos. Maneja repositorio inexistente o privado, respuesta inválida, límite de solicitudes y servicio no disponible. GitHub puede responder de la misma manera para un repositorio privado y uno inexistente.

La consulta a GitHub no forma parte de las rutas de la API propia en este avance.

### `PUT /api/projects/{id}` — Entrega final

Protegida; solo propietario de la iniciativa de origen. Reemplaza los campos editables del proyecto. Petición:

```json
{
  "name": "Plataforma de tutorías",
  "objective": "Facilitar el acceso a tutorías académicas.",
  "description": "Sistema de coordinación de tutorías universitarias.",
  "technologies": ["React", "Node.js"],
  "startDate": "2026-11-15",
  "estimatedEndDate": "2027-03-15",
  "status": "En desarrollo",
  "repositoryUrl": "https://github.com/ejemplo/tutorias"
}
```

`name`, `objective`, `description`, `technologies`, `startDate`, `estimatedEndDate`, `status` y `repositoryUrl` son los campos editables; `estimatedEndDate` y `repositoryUrl` pueden ser `null`. No se pueden modificar `id`, `initiative`, `owner`, `members` ni las fechas de auditoría. Respuesta `200`: `Project` actualizado. Errores: `400`, `401`, `403`, `404`, `409`, `500`.

### `DELETE /api/projects/{id}` — Entrega final

Protegida; solo propietario de la iniciativa de origen. Sin cuerpo. Se archiva el proyecto asignando `status: "Archivado"`; se conserva la iniciativa y el vínculo histórico entre ambos. Respuesta `204`, sin cuerpo. Errores: `400`, `401`, `403`, `404`, `409`, `500`.

**Filtros de proyectos reservados para la entrega final:** `q` busca por nombre y descripción; `status` acepta exclusivamente los valores controlados de `project.status`. Se filtra únicamente entre proyectos accesibles al usuario autenticado, antes de paginar. Respuesta `200`: formato paginado estándar con `items` de `Project`. Errores: `400`, `401`, `500`.

**Alcance por entrega:** en el Avance 2 se implementan conversión, listado y consulta de proyectos, y la consulta del repositorio GitHub desde el cliente. Los parámetros `q` y `status` del listado, así como `PUT /api/projects/{id}` y `DELETE /api/projects/{id}`, quedan definidos en este contrato para implementarse en la entrega final. No son obligatorios en el Avance 2.

## 11. Matriz de pruebas mínimas

Entregar en `pruebas/` una colección Postman o Thunder Client que cubra, para cada recurso aplicable:

| Caso | Resultado esperado |

|---|---|

| Operación válida | `200`, `201` o `204` según endpoint |

| Datos inválidos | `400` con `VALIDATION_ERROR` |

| ID inexistente | `404` con `NOT_FOUND` |

| Sin autenticación o sin permisos | `401` o `403` |

| Conflicto de negocio | `409` con `CONFLICT` |

Probar especialmente: correo duplicado, título duplicado, visibilidad privada/restringida, solicitud duplicada, aceptación sin cupo, eliminación del propietario, conversión sin equipo y segunda conversión.

## 12. Invariantes de implementación y congelamiento

1. React, Express y la futura API .NET deben respetar exactamente rutas, métodos, nombres de propiedades, estados, formatos JSON, códigos de respuesta y reglas de visibilidad de este contrato.

2. El almacenamiento interno puede cambiar de MongoDB a tablas relacionales; los IDs públicos se tratan como cadenas opacas.

3. Los secretos y conexiones se configuran con variables de entorno y nunca se publican.

4. El servidor es la autoridad para sesión, propiedad, capacidad, visibilidad y transiciones de estado.
