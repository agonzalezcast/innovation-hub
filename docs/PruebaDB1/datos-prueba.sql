-- Datos de prueba para las consultas de Innovation Hub.
-- Ejecutar una sola vez, después de crear las tablas, en una base vacía. OJO!
-- Los identificadores coinciden con los ejemplos de plan-migracion.md.
-- H es un marcador ficticio, no un hash válido para iniciar sesión.
-- TRUNCAR LA DB AL TEMINAR COMPAÑERO ANTES DE LOS DATOS DE DEMO.
USE innovation_hub;
GO
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    -- Evitar mezclar los ejemplos con datos existentes.
    IF EXISTS (SELECT 1 FROM dbo.Users)
       OR EXISTS (SELECT 1 FROM dbo.Skills)
       OR EXISTS (SELECT 1 FROM dbo.UserSkills)
       OR EXISTS (SELECT 1 FROM dbo.UserInterests)
       OR EXISTS (SELECT 1 FROM dbo.Initiatives)
       OR EXISTS (SELECT 1 FROM dbo.InitiativeSkills)
       OR EXISTS (SELECT 1 FROM dbo.InitiativeMembers)
       OR EXISTS (SELECT 1 FROM dbo.InitiativeTags)
       OR EXISTS (SELECT 1 FROM dbo.Requests)
       OR EXISTS (SELECT 1 FROM dbo.Projects)
       OR EXISTS (SELECT 1 FROM dbo.ProjectTechnologies)
       OR EXISTS (SELECT 1 FROM dbo.Sessions)
        THROW 50001, 'ERRORRRR La base contiene datos; no se cargaron los ejemplos.', 1;

    -- IDENTITY_INSERT permite usar los Id que aparecen en la documentación.
    SET IDENTITY_INSERT dbo.Users ON;
    INSERT INTO dbo.Users
        (Id, FirstName, LastName, SecondLastName, Email, PasswordHash,
         MemberType, Career, Description, Availability, PortfolioUrl,
         Active, CreatedAt, UpdatedAt)
    VALUES
        (1, N'Ana', N'Mora', N'', N'ana@example.test', N'H', N'Estudiante', N'Ingeniería', N'', N'', NULL, 1, '2026-11-01T10:00:00.000', '2026-11-01T10:00:00.000'),
        (2, N'Luis', N'Solís', N'', N'luis@example.test', N'H', N'Docente', N'Educación', N'', N'', NULL, 1, '2026-11-01T10:00:00.000', '2026-11-01T10:00:00.000'),
        (3, N'Eva', N'Rojas', N'', N'eva@example.test', N'H', N'Estudiante', N'Diseño', N'', N'', NULL, 1, '2026-11-01T10:00:00.000', '2026-11-01T10:00:00.000');
    SET IDENTITY_INSERT dbo.Users OFF;

    SET IDENTITY_INSERT dbo.Skills ON;
    INSERT INTO dbo.Skills (Id, Name)
    VALUES (1, N'Programación'), (2, N'Diseño'), (3, N'Investigación'),
           (4, N'Educación'), (5, N'Gestión');
    SET IDENTITY_INSERT dbo.Skills OFF;

    INSERT INTO dbo.UserSkills (UserId, SkillId)
    VALUES (1, 1), (1, 3), (2, 4), (2, 5), (3, 2);

    INSERT INTO dbo.UserInterests (UserId, Position, [Value])
    VALUES (1, 0, N'Aprendizaje'), (3, 0, N'Accesibilidad');

    SET IDENTITY_INSERT dbo.Initiatives ON;
    INSERT INTO dbo.Initiatives
        (Id, Title, TitleKey, [Type], Summary, Description, Problem, Beneficiaries,
         Category, Capacity, Visibility, Status, OwnerId, PublishedAt, CreatedAt, UpdatedAt)
    VALUES
        (1, N'Aula abierta', N'aula abierta', N'Idea', N'Plataforma para compartir recursos educativos',
         N'Crear una plataforma para compartir materiales y apoyar el aprendizaje.', NULL, NULL,
         N'Educación', 4, N'Pública', N'Convertida en proyecto', 1,
         '2026-11-01T10:00:00.000', '2026-11-01T10:00:00.000', '2026-11-02T10:00:00.000'),
        (2, N'Huerta comunitaria', N'huerta comunitaria', N'Necesidad', N'Espacio para cultivar alimentos en comunidad',
         N'Organizar una huerta para aprender y compartir alimentos de forma sostenible.', NULL, NULL,
         N'Sostenibilidad', 5, N'Institucional', N'Publicada', 2,
         '2026-11-01T10:00:00.000', '2026-11-01T10:00:00.000', '2026-11-02T10:00:00.000'),
        (3, N'Diseño inclusivo', N'diseño inclusivo', N'Reto', N'Mejorar la accesibilidad de herramientas',
         N'Investigar y diseñar herramientas digitales accesibles para la comunidad.', NULL, NULL,
         N'Tecnología', 3, N'Privada', N'Publicada', 3,
         '2026-11-01T10:00:00.000', '2026-11-01T10:00:00.000', '2026-11-02T10:00:00.000');
    SET IDENTITY_INSERT dbo.Initiatives OFF;

    INSERT INTO dbo.InitiativeSkills (InitiativeId, SkillId)
    VALUES (1, 1), (1, 4), (2, 5), (3, 2), (3, 3);

    INSERT INTO dbo.InitiativeMembers (InitiativeId, UserId, [Role], JoinedAt, Position)
    VALUES (1, 1, N'Propietario', '2026-11-01T10:00:00.000', 0),
           (1, 2, N'Docente', '2026-11-02T10:00:00.000', 1),
           (2, 2, N'Propietario', '2026-11-01T10:00:00.000', 0),
           (3, 3, N'Propietario', '2026-11-01T10:00:00.000', 0);

    INSERT INTO dbo.InitiativeTags (InitiativeId, Position, [Value])
    VALUES (1, 0, N'educación'), (1, 1, N'recursos'),
           (2, 0, N'huerta'), (3, 0, N'accesibilidad');

    SET IDENTITY_INSERT dbo.Requests ON;
    INSERT INTO dbo.Requests
        (Id, InitiativeId, RequesterId, MainSkillId, Message, [Role], Availability,
         Status, CreatedAt, UpdatedAt, ResolvedAt)
    VALUES
        (1, 1, 2, 4, N'Me interesa contribuir con materiales educativos.', N'Docente', N'Tardes',
         N'Aceptada', '2026-11-01T10:00:00.000', '2026-11-02T10:00:00.000', '2026-11-02T10:00:00.000'),
        (2, 2, 3, 5, N'Me interesa apoyar el diseño de la huerta comunitaria.', N'Diseñadora', N'Fines de semana',
         N'Pendiente', '2026-11-01T10:00:00.000', '2026-11-02T10:00:00.000', NULL);
    SET IDENTITY_INSERT dbo.Requests OFF;

    SET IDENTITY_INSERT dbo.Projects ON;
    INSERT INTO dbo.Projects
        (Id, InitiativeId, Name, Description, Objective, StartDate, EstimatedEndDate,
         Status, RepositoryUrl, CreatedAt, UpdatedAt)
    VALUES
        (1, 1, N'Aula abierta', N'Plataforma de recursos educativos', N'Compartir materiales educativos',
         '2026-11-02', NULL, N'Planificación', NULL, '2026-11-02T10:00:00.000', '2026-11-02T10:00:00.000');
    SET IDENTITY_INSERT dbo.Projects OFF;

    INSERT INTO dbo.ProjectTechnologies (ProjectId, Position, [Value])
    VALUES (1, 0, N'React'), (1, 1, N'SQL Server');

    -- No se crean sesiones para las pruebas de lectura.
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    -- IDENTITY_INSERT pertenece a la sesión; liberar el ajuste si falló una carga.
    SET IDENTITY_INSERT dbo.Users OFF;
    SET IDENTITY_INSERT dbo.Skills OFF;
    SET IDENTITY_INSERT dbo.Initiatives OFF;
    SET IDENTITY_INSERT dbo.Requests OFF;
    SET IDENTITY_INSERT dbo.Projects OFF;
    THROW;
END CATCH;
GO
