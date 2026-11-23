-- innovation_hub.dbo.Skills definition - DRAFT FROM DBEAVER EXPORT ON MYSQL WORKBENCH - AU C.I.M.R

-- Crear la base si aún no existe; las tablas se crean una sola vez.
IF DB_ID(N'innovation_hub') IS NULL
    EXEC(N'CREATE DATABASE innovation_hub');
GO
USE innovation_hub;
GO


CREATE TABLE innovation_hub.dbo.Skills (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(120) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_Skills PRIMARY KEY (Id),
	CONSTRAINT UQ_Skills_Name UNIQUE (Name)
);


-- innovation_hub.dbo.Users definition


CREATE TABLE innovation_hub.dbo.Users (
	Id int IDENTITY(1,1) NOT NULL,
	FirstName nvarchar(80) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	LastName nvarchar(80) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	SecondLastName nvarchar(80) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Email nvarchar(254) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	PasswordHash nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	MemberType nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Career nvarchar(120) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Description nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Availability nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	PortfolioUrl nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Active bit NOT NULL,
	CreatedAt datetime2(3) NOT NULL,
	UpdatedAt datetime2(3) NOT NULL,
	CONSTRAINT PK_Users PRIMARY KEY (Id),
	CONSTRAINT UQ_Users_Email UNIQUE (Email)
);
ALTER TABLE innovation_hub.dbo.Users WITH CHECK ADD CONSTRAINT CK_Users_MemberType CHECK (([MemberType]=N'Administrativo' OR [MemberType]=N'Docente' OR [MemberType]=N'Estudiante'));


-- innovation_hub.dbo.Initiatives definition


CREATE TABLE innovation_hub.dbo.Initiatives (
	Id int IDENTITY(1,1) NOT NULL,
	Title nvarchar(80) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	TitleKey nvarchar(80) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Type] nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Summary nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Description nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Problem nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Beneficiaries nvarchar(150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Category nvarchar(40) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Capacity int NOT NULL,
	Visibility nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Status nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	OwnerId int NOT NULL,
	PublishedAt datetime2(3) NULL,
	CreatedAt datetime2(3) NOT NULL,
	UpdatedAt datetime2(3) NOT NULL,
	CONSTRAINT PK_Initiatives PRIMARY KEY (Id),
	CONSTRAINT UQ_Initiatives_TitleKey UNIQUE (TitleKey),
	CONSTRAINT FK_Initiatives_Users FOREIGN KEY (OwnerId) REFERENCES innovation_hub.dbo.Users(Id)
);
ALTER TABLE innovation_hub.dbo.Initiatives WITH CHECK ADD CONSTRAINT CK_Initiatives_Type CHECK (([Type]=N'Reto' OR [Type]=N'Necesidad' OR [Type]=N'Idea'));
ALTER TABLE innovation_hub.dbo.Initiatives WITH CHECK ADD CONSTRAINT CK_Initiatives_Category CHECK (([Category]=N'Otro' OR [Category]=N'Cultura y creatividad' OR [Category]=N'Salud y bienestar' OR [Category]=N'Negocios y emprendimiento' OR [Category]=N'Impacto social' OR [Category]=N'Sostenibilidad' OR [Category]=N'Educación' OR [Category]=N'Tecnología'));
ALTER TABLE innovation_hub.dbo.Initiatives WITH CHECK ADD CONSTRAINT CK_Initiatives_Capacity CHECK (([Capacity]>=(1) AND [Capacity]<=(20)));
ALTER TABLE innovation_hub.dbo.Initiatives WITH CHECK ADD CONSTRAINT CK_Initiatives_Visibility CHECK (([Visibility]=N'Privada' OR [Visibility]=N'Restringida' OR [Visibility]=N'Institucional' OR [Visibility]=N'Pública'));
ALTER TABLE innovation_hub.dbo.Initiatives WITH CHECK ADD CONSTRAINT CK_Initiatives_Status CHECK (([Status]=N'Archivada' OR [Status]=N'Convertida en proyecto' OR [Status]=N'En formación de equipo' OR [Status]=N'Publicada' OR [Status]=N'Borrador'));


-- innovation_hub.dbo.InitiativeMembers definition


CREATE TABLE innovation_hub.dbo.InitiativeMembers (
	InitiativeId int NOT NULL,
	UserId int NOT NULL,
	[Role] nvarchar(60) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	JoinedAt datetime2(3) NOT NULL,
	Position int NOT NULL,
	CONSTRAINT PK_InitiativeMembers PRIMARY KEY (InitiativeId,UserId),
	CONSTRAINT UQ_InitiativeMembers_Position UNIQUE (InitiativeId,Position),
	CONSTRAINT FK_InitiativeMembers_Initiatives FOREIGN KEY (InitiativeId) REFERENCES innovation_hub.dbo.Initiatives(Id),
	CONSTRAINT FK_InitiativeMembers_Users FOREIGN KEY (UserId) REFERENCES innovation_hub.dbo.Users(Id)
);
ALTER TABLE innovation_hub.dbo.InitiativeMembers WITH CHECK ADD CONSTRAINT CK_InitiativeMembers_Position CHECK (([Position]>=(0)));


-- innovation_hub.dbo.Projects definition


CREATE TABLE innovation_hub.dbo.Projects (
	Id int IDENTITY(1,1) NOT NULL,
	InitiativeId int NOT NULL,
	Name nvarchar(120) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Description nvarchar(2000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Objective nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	StartDate date NOT NULL,
	EstimatedEndDate date NULL,
	Status nvarchar(40) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	RepositoryUrl nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CreatedAt datetime2(3) NOT NULL,
	UpdatedAt datetime2(3) NOT NULL,
	CONSTRAINT PK_Projects PRIMARY KEY (Id),
	CONSTRAINT UQ_Projects_Initiative UNIQUE (InitiativeId),
	CONSTRAINT FK_Projects_Initiatives FOREIGN KEY (InitiativeId) REFERENCES innovation_hub.dbo.Initiatives(Id)
);


-- innovation_hub.dbo.Sessions definition


CREATE TABLE innovation_hub.dbo.Sessions (
	Id int IDENTITY(1,1) NOT NULL,
	TokenHash char(64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	UserId int NOT NULL,
	ExpiresAt datetime2(3) NOT NULL,
	CONSTRAINT PK_Sessions PRIMARY KEY (Id),
	CONSTRAINT UQ_Sessions_TokenHash UNIQUE (TokenHash),
	CONSTRAINT FK_Sessions_Users FOREIGN KEY (UserId) REFERENCES innovation_hub.dbo.Users(Id)
);
 CREATE NONCLUSTERED INDEX IX_Sessions_ExpiresAt ON innovation_hub.dbo.Sessions (  ExpiresAt ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY] ;


-- innovation_hub.dbo.Requests definition


CREATE TABLE innovation_hub.dbo.Requests (
	Id int IDENTITY(1,1) NOT NULL,
	InitiativeId int NOT NULL,
	RequesterId int NOT NULL,
	MainSkillId int NOT NULL,
	Message nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Role] nvarchar(60) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Availability nvarchar(60) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Status nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CreatedAt datetime2(3) NOT NULL,
	UpdatedAt datetime2(3) NOT NULL,
	ResolvedAt datetime2(3) NULL,
	CONSTRAINT PK_Requests PRIMARY KEY (Id),
	CONSTRAINT FK_Requests_Skills FOREIGN KEY (MainSkillId) REFERENCES innovation_hub.dbo.Skills(Id),
	CONSTRAINT FK_Requests_Initiatives FOREIGN KEY (InitiativeId) REFERENCES innovation_hub.dbo.Initiatives(Id),
	CONSTRAINT FK_Requests_Users FOREIGN KEY (RequesterId) REFERENCES innovation_hub.dbo.Users(Id)
);
 CREATE UNIQUE NONCLUSTERED INDEX UX_Requests_Pending ON innovation_hub.dbo.Requests (  InitiativeId ASC  , RequesterId ASC  )  
	 WHERE  ([Status]=N'Pendiente')
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY] ;
ALTER TABLE innovation_hub.dbo.Requests WITH CHECK ADD CONSTRAINT CK_Requests_Status CHECK (([Status]=N'Cancelada' OR [Status]=N'Rechazada' OR [Status]=N'Aceptada' OR [Status]=N'Pendiente'));


-- innovation_hub.dbo.UserSkills definition


CREATE TABLE innovation_hub.dbo.UserSkills (
	UserId int NOT NULL,
	SkillId int NOT NULL,
	CONSTRAINT PK_UserSkills PRIMARY KEY (UserId,SkillId),
	CONSTRAINT FK_UserSkills_Skills FOREIGN KEY (SkillId) REFERENCES innovation_hub.dbo.Skills(Id),
	CONSTRAINT FK_UserSkills_Users FOREIGN KEY (UserId) REFERENCES innovation_hub.dbo.Users(Id)
);


-- innovation_hub.dbo.UserInterests definition


CREATE TABLE innovation_hub.dbo.UserInterests (
	UserId int NOT NULL,
	Position int NOT NULL,
	Value nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_UserInterests PRIMARY KEY (UserId,Position),
	CONSTRAINT FK_UserInterests_Users FOREIGN KEY (UserId) REFERENCES innovation_hub.dbo.Users(Id)
);
ALTER TABLE innovation_hub.dbo.UserInterests WITH CHECK ADD CONSTRAINT CK_UserInterests_Position CHECK (([Position]>=(0)));


-- innovation_hub.dbo.InitiativeSkills definition


CREATE TABLE innovation_hub.dbo.InitiativeSkills (
	InitiativeId int NOT NULL,
	SkillId int NOT NULL,
	CONSTRAINT PK_InitiativeSkills PRIMARY KEY (InitiativeId,SkillId),
	CONSTRAINT FK_InitiativeSkills_Skills FOREIGN KEY (SkillId) REFERENCES innovation_hub.dbo.Skills(Id),
	CONSTRAINT FK_InitiativeSkills_Initiatives FOREIGN KEY (InitiativeId) REFERENCES innovation_hub.dbo.Initiatives(Id)
);


-- innovation_hub.dbo.InitiativeTags definition


CREATE TABLE innovation_hub.dbo.InitiativeTags (
	InitiativeId int NOT NULL,
	Position int NOT NULL,
	Value nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_InitiativeTags PRIMARY KEY (InitiativeId,Position),
	CONSTRAINT UQ_InitiativeTags_Value UNIQUE (InitiativeId,Value),
	CONSTRAINT FK_InitiativeTags_Initiatives FOREIGN KEY (InitiativeId) REFERENCES innovation_hub.dbo.Initiatives(Id)
);
ALTER TABLE innovation_hub.dbo.InitiativeTags WITH CHECK ADD CONSTRAINT CK_InitiativeTags_Position CHECK (([Position]>=(0)));


-- innovation_hub.dbo.ProjectTechnologies definition


CREATE TABLE innovation_hub.dbo.ProjectTechnologies (
	ProjectId int NOT NULL,
	Position int NOT NULL,
	Value nvarchar(60) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_ProjectTechnologies PRIMARY KEY (ProjectId,Position),
	CONSTRAINT FK_ProjectTechnologies_Projects FOREIGN KEY (ProjectId) REFERENCES innovation_hub.dbo.Projects(Id)
);
ALTER TABLE innovation_hub.dbo.ProjectTechnologies WITH CHECK ADD CONSTRAINT CK_ProjectTechnologies_Position CHECK (([Position]>=(0)));