-- Consultas de Innovation Hub para pegar directamente en sqlcmd.
-- Conéctate primero a la base innovation_hub y limpia el bloque pendiente
-- con :RESET. Copia TODO este archivo; cada GO ejecuta el bloque anterior.
-- Las tablas se crean vacías. Los resultados del plan de migración aparecen
-- solo si los datos de ejemplo ya fueron cargados con esos identificadores.

-- 1. Iniciativas y propietarios.
SELECT i.Title AS Initiative,
       CONCAT(u.FirstName, N' ', u.LastName) AS Owner
FROM innovation_hub.dbo.Initiatives AS i
JOIN innovation_hub.dbo.Users AS u ON u.Id = i.OwnerId
ORDER BY i.Id;
GO

-- 2. Competencias de cada iniciativa.
SELECT i.Title AS Initiative, s.Name AS Skill
FROM innovation_hub.dbo.Initiatives AS i
JOIN innovation_hub.dbo.InitiativeSkills AS ins ON ins.InitiativeId = i.Id
JOIN innovation_hub.dbo.Skills AS s ON s.Id = ins.SkillId
ORDER BY i.Id, s.Id;
GO

-- 3. Solicitudes por iniciativa, incluidas las que no tienen ninguna.
SELECT i.Title AS Initiative, COUNT(r.Id) AS RequestCount
FROM innovation_hub.dbo.Initiatives AS i
LEFT JOIN innovation_hub.dbo.Requests AS r ON r.InitiativeId = i.Id
GROUP BY i.Id, i.Title
ORDER BY i.Id;
GO

-- 4. Prueba de actualización de Eva. La transacción se revierte siempre.
BEGIN TRY
    BEGIN TRANSACTION;
    UPDATE innovation_hub.dbo.Users
    SET Availability = N'Tardes'
    WHERE Id = 3 AND FirstName = N'Eva' AND LastName = N'Rojas';
    SELECT Id, FirstName, Availability
    FROM innovation_hub.dbo.Users
    WHERE Id = 3 AND FirstName = N'Eva' AND LastName = N'Rojas';
    ROLLBACK TRANSACTION;
    PRINT N'Prueba de actualización revertida. Si no hubo filas, faltan los datos de ejemplo.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    PRINT N'Error en la actualización; se revirtió la transacción.';
    THROW;
END CATCH;
GO

-- 5. Prueba de eliminación del interés de Eva. La transacción se revierte.
BEGIN TRY
    BEGIN TRANSACTION;
    DELETE interest
    FROM innovation_hub.dbo.UserInterests AS interest
    JOIN innovation_hub.dbo.Users AS u ON u.Id = interest.UserId
    WHERE u.Id = 3 AND u.FirstName = N'Eva' AND u.LastName = N'Rojas'
      AND interest.Position = 0 AND interest.[Value] = N'Accesibilidad';
    SELECT interest.UserId, interest.Position, interest.[Value]
    FROM innovation_hub.dbo.UserInterests AS interest
    JOIN innovation_hub.dbo.Users AS u ON u.Id = interest.UserId
    WHERE u.Id = 3 AND u.FirstName = N'Eva' AND u.LastName = N'Rojas';
    ROLLBACK TRANSACTION;
    PRINT N'Prueba de eliminación revertida. Si no hubo filas, revisa los datos de ejemplo.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    PRINT N'Error en la eliminación; se revirtió la transacción.';
    THROW;
END CATCH;
GO

-- 6. Prueba de llave duplicada. Se omite si la relación (1, 1) no existe.
-- Incluso si la llave no estuviera configurada, el ROLLBACK deshace el INSERT.
IF EXISTS (SELECT 1 FROM innovation_hub.dbo.InitiativeSkills
           WHERE InitiativeId = 1 AND SkillId = 1)
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        INSERT INTO innovation_hub.dbo.InitiativeSkills (InitiativeId, SkillId)
        VALUES (1, 1);
        ROLLBACK TRANSACTION;
        PRINT N'La base aceptó el duplicado: revisa la llave primaria.';
    END TRY
    BEGIN CATCH
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        IF @ErrorNumber IN (2601, 2627)
            PRINT N'Correcto: SQL Server rechazó la relación duplicada.';
        ELSE
            THROW;
    END CATCH;
END
ELSE
    PRINT N'Prueba omitida: no existe la relación de ejemplo (1, 1).';
GO
