# Plan de migración de MongoDB a SQL Server


### 1. Inventario

Actualmente, el servidor de Innovation Hub guarda sus datos en MongoDB. Antes de trasladarlos a SQL Server, es necesario identificar qué contiene cada colección y cómo se relaciona con las demás. El siguiente inventario corresponde al modelo del Avance 2.

#### Colecciones de origen

##### `users`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `firstName`, `lastName` | String | Obligatorios |
| `secondLastName` | String | Opcional; puede estar vacío |
| `email` | String | Obligatorio, único (RN-01). No se modifica desde el perfil |
| `passwordHash` | String | Hash con bcrypt. Nunca se devuelve |
| `memberType` | String | Estudiante, Docente o Administrativo |
| `career` | String | |
| `description` | String | |
| `skills` | [ObjectId] | Referencias a `skills` |
| `interests` | [String] | |
| `availability` | String | |
| `portfolioUrl` | String | Opcional |
| `active` | Boolean | Solo un usuario activo puede ser propietario (RN-03) |
| `createdAt`, `updatedAt` | Date | |

`fullName` se calcula para las respuestas a partir de los nombres y apellidos; no se guarda como un campo independiente.

##### `skills`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `name` | String | Único |

##### `initiatives`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `title`, `summary`, `description`, `problem`, `beneficiaries` | String | `problem` y `beneficiaries` pueden ser `null` |
| `titleKey` | String | Título normalizado en minúsculas para comprobar unicidad |
| `type` | String | Idea, Necesidad o Reto (RN-04) |
| `category` | String | Value controlado |
| `skills` | [ObjectId] | Skills requeridas, referencias a `skills` |
| `capacity` | Number | Capacidad total, incluido el propietario |
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

##### `requests`

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

##### `projects`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `initiativeId` | ObjectId | Referencia a la iniciativa de origen, única (RN-18) |
| `name`, `description`, `objective` | String | |
| `technologies` | [String] | Tecnologías del proyecto |
| `startDate` | String | Fecha de inicio en formato `YYYY-MM-DD` |
| `estimatedEndDate` | String | Fecha estimada en formato `YYYY-MM-DD` o `null` |
| `status` | String | |
| `repositoryUrl` | String | Opcional, `https://github.com/{owner}/{repo}` |
| `createdAt`, `updatedAt` | Date | |

##### `sessions`

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | ObjectId | |
| `tokenHash` | String | Hash SHA-256 único del token; no se guarda el token original |
| `userId` | ObjectId | Referencia a `users` |
| `expiresAt` | Date | Índice TTL: Mongo borra la sesión al vencer |


#### Índices del servidor MongoDB

El servidor prepara estos índices al conectarse:

- `users.email` único.
- `initiatives.titleKey` único para títulos normalizados. El índice creado por el servidor es parcial para documentos que contienen el campo; también se acepta un índice único completo compatible que ya exista.
- `requests`: índice único parcial sobre `{ initiativeId, requesterId, status }` para solicitudes en estado `Pendiente`.
- `projects.initiativeId` único.
- `sessions.tokenHash` único y TTL sobre `expiresAt`.

Los filtros de las rutas se ejecutan en el servidor. Los demás índices de búsqueda pueden evaluarse según el volumen de datos y no se crean automáticamente en la implementación actual.


Revisar documentos reales, ausencias, tipos, duplicados, referencias huérfanas y datos fuera de los tamaños propuestos antes de cargar. En particular, `titleKey` es opcional en el índice parcial de MongoDB pero obligatorio en este diseño: calcularlo desde `title` y resolver colisiones antes de cargar. `fullName` se calcula, no se migra. El hash bcrypt actual ya incorpora el salt y se conserva sin añadir una columna separada.

### 2. Correspondencia

