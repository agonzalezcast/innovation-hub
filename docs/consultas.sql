-- Consultas para SQL Server - Innovation Hub
-- Los resultados esperados corresponden a los datos de ejemplo del paso 5 de
-- plan-migracion.md. Crear las tablas no inserta esos datos automáticamente.


-- 1. ¿Quién es el propietario de cada iniciativa?
-- Cada iniciativa tiene un propietario; un usuario puede tener varias iniciativas.
-- Resultado esperado:
-- Aula abierta          | Ana Mora
-- Huerta comunitaria    | Luis Solís
-- Diseño inclusivo      | Eva Rojas
SELECT
    initiative.Title AS Initiative,
    CONCAT(userOwner.FirstName, N' ', userOwner.LastName) AS Owner
FROM dbo.Initiatives AS initiative
JOIN dbo.Users AS userOwner ON userOwner.Id = initiative.OwnerId
ORDER BY initiative.Id;

-- 2. ¿Qué competencias requiere cada iniciativa?
-- InitiativeSkills conecta las iniciativas con sus competencias.
-- Resultado esperado:
-- Aula abierta       | Programación
-- Aula abierta       | Educación
-- Huerta comunitaria | Gestión
-- Diseño inclusivo   | Diseño
-- Diseño inclusivo   | Investigación
SELECT
    initiative.Title AS Initiative,
    skill.Name AS Skill
FROM dbo.Initiatives AS initiative
JOIN dbo.InitiativeSkills AS requiredSkill
    ON requiredSkill.InitiativeId = initiative.Id
JOIN dbo.Skills AS skill ON skill.Id = requiredSkill.SkillId
ORDER BY initiative.Id, skill.Id;

-- 3. ¿Cuántas solicitudes ha recibido cada iniciativa?
-- LEFT JOIN incluye iniciativas que todavía no tienen solicitudes.
-- Resultado esperado: Aula abierta = 1; Huerta comunitaria = 1;
-- Diseño inclusivo = 0.
SELECT
    initiative.Title AS Initiative,
    COUNT(request.Id) AS RequestCount
FROM dbo.Initiatives AS initiative
LEFT JOIN dbo.Requests AS request ON request.InitiativeId = initiative.Id
GROUP BY initiative.Id, initiative.Title
ORDER BY initiative.Id;

-- 4. Actualizar la disponibilidad de Eva.
-- Resultado esperado durante la transacción: una fila afectada;
-- Availability cambia de cadena vacía a 'Tardes'. ROLLBACK restaura el dato.
BEGIN TRANSACTION;
UPDATE dbo.Users
SET Availability = N'Tardes'
WHERE Id = 3;
SELECT Id, FirstName, Availability FROM dbo.Users WHERE Id = 3;
ROLLBACK TRANSACTION;


-- 5. Quitar el interés 'Accesibilidad' de Eva.
-- Resultado esperado durante la transacción: una fila afectada;
-- el usuario sigue existiendo. ROLLBACK restaura el interés.
BEGIN TRANSACTION;
DELETE FROM dbo.UserInterests
WHERE UserId = 3 AND Position = 0 AND [Value] = N'Accesibilidad';
SELECT UserId, Position, [Value] FROM dbo.UserInterests WHERE UserId = 3;
ROLLBACK TRANSACTION;


-- 6. ¿Se puede asignar la misma competencia dos veces a una iniciativa?
-- No. La relación (1, 1) ya existe en los datos de prueba. SQL Server debe
-- rechazar el INSERT por la llave primaria compuesta; no se agrega ninguna fila.
-- Ejecutar este ejemplo por separado: el error es intencional.
INSERT INTO dbo.InitiativeSkills (InitiativeId, SkillId)
VALUES (1, 1);
