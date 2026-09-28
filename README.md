# Innovation Hub
 
Proyecto del curso SOFT-12 — Programación web avanzada.
 
**Estudiantes:** 
 - Alexander González Castillo
 - Carlos Morales

**Sección:** SCV2    

**Periodo:** III cuatrimestre 2026

**Docente:** Álvaro Cordero Peña
 
## Descripción
 
Aplicación web que permite publicar ideas, necesidades y retos,
declarar las competencias que cada iniciativa requiere y conformar
equipos interdisciplinarios dentro de la comunidad universitaria.

Pantallas del prototipo: inicio, catálogo con búsqueda y filtros, detalle,
publicación y modificación de iniciativas, solicitud de participación y perfil de usuario.
 
## Estructura del repositorio
 
- `avance1/` — prototipo con HTML, CSS, JavaScript, Bootstrap y Sass
  - `index.html` — página de inicio
  - `paginas/` — pantallas del prototipo
  - `datos/`   — archivos JSON con datos simulados
  - `js/`      — módulos de JavaScript (`app.js` es el módulo compartido)
  - `scss/`    — variables y parciales de Sass
  - `css/`     — hoja de estilos compilada
  - `img/`     — imágenes
 
## Compilar estilos
 
```bash
npm install
npm run sass
```

 
## Cómo ejecutar
 
Los datos se cargan con `fetch`, por lo que el prototipo debe abrirse desde un servidor local

```bash
npx serve avance1
```

También sirve la extensión Live Server de VS Code sobre `avance1/index.html`.
 
## Decisiones de diseño
 
- Bootstrap 5.3.3 se compila desde Sass con variables propias; solo el JavaScript de Bootstrap se carga desde CDN.
- Los datos iniciales viven en JSON y se cargan de forma asíncrona; las iniciativas creadas, modificadas o eliminadas y las solicitudes se guardan en `localStorage`.
- La sesión se simula con `datos/sesion.json` (usuario con id 1).
- Las opciones de categorías y competencias se generan desde los JSON.
- Visibilidad: Pública e Institucional muestran el detalle completo; Restringida muestra solo un resumen a quien no es del equipo; Privada solo la ve el equipo.
- Solo el propietario modifica, elimina o archiva su iniciativa; una iniciativa archivada no se modifica ni recibe solicitudes.
- No se puede solicitar participación en una iniciativa propia ni tener más de una solicitud pendiente en la misma.
- Validaciones propias en JavaScript con mensajes por campo:
  - Iniciativa: título 5–80 caracteres y sin repetir, resumen 20–200, descripción 30–1000, problema 10–500 y beneficiarios 10–150 (opcionales), participantes entero entre 1 y 20, al menos una competencia sin repetir, etiquetas de 2–20 caracteres sin repetir.
  - Solicitud: mensaje 30–500 caracteres, competencia entre las requeridas, rol y disponibilidad 3–60.
 
## Resumen de commits

| Número | Fecha | Identificador | Mensaje | Sección del sistema | Cambio principal |
|---|------------|---------|-------------------------------------------------------|--------|---------------|
| 1 | 2026-09-08 | 8ea66b8 | Crear estructura del avance 1 y documentacion inicial | Global | Carpetas |
| 2 | 2026-09-08 | 444c056 | Agregar tabla del resumen de commits al README.md | README.md | Resumen de Commits |
| 3 | 2026-09-08 | f07c442 | Maquetar el encabezado y la navegación del catálogo | Catálogo | Encabezado y Navegación |
| 4 | 2026-09-08 | 2bc51db | Maquetar el titulo y los filtros del catalogo | Catálogo | Título y Filtros |
| 5 | 2026-09-08 | 975d8ed | Agregar resultados y tarjetas de la busqueda | Catálogo | Busqueda y Tarjetas |
| 6 | 2026-09-08 | 7269e42 | Completar la estructura semántica del catálogo | Catálogo | Resultados, tarjetas y Footer |
| 7 | 2026-09-23 | 5c1c3a1 | Creacion de archivos HTML para las paginas de detalle, perfil de usuario, registro y solicitud | Paginas | Creacion archivos HTML |
| 8 | 2026-09-24 | 63b0176 | Actualizacion del README (integrantes) | README | Actualización de integrantes |
| 9 | 2026-09-25 | de9df65 | Crear datos iniciales del proyecto (JSON) | Datos | Creacion de datos JSON de categorias, competencias e iniciativas |
| 10 | 2026-09-26 | 6da24ff | Implementar carga asincronica de iniciativas | Catalogo | Implementar carga asincronica de iniciativas |
| 11 | 2026-09-26 | 4d7ebe6 | Implementar catalogo dinamico con busqueda y filtros | Catalogo | Catalogo dinamico con busqueda/filtros y estructura con bootstrap |
| 12 | 2026-09-27 | e7e8366 | Implementar detalle y visibilidad de iniciativas | Detalle | Estructura HTML y logica del detalle de una iniciativa |
| 13 | 2026-09-27 | 5b47e57 | Implementar publicacion de iniciativas con almacenamiento local | Publicar iniciativa | Formulario de publicación guardado en localStorage |
| 14 | 2026-09-27 | 539426b | Configurar Sass y personalizar variables de Bootstrap | Estilos | Compilación de Bootstrap con variables propias |
| 15 | 2026-09-27 | 1f46ae2 | Crear parciales de estilos para layout y componentes | Estilos | Parciales de layout, componentes y mixins |
| 16 | 2026-09-27 | 96c4086 | Reemplazar Bootstrap del CDN por la hoja compilada con Sass | Catálogo | Uso de la hoja compilada |
| 17 | 2026-09-27 | d53d6f2 | Reemplazar Bootstrap del CDN por la hoja compilada con Sass en las demas paginas... | Páginas | Uso de la hoja compilada en detalle y publicación |
| 18 | 2026-09-27 | 9a95613 | Implementar encabezado y pie de pagina con componentes de Bootstrap y marquita en el nav | Páginas | Encabezado y pie de página |
| 19 | 2026-09-27 | 6877c05 | Ajustar datos iniciales a los valores controlados del proyecto y enriqueserlos un poco | Datos | Estados, visibilidad, usuarios y sesión |
| 20 | 2026-09-27 | 8863650 | Separar la carga de datos en un modulo compartido | JavaScript | Módulo compartido `app.js` |
| 21 | 2026-09-27 | cee82e5 | Merge pull request #1 from agonzalezcast/avance1-datos | Estilos / Datos | Integración de la rama avance1-datos |
| 22 | 2026-09-27 | 76ecb90 | Agregar index y la imagen de portada. | Inicio | Página de inicio y portada |
| 23 | 2026-09-27 | 478446a | Crear pantalla de perfil de usuario | Perfil | Pantalla de perfil de usuario |
| 24 | 2026-09-27 | bc2c434 | Crear formulario de solicitud de participacion y el js | Solicitud | Formulario de solicitud de participación |
| 25 | 2026-09-27 | 017d184 | Merge pull request #2 from agonzalezcast/avance1-pantallas | Páginas | Integración de la rama avance1-pantallas |
| 26 | 2026-09-27 | 5a92f69 | Implementar modificacion, eliminacion y archivado de iniciativas | Publicar iniciativa / Detalle | Modificar, eliminar y archivar iniciativas |
| 27 | 2026-09-27 | 0ac5649 | Merge pull request #3 from agonzalezcast/avance1-iniciativas | Publicar iniciativa / Detalle | Integración de la rama avance1-iniciativas |
| 28 | 2026-09-27 | db3f92a | Mostrar integrantes del equipo y aplicar los niveles de visibilidad | Detalle / Catálogo | Integrantes del equipo y niveles de visibilidad |
| 29 | 2026-09-27 | c6c2fd9 | Generar opciones desde los archivos JSON y corregir contador y eventos duplicados | Catálogo / Publicar iniciativa | Opciones generadas desde JSON |
| 30 | 2026-09-27 | 9c65997 | Merge pull request #4 from agonzalezcast/avance1-iniciativas | Catálogo / Detalle | Integración de la rama avance1-iniciativas |
| 31 | 2026-09-27 | 3c16c81 | Corregir desbordamiento en movil y agregar iniciativa de ejemplo | Estilos / Datos | Corrección responsive e iniciativa de ejemplo |
| 32 | 2026-09-27 | 9d4893a | Ampliar validaciones del formularios y bauncers | Formularios | Validaciones por campo y bloqueo de solicitudes a archivadas |