Usar la tabla [«Del documento a la tabla» del modelo](modelo-datos.md#del-documento-a-la-tabla): incluye cada colección, arreglo y referencia. Preservar orden y duplicados en los arreglos que los admiten. El servidor guarda fechas de proyecto como texto y el diseño usa `DATE`: validar su formato y convertirlas; exportarlas de nuevo a `YYYY-MM-DD` en la API.

### 3. Orden de creación y carga

1. `Users`, `Skills`.
2. `UserSkills`, `UserInterests`, `Initiatives`, `Sessions`.
3. `InitiativeSkills`, `InitiativeMembers`, `InitiativeTags`, `Requests`, `Projects`.
4. `ProjectTechnologies`.

Cada FK apunta a una tabla ya creada. Crear índices únicos después de comprobar la limpieza de los datos; en producción planificar copia de seguridad y una ventana de escritura controlada.

### 4. Identificadores

En cada colección principal mantener durante la migración un mapa separado `(colección, ObjectId original, Id SQL)`, con unicidad en ambos identificadores dentro de la colección. Insertar padres, capturar los `Id` generados y consultar el mapa al insertar cada FK y cada elemento de arreglo. No interpretar el ObjectId como número ni reutilizar mapas entre colecciones. Registrar y corregir referencias sin correspondencia; nunca sustituirlas silenciosamente. Conservar el mapa para auditoría y decidir una estrategia de compatibilidad antes de cambiar rutas: el Express actual valida ObjectId de 24 caracteres, mientras que el diseño expone Id numéricos como texto; enlaces y clientes existentes requieren traducción temporal o adaptación explícita.

### 5. Carga: datos de prueba

Los siguientes son valores literales de ejemplo, no instrucciones ejecutadas. En todas las tablas el Id indicado representa el valor generado; en una carga real se usan los mapas, sin asumir que `IDENTITY` produce estos números. Convención para abreviar sin omitir datos: `T` = `2026-11-01T10:00:00.000Z`; `T2` = `2026-11-02T10:00:00.000Z`; `H` = un hash bcrypt ficticio de prueba (no una contraseña). Las cadenas vacías se indican `''`; `NULL` es ausencia. Las fechas de hora están en UTC.

**Users** (CreatedAt = UpdatedAt = T, Active = 1, SecondLastName = '', Description = '', Availability = '', PortfolioUrl = NULL, PasswordHash = H):

| Id | FirstName | LastName | Email | MemberType | Career |
|---|---|---|---|---|---|
| 1 | Ana | Mora | ana@example.test | Estudiante | Ingeniería |
| 2 | Luis | Solís | luis@example.test | Docente | Educación |
| 3 | Eva | Rojas | eva@example.test | Estudiante | Diseño |

**Skills:**

| Id | Name |
|---|---|
| 1 | Programación |
| 2 | Diseño |
| 3 | Investigación |
| 4 | Educación |
| 5 | Gestión |

**UserSkills** `(UserId, SkillId)`: (1,1), (1,3), (2,4), (2,5), (3,2).

**UserInterests** `(UserId, Position, Value)`: (1,0,'Aprendizaje'), (3,0,'Accesibilidad').

**Sessions**: ninguna; no se necesitan sesiones activas para los ejemplos públicos.

**Initiatives** (Problem = Beneficiaries = NULL; PublishedAt = CreatedAt = T; UpdatedAt = T2):

| Id | Title / TitleKey | Type | Summary | Description | Category | Capacity | Visibility | Status | OwnerId |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Aula abierta / aula abierta | Idea | Plataforma para compartir recursos educativos | Crear una plataforma para compartir materiales y apoyar el aprendizaje. | Educación | 4 | Pública | Convertida en proyecto | 1 |
| 2 | Huerta comunitaria / huerta comunitaria | Necesidad | Espacio para cultivar alimentos en comunidad | Organizar una huerta para aprender y compartir alimentos de forma sostenible. | Sostenibilidad | 5 | Institucional | Publicada | 2 |
| 3 | Diseño inclusivo / diseño inclusivo | Reto | Mejorar la accesibilidad de herramientas | Investigar y diseñar herramientas digitales accesibles para la comunidad. | Tecnología | 3 | Privada | Publicada | 3 |

**InitiativeSkills** `(InitiativeId, SkillId)`: (1,1), (1,4), (2,5), (3,2), (3,3).

**InitiativeMembers** `(InitiativeId, UserId, Role, JoinedAt, Position)`: (1,1,'Propietario',T,0), (1,2,'Docente',T2,1), (2,2,'Propietario',T,0), (3,3,'Propietario',T,0).

**InitiativeTags** `(InitiativeId, Position, Value)`: (1,0,'educación'), (1,1,'recursos'), (2,0,'huerta'), (3,0,'accesibilidad').

**Requests** (CreatedAt = T; UpdatedAt = T2):

| Id | InitiativeId | RequesterId | MainSkillId | Message | Role | Availability | Status | ResolvedAt |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 2 | 4 | Me interesa contribuir con materiales educativos. | Docente | Tardes | Aceptada | T2 |
| 2 | 2 | 3 | 5 | Me interesa apoyar el diseño de la huerta comunitaria. | Diseñadora | Fines de semana | Pendiente | NULL |

**Projects** (CreatedAt = UpdatedAt = T2):

| Id | InitiativeId | Name | Description | Objective | StartDate | EstimatedEndDate | Status | RepositoryUrl |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | Aula abierta | Plataforma de recursos educativos | Compartir materiales educativos | 2026-11-02 | NULL | Planificación | NULL |

**ProjectTechnologies** `(ProjectId, Position, Value)`: (1,0,'React'), (1,1,'SQL Server').

### 6. Verificación

Comparar conteos por colección con las tablas principales y contar cada elemento de arreglo frente a su tabla hija. Para este conjunto: Users 3, Skills 5, UserSkills 5, UserInterests 2, Initiatives 3, InitiativeSkills 5, InitiativeMembers 4, InitiativeTags 4, Requests 2, Projects 1, ProjectTechnologies 2, Sessions 0. Verificar integridad de FK, unicidad, referencias mediante los mapas, campos nulos, orden de arreglos, fechas y valores controlados; comparar muestras completas y JSON con el origen. Registrar errores y reconciliar diferencias antes de habilitar escrituras sobre el nuevo sistema.

