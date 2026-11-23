-- BORA TODA LA DB, ESTO ES NUKE SCRIPT PARA BORRAR LOS DATOS DE PRUEBA, CUIDADO !

-- CUIDADO!!!!!!!!!!!!!!!!!!!!!
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;

    ALTER TABLE innovation_hub.dbo.Initiatives DROP CONSTRAINT FK_Initiatives_Users;
    ALTER TABLE innovation_hub.dbo.InitiativeMembers DROP CONSTRAINT FK_InitiativeMembers_Initiatives;
    ALTER TABLE innovation_hub.dbo.InitiativeMembers DROP CONSTRAINT FK_InitiativeMembers_Users;
    ALTER TABLE innovation_hub.dbo.Projects DROP CONSTRAINT FK_Projects_Initiatives;
    ALTER TABLE innovation_hub.dbo.Sessions DROP CONSTRAINT FK_Sessions_Users;
    ALTER TABLE innovation_hub.dbo.Requests DROP CONSTRAINT FK_Requests_Skills;
    ALTER TABLE innovation_hub.dbo.Requests DROP CONSTRAINT FK_Requests_Initiatives;
    ALTER TABLE innovation_hub.dbo.Requests DROP CONSTRAINT FK_Requests_Users;
    ALTER TABLE innovation_hub.dbo.UserSkills DROP CONSTRAINT FK_UserSkills_Skills;
    ALTER TABLE innovation_hub.dbo.UserSkills DROP CONSTRAINT FK_UserSkills_Users;
    ALTER TABLE innovation_hub.dbo.UserInterests DROP CONSTRAINT FK_UserInterests_Users;
    ALTER TABLE innovation_hub.dbo.InitiativeSkills DROP CONSTRAINT FK_InitiativeSkills_Skills;
    ALTER TABLE innovation_hub.dbo.InitiativeSkills DROP CONSTRAINT FK_InitiativeSkills_Initiatives;
    ALTER TABLE innovation_hub.dbo.InitiativeTags DROP CONSTRAINT FK_InitiativeTags_Initiatives;
    ALTER TABLE innovation_hub.dbo.ProjectTechnologies DROP CONSTRAINT FK_ProjectTechnologies_Projects;

    TRUNCATE TABLE innovation_hub.dbo.Skills;
    TRUNCATE TABLE innovation_hub.dbo.Users;
    TRUNCATE TABLE innovation_hub.dbo.Initiatives;
    TRUNCATE TABLE innovation_hub.dbo.InitiativeMembers;
    TRUNCATE TABLE innovation_hub.dbo.Projects;
    TRUNCATE TABLE innovation_hub.dbo.Sessions;
    TRUNCATE TABLE innovation_hub.dbo.Requests;
    TRUNCATE TABLE innovation_hub.dbo.UserSkills;
    TRUNCATE TABLE innovation_hub.dbo.UserInterests;
    TRUNCATE TABLE innovation_hub.dbo.InitiativeSkills;
    TRUNCATE TABLE innovation_hub.dbo.InitiativeTags;
    TRUNCATE TABLE innovation_hub.dbo.ProjectTechnologies;

    ALTER TABLE innovation_hub.dbo.Initiatives WITH CHECK ADD CONSTRAINT FK_Initiatives_Users FOREIGN KEY (OwnerId) REFERENCES innovation_hub.dbo.Users (Id);
    ALTER TABLE innovation_hub.dbo.InitiativeMembers WITH CHECK ADD CONSTRAINT FK_InitiativeMembers_Initiatives FOREIGN KEY (InitiativeId) REFERENCES innovation_hub.dbo.Initiatives (Id);
    ALTER TABLE innovation_hub.dbo.InitiativeMembers WITH CHECK ADD CONSTRAINT FK_InitiativeMembers_Users FOREIGN KEY (UserId) REFERENCES innovation_hub.dbo.Users (Id);
    ALTER TABLE innovation_hub.dbo.Projects WITH CHECK ADD CONSTRAINT FK_Projects_Initiatives FOREIGN KEY (InitiativeId) REFERENCES innovation_hub.dbo.Initiatives (Id);
    ALTER TABLE innovation_hub.dbo.Sessions WITH CHECK ADD CONSTRAINT FK_Sessions_Users FOREIGN KEY (UserId) REFERENCES innovation_hub.dbo.Users (Id);
    ALTER TABLE innovation_hub.dbo.Requests WITH CHECK ADD CONSTRAINT FK_Requests_Skills FOREIGN KEY (MainSkillId) REFERENCES innovation_hub.dbo.Skills (Id);
    ALTER TABLE innovation_hub.dbo.Requests WITH CHECK ADD CONSTRAINT FK_Requests_Initiatives FOREIGN KEY (InitiativeId) REFERENCES innovation_hub.dbo.Initiatives (Id);
    ALTER TABLE innovation_hub.dbo.Requests WITH CHECK ADD CONSTRAINT FK_Requests_Users FOREIGN KEY (RequesterId) REFERENCES innovation_hub.dbo.Users (Id);
    ALTER TABLE innovation_hub.dbo.UserSkills WITH CHECK ADD CONSTRAINT FK_UserSkills_Skills FOREIGN KEY (SkillId) REFERENCES innovation_hub.dbo.Skills (Id);
    ALTER TABLE innovation_hub.dbo.UserSkills WITH CHECK ADD CONSTRAINT FK_UserSkills_Users FOREIGN KEY (UserId) REFERENCES innovation_hub.dbo.Users (Id);
    ALTER TABLE innovation_hub.dbo.UserInterests WITH CHECK ADD CONSTRAINT FK_UserInterests_Users FOREIGN KEY (UserId) REFERENCES innovation_hub.dbo.Users (Id);
    ALTER TABLE innovation_hub.dbo.InitiativeSkills WITH CHECK ADD CONSTRAINT FK_InitiativeSkills_Skills FOREIGN KEY (SkillId) REFERENCES innovation_hub.dbo.Skills (Id);
    ALTER TABLE innovation_hub.dbo.InitiativeSkills WITH CHECK ADD CONSTRAINT FK_InitiativeSkills_Initiatives FOREIGN KEY (InitiativeId) REFERENCES innovation_hub.dbo.Initiatives (Id);
    ALTER TABLE innovation_hub.dbo.InitiativeTags WITH CHECK ADD CONSTRAINT FK_InitiativeTags_Initiatives FOREIGN KEY (InitiativeId) REFERENCES innovation_hub.dbo.Initiatives (Id);
    ALTER TABLE innovation_hub.dbo.ProjectTechnologies WITH CHECK ADD CONSTRAINT FK_ProjectTechnologies_Projects FOREIGN KEY (ProjectId) REFERENCES innovation_hub.dbo.Projects (Id);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
