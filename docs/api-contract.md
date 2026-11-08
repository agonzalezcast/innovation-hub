
# Contrato de la API — Innovation Hub

## 1. Información general

La API permite que el cliente React consulte y gestione los recursos de Innovation Hub.

- Servidor: Node.js con Express.
- Base de datos: MongoDB.
- Formato de intercambio: JSON.
- Prefijo de rutas: `/api`.
- Los nombres de propiedades utilizan inglés y camelCase.
- Los identificadores se representan como cadenas de texto.
- Las fechas se devuelven en formato ISO 8601.
- La API no expone `_id`, `__v`, contraseñas ni hashes.

La dirección del servidor se configura en React mediante `VITE_API_URL`.

## 2. Autenticación

Las rutas protegidas reciben el token de sesión mediante:

`Authorization: Bearer <token>`

El servidor identifica al usuario mediante el token, no mediante un ID proporcionado por el cliente.

Las operaciones de consulta y modificación deben respetar los permisos del usuario autenticado.

## 3. Formato de errores

Todas las respuestas de error utilizan:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos enviados no son válidos.",
    "details": {
      "title": "El título debe tener entre 5 y 80 caracteres."
    }
  }
}
```

`details` es opcional.

Códigos HTTP:

| Código | Significado |
|---|---|
| 200 | Operación exitosa |
| 201 | Recurso creado |
| 204 | Operación exitosa sin contenido |
| 400 | Datos inválidos |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | Recurso inexistente o no visible |
| 409 | Conflicto con una regla de negocio |
| 500 | Error interno del servidor |

## 4. Iniciativas

### 4.1 Listar iniciativas

`GET /api/initiatives`

Parámetros opcionales:

| Parámetro | Descripción |
|---|---|
| `type` | Filtrar por Idea, Necesidad o Reto |
| `category` | Filtrar por categoría |
| `skill` | Filtrar por competencia |
| `q` | Buscar por título o resumen |
| `page` | Número de página, desde 1 |
| `size` | Cantidad de resultados por página |

Respuesta 200:

```json
{
  "items": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Plataforma de tutorías",
      "type": "Idea",
      "summary": "Una plataforma para conectar estudiantes y tutores.",
      "category": "Educación",
      "skills": ["Programación", "Comunicación"],
      "capacity": 5,
      "memberCount": 2,
      "visibility": "Pública",
      "status": "Publicada"
    }
  ],
  "page": 1,
  "size": 12,
  "total": 1,
  "totalPages": 1
}
```

Los filtros, la búsqueda, el ordenamiento y la paginación se ejecutan en el servidor.

Las iniciativas privadas no se muestran a usuarios sin autorización.

### 4.2 Consultar detalle

`GET /api/initiatives/{id}`

Respuesta 200 para usuarios con acceso completo:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Plataforma de tutorías",
  "type": "Idea",
  "summary": "Una plataforma para conectar estudiantes y tutores.",
  "description": "Descripción detallada de la propuesta.",
  "problem": "Dificultad para encontrar apoyo académico.",
  "beneficiaries": "Estudiantes universitarios.",
  "category": "Educación",
  "skills": ["Programación", "Comunicación"],
  "capacity": 5,
  "visibility": "Pública",
  "status": "Publicada",
  "ownerId": "507f191e810c19729de860ea",
  "members": [],
  "tags": ["educación", "tutorías"],
  "publishedAt": "2026-11-08T12:00:00.000Z",
  "createdAt": "2026-11-08T12:00:00.000Z",
  "updatedAt": "2026-11-08T12:00:00.000Z"
}
```

Reglas de visibilidad:

- Pública: detalle completo.
- Institucional: detalle completo para usuarios autenticados.
- Restringida: usuarios sin pertenencia al equipo reciben solamente título, tipo, resumen, categoría y competencias.
- Privada: solamente propietario y miembros aceptados.
- Propietarios y miembros aceptados pueden consultar el detalle completo de iniciativas restringidas.

El servidor debe omitir los campos no autorizados de la respuesta.

### 4.3 Crear iniciativa

`POST /api/initiatives`

Requiere autenticación.

Petición:

```json
{
  "title": "Plataforma de tutorías",
  "type": "Idea",
  "summary": "Una plataforma para conectar estudiantes y tutores.",
  "description": "Descripción detallada de la propuesta.",
  "problem": "Dificultad para encontrar apoyo académico.",
  "beneficiaries": "Estudiantes universitarios.",
  "category": "Educación",
  "skills": ["507f1f77bcf86cd799439012"],
  "capacity": 5,
  "visibility": "Pública",
  "tags": ["educación", "tutorías"]
}
```

El servidor determina `ownerId` a partir de la sesión autenticada.

Respuesta 201: objeto de detalle de la iniciativa creada.

Errores: 400, 401, 409, 500.

### 4.4 Modificar iniciativa

`PUT /api/initiatives/{id}`

Requiere autenticación y ser propietario de la iniciativa.

Petición: mismos campos editables que en POST.

Respuesta 200: objeto de detalle actualizado.

Errores: 400, 401, 403, 404, 409, 500.

Las iniciativas archivadas no pueden modificarse.

### 4.5 Archivar iniciativa

`DELETE /api/initiatives/{id}`

Requiere autenticación y ser propietario.

Si la iniciativa tiene información relacionada, se marca como Archivada en lugar de eliminarla físicamente.

Respuesta 204: sin contenido.

Errores: 401, 403, 404, 409, 500.
