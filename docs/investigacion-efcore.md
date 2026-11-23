# Investigación breve sobre Entity Framework Core

## 1. Datos relacionados: Select, Include y AsNoTracking

Entity Framework Core (EF Core) permite consultar información relacionada entre distintas tablas mediante LINQ. Dos formas de hacerlo son la proyección con `Select` y la carga de relaciones con `Include`.

**`Select`** permite seleccionar únicamente los campos necesarios y construir un objeto con la estructura requerida. Es especialmente útil para rutas GET que devuelven respuestas JSON, porque evita recuperar columnas que no se necesitan.

**`Include`** permite cargar entidades relacionadas mediante sus propiedades de navegación. Conviene cuando la aplicación necesita trabajar con entidades completas y sus relaciones, aunque puede aumentar la cantidad de información recuperada.

**`AsNoTracking`** desactiva el seguimiento de cambios de las entidades consultadas. En operaciones de solo lectura suele reducir el trabajo de EF Core. Una proyección que devuelve únicamente valores escalares, sin entidades, no requiere seguimiento.

**Ejemplo aplicado a Innovation Hub:** para la ruta `GET /api/initiatives/{id}`, diseñada en `docs/rutas.md`, se necesitan datos de las tablas `Initiatives` y `Users`, relacionadas mediante `OwnerId`. Suponiendo que la entidad `Initiative` tenga una navegación `Owner`, el siguiente ejemplo muestra una proyección parcial de la respuesta mediante `Select`:

```csharp
var iniciativa = await db.Initiatives
    .AsNoTracking()
    .Where(i => i.Id == id && i.Visibility == "Pública")
    .Select(i => new
    {
        id = i.Id.ToString(),
        title = i.Title,
        owner = new
        {
            id = i.Owner.Id.ToString(),
            fullName = i.Owner.FirstName + " " + i.Owner.LastName
        }
    })
    .FirstOrDefaultAsync();
```

Para la iniciativa *Aula abierta*, los datos de prueba identifican a Ana Mora como propietaria. `Select` obtiene los campos requeridos sin cargar ambas entidades completas. Si se necesitaran las entidades relacionadas para procesarlas, podría utilizarse `Include(i => i.Owner)`. La implementación completa también debe consultar las demás relaciones y aplicar las reglas de acceso definidas para la ruta.

**Conclusión:** para rutas GET que construyen respuestas JSON, generalmente conviene utilizar `Select`. `Include` resulta útil cuando se necesitan entidades relacionadas completas y `AsNoTracking` cuando se consultan entidades que no serán modificadas.

## 2. Relaciones muchos a muchos y entidades intermedias

Una relación muchos a muchos ocurre cuando un registro puede relacionarse con varios registros de otra tabla y viceversa. En una base de datos relacional se representa mediante una tabla intermedia que contiene las claves foráneas de ambas entidades.

EF Core permite configurar estas relaciones mediante `HasMany` y `WithMany`. Cuando la tabla intermedia solo almacena las claves, EF Core puede administrarla sin necesidad de definir una clase de C# específica.

Cuando la relación almacena información propia, como una fecha o un rol, conviene definir una **entidad intermedia explícita**. Microsoft denomina *payload* a estos atributos adicionales.

**Ejemplo aplicado a Innovation Hub:** `InitiativeSkills` representa una relación muchos a muchos simple entre `Initiatives` y `Skills`, mediante las columnas `InitiativeId` y `SkillId`. Podría configurarse utilizando navegaciones muchos a muchos sin una clase intermedia propia.

En cambio, `InitiativeMembers` relaciona iniciativas y usuarios, pero también guarda `Role`, `JoinedAt` y `Position`. Por eso conviene representarla mediante una entidad explícita:

```csharp
public class InitiativeMember
{
    public int InitiativeId { get; set; }
    public int UserId { get; set; }
    public string Role { get; set; } = "";
    public DateTime JoinedAt { get; set; }
    public int Position { get; set; }
}
```

La clave primaria compuesta puede configurarse mediante:

```csharp
modelBuilder.Entity<InitiativeMember>()
    .HasKey(m => new { m.InitiativeId, m.UserId });
```

También deben configurarse sus relaciones con `Initiative` y `User`. Esta representación permite conservar y consultar el rol, la fecha de incorporación y el orden de cada integrante.

**Conclusión:** una relación muchos a muchos simple puede administrarse sin una clase intermedia explícita. Cuando contiene atributos propios o requiere operaciones específicas, conviene definir esa entidad.

## 3. Paginación en la base de datos: Skip y Take

La paginación permite dividir los resultados de una consulta en grupos pequeños para evitar devolver todos los registros simultáneamente.

En EF Core, **`Skip(n)`** indica cuántos registros se omiten y **`Take(n)`** establece cuántos se recuperan. El desplazamiento se calcula mediante `(numeroPagina - 1) * tamañoPagina`.

En SQL Server, EF Core puede traducir estas operaciones a las cláusulas `OFFSET` y `FETCH NEXT`.

**Ejemplo aplicado a Innovation Hub:** aunque las dos rutas GET diseñadas en `docs/rutas.md` no requieren paginación, esta técnica podría aplicarse a una ruta GET del catálogo de iniciativas con parámetros `page` y `size`:

```csharp
var iniciativas = await db.Initiatives
    .AsNoTracking()
    .OrderBy(i => i.Id)
    .Skip((page - 1) * size)
    .Take(size)
    .Select(i => new
    {
        id = i.Id.ToString(),
        title = i.Title,
        category = i.Category
    })
    .ToListAsync();
```

Con `page = 2` y `size = 12`, la consulta corresponde conceptualmente a:

```sql
SELECT Id, Title, Category
FROM Initiatives
ORDER BY Id
OFFSET 12 ROWS
FETCH NEXT 12 ROWS ONLY;
```

Es importante aplicar `Skip` y `Take` antes de materializar los resultados con `ToListAsync()`. Si primero se recuperan todos los registros y después se pagina en memoria, la aplicación transfiere y procesa información innecesaria.

También se requiere un orden determinista y único, como la clave primaria. La paginación con `OFFSET` puede perder eficiencia en páginas avanzadas porque la base de datos debe procesar los registros omitidos.

**Conclusión:** paginar directamente en SQL Server reduce la cantidad de información transferida y mejora la eficiencia de las consultas. Para ello deben aplicarse `OrderBy`, `Skip` y `Take` antes de ejecutar la consulta.

## Referencias

Microsoft. (s. f.). *Carga diligente de datos relacionados*. Microsoft Learn. https://learn.microsoft.com/es-es/ef/core/querying/related-data/eager

Microsoft. (s. f.). *Consultas de seguimiento frente a consultas sin seguimiento*. Microsoft Learn. https://learn.microsoft.com/es-es/ef/core/querying/tracking

Microsoft. (s. f.). *Relaciones muchos a muchos*. Microsoft Learn. https://learn.microsoft.com/es-es/ef/core/modeling/relationships/many-to-many

Microsoft. (s. f.). *Paginación*. Microsoft Learn. https://learn.microsoft.com/es-es/ef/core/querying/pagination