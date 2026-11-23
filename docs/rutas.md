# Diseño de rutas de lectura

Este documento presenta dos rutas públicas del Innovation Hub y cómo podrían consultar el modelo de SQL Server. Los ejemplos utilizan los [datos de prueba del plan de migración](plan-migracion.md#5-carga-datos-de-prueba) y muestran las respuestas que recibiría una persona sin iniciar sesión.

El servidor actual usa MongoDB y valida identificadores ObjectId de 24 caracteres. En el diseño SQL, los identificadores son números que se convertirían a texto en el JSON. Por ejemplo, `"1"` conserva el tipo de dato y los nombres de campo del contrato, pero no es un identificador que acepte hoy Express. La transición requiere adaptar la validación y resolver los enlaces existentes mediante el mapa descrito en el plan de migración.

Las consultas son propuestas de diseño; las respuestas se arman en la aplicación a partir de las filas devueltas. Las fechas `DATETIME2` se interpretan en UTC y se serializan en ISO 8601.

## 1. Consultar las competencias

**Ruta:** `GET /api/skills`  
**Acceso:** público; no requiere sesión.  
**Tabla:** `Skills`.

Esta ruta devuelve el catálogo de competencias. También acepta el parámetro opcional `q` para buscar por nombre. Si no hay coincidencias, responde con `items` vacío.

### Recorrido de la petición

1. El cliente solicita `/api/skills`, con o sin el parámetro `q`.
2. El servidor consulta `Skills` y ordena los resultados por nombre.
3. Por cada fila construye un objeto con `id` como texto y `name`.
4. Devuelve los objetos dentro de `items` con estado HTTP `200`.

### Consulta sin filtro

```sql
SELECT Id, Name
FROM dbo.Skills
ORDER BY Name;
```

Con los datos de prueba, las filas obtenidas son:

| Id | Name |
|---:|---|
| 2 | Diseño |
| 4 | Educación |
| 5 | Gestión |
| 3 | Investigación |
| 1 | Programación |

La aplicación transforma esas filas en la respuesta:

```json
{
  "items": [
    { "id": "2", "name": "Diseño" },
    { "id": "4", "name": "Educación" },
    { "id": "5", "name": "Gestión" },
    { "id": "3", "name": "Investigación" },
    { "id": "1", "name": "Programación" }
  ]
}
```

### Ejemplo de búsqueda: `GET /api/skills?q=program`

Para buscar texto sin interpretar `%`, `_` o `[` como comodines, la aplicación debe recibir `q` como parámetro y escapar también el carácter de escape. Este ejemplo usa `~`:

```sql
DECLARE @q NVARCHAR(120) = N'program';
DECLARE @literal NVARCHAR(240) = REPLACE(REPLACE(REPLACE(REPLACE(
    LTRIM(RTRIM(@q)), N'~', N'~~'), N'%', N'~%'), N'_', N'~_'), N'[', N'~[');

SELECT Id, Name
FROM dbo.Skills
WHERE Name LIKE N'%' + @literal + N'%' ESCAPE N'~'
ORDER BY Name;
```

La fila esperada es `1 | Programación` y la respuesta sería:

```json
{
  "items": [{ "id": "1", "name": "Programación" }]
}
```

El servidor Express actual ignora mayúsculas al buscar. La consulta debe usar una colación de SQL Server que permita ese comportamiento; también debe comprobarse cómo trata los acentos y el orden, porque MongoDB y SQL Server pueden diferir. La longitud de `@q` del ejemplo es una decisión para el diseño SQL, no un límite que Express imponga actualmente a esta ruta.

## 2. Consultar el detalle de una iniciativa

**Ruta:** `GET /api/initiatives/{id}`  
**Ejemplo:** `GET /api/initiatives/1`  
**Acceso:** público para iniciativas con visibilidad `Pública`.  
**Tablas:** `Initiatives`, `Users`, `InitiativeSkills`, `Skills`, `InitiativeMembers` e `InitiativeTags`.

La respuesta reúne los datos de la iniciativa con su propietario, competencias, miembros y etiquetas. Las competencias se obtienen mediante `InitiativeSkills`, que resuelve la relación muchos a muchos entre iniciativas y competencias.

### Recorrido de la petición

1. El cliente solicita el detalle de una iniciativa por su identificador.
2. El servidor valida el identificador y consulta si la iniciativa existe y cuál es su visibilidad.
3. Para una petición sin sesión, devuelve `404` si no existe o es privada; devuelve `401` si es institucional o restringida. Solo continúa con los datos de una iniciativa pública.
4. Lee los datos de la iniciativa y su propietario, sus competencias, sus miembros y sus etiquetas.
5. Construye `owner`, `skills`, `members` y `tags` con esas filas y devuelve el detalle con estado `200`.

El servidor Express también admite solicitudes autenticadas y aplica reglas adicionales según el usuario. Aquí se desarrolla el caso público, que es el que exige este ejercicio. Un identificador con formato inválido produce `400` según la validación de la implementación que corresponda.

### Paso 1: comprobar la visibilidad

Para el ejemplo, `@id` representa el identificador numérico `1` en la futura implementación SQL:

```sql
DECLARE @id INT = 1;

SELECT Id, Visibility
FROM dbo.Initiatives
WHERE Id = @id;
```

| Id | Visibility |
|---:|---|
| 1 | Pública |

**La aplicación debe evaluar este resultado antes de continuar.** Si no hay fila responde `404`; si la visibilidad es `Privada`, responde `404`; si es `Institucional` o `Restringida`, responde `401` al visitante. Las consultas siguientes se ejecutan únicamente después de autorizar la lectura. Para evitar una exposición accidental si la visibilidad cambia entre consultas, cada una también comprueba que la iniciativa siga siendo pública; en una implementación real, conviene leer todo con una transacción de aislamiento adecuado.

### Paso 2: obtener la iniciativa y su propietario

```sql
SELECT i.Id, i.Title, i.Type, i.Summary, i.Category, i.Description,
       i.Problem, i.Beneficiaries, i.Capacity, i.Visibility, i.Status,
       i.OwnerId, u.FirstName, u.LastName, u.SecondLastName,
       i.PublishedAt, i.CreatedAt, i.UpdatedAt
FROM dbo.Initiatives AS i
JOIN dbo.Users AS u ON u.Id = i.OwnerId
WHERE i.Id = @id AND i.Visibility = N'Pública';
```

La consulta devuelve una fila para **Aula abierta**, con `OwnerId = 1`, `FirstName = Ana` y `LastName = Mora`. La aplicación usa los nombres no vacíos para construir `owner.fullName`: `Ana Mora`.

### Paso 3: obtener las competencias

```sql
SELECT skill.Id, skill.Name
FROM dbo.InitiativeSkills AS link
JOIN dbo.Skills AS skill ON skill.Id = link.SkillId
JOIN dbo.Initiatives AS initiative ON initiative.Id = link.InitiativeId
WHERE link.InitiativeId = @id AND initiative.Visibility = N'Pública'
ORDER BY skill.Id;
```

| Id | Name |
|---:|---|
| 1 | Programación |
| 4 | Educación |

Cada fila se convierte en un objeto del arreglo `skills`. Se ordena por Id para hacer reproducible el ejemplo; Express actualmente no garantiza un orden explícito para esas competencias.

### Paso 4: obtener los miembros

```sql
SELECT userMember.Id, userMember.FirstName, userMember.LastName,
       userMember.SecondLastName, member.Role, member.JoinedAt
FROM dbo.InitiativeMembers AS member
JOIN dbo.Users AS userMember ON userMember.Id = member.UserId
JOIN dbo.Initiatives AS initiative ON initiative.Id = member.InitiativeId
WHERE member.InitiativeId = @id AND initiative.Visibility = N'Pública'
ORDER BY member.Position;
```

| Id | Nombre completo | Role | JoinedAt (UTC) |
|---:|---|---|---|
| 1 | Ana Mora | Propietario | 2026-11-01T10:00:00.000Z |
| 2 | Luis Solís | Docente | 2026-11-02T10:00:00.000Z |

La aplicación forma cada nombre completo con los componentes no vacíos y crea los objetos del arreglo `members`, respetando el orden de `Position`.

### Paso 5: obtener las etiquetas

```sql
SELECT tag.[Value]
FROM dbo.InitiativeTags AS tag
JOIN dbo.Initiatives AS initiative ON initiative.Id = tag.InitiativeId
WHERE tag.InitiativeId = @id AND initiative.Visibility = N'Pública'
ORDER BY tag.Position;
```

Las filas esperadas son `educación` y `recursos`, en ese orden. La aplicación las coloca en el arreglo `tags`. Las consultas de competencias, miembros y etiquetas se mantienen separadas para no multiplicar filas al combinar varias relaciones de uno a muchos.

En los fragmentos de los pasos 2 a 5, `@id` representa el mismo parámetro; para ejecutarlos juntos en DBeaver debe declararse una vez al inicio y ejecutarse como un mismo lote.

### Respuesta completa

Con las filas anteriores, la aplicación construiría este JSON:

```json
{
  "id": "1",
  "title": "Aula abierta",
  "type": "Idea",
  "summary": "Plataforma para compartir recursos educativos",
  "category": "Educación",
  "skills": [
    { "id": "1", "name": "Programación" },
    { "id": "4", "name": "Educación" }
  ],
  "description": "Crear una plataforma para compartir materiales y apoyar el aprendizaje.",
  "problem": null,
  "beneficiaries": null,
  "capacity": 4,
  "visibility": "Pública",
  "status": "Convertida en proyecto",
  "owner": { "id": "1", "fullName": "Ana Mora" },
  "members": [
    { "user": { "id": "1", "fullName": "Ana Mora" }, "role": "Propietario", "joinedAt": "2026-11-01T10:00:00.000Z" },
    { "user": { "id": "2", "fullName": "Luis Solís" }, "role": "Docente", "joinedAt": "2026-11-02T10:00:00.000Z" }
  ],
  "tags": ["educación", "recursos"],
  "publishedAt": "2026-11-01T10:00:00.000Z",
  "createdAt": "2026-11-01T10:00:00.000Z",
  "updatedAt": "2026-11-02T10:00:00.000Z"
}
```

