namespace Dna.Mvp.Data.Entities.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _20150303A_Initialization : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.AccessControlListItems",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        DomainObjectId = c.Int(),
                        RoleId = c.String(nullable: false, maxLength: 128),
                        PermissionValue = c.Int(nullable: false),
                        IsActive = c.Boolean(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(nullable: false, maxLength: 255),
                        UpdatedDate = c.DateTime(),
                        UpdatedBy = c.String(maxLength: 255),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.DomainObjects", t => t.DomainObjectId)
                .ForeignKey("dbo.AspNetRoles", t => t.RoleId, cascadeDelete: true)
                .Index(t => t.DomainObjectId)
                .Index(t => t.RoleId);
            
            CreateTable(
                "dbo.DomainObjects",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(maxLength: 50),
                        Description = c.String(),
                        IsActive = c.Boolean(),
                        CreatedDate = c.DateTime(),
                        CreatedBy = c.String(maxLength: 255),
                        UpdatedDate = c.DateTime(),
                        UpdatedBy = c.String(maxLength: 255),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.AspNetRoles",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        Name = c.String(nullable: false, maxLength: 256),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.AspNetUsers",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        Email = c.String(maxLength: 256),
                        EmailConfirmed = c.Boolean(nullable: false),
                        PasswordHash = c.String(),
                        SecurityStamp = c.String(),
                        PhoneNumber = c.String(),
                        PhoneNumberConfirmed = c.Boolean(nullable: false),
                        TwoFactorEnabled = c.Boolean(nullable: false),
                        LockoutEndDateUtc = c.DateTime(),
                        LockoutEnabled = c.Boolean(nullable: false),
                        AccessFailedCount = c.Int(nullable: false),
                        UserName = c.String(nullable: false, maxLength: 256),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.AspNetUserClaims",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.String(nullable: false, maxLength: 128),
                        ClaimType = c.String(),
                        ClaimValue = c.String(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.AspNetUserLogins",
                c => new
                    {
                        LoginProvider = c.String(nullable: false, maxLength: 128),
                        ProviderKey = c.String(nullable: false, maxLength: 128),
                        UserId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => new { t.LoginProvider, t.ProviderKey, t.UserId })
                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.AllDataTypes",
                c => new
                    {
                        AllDataTypeID = c.Guid(nullable: false),
                        BigInt = c.Long(),
                        Binary = c.Binary(maxLength: 50, fixedLength: true),
                        Bit = c.Boolean(),
                        Char = c.String(maxLength: 10, fixedLength: true, unicode: false),
                        Date = c.DateTime(storeType: "date"),
                        DateTime = c.DateTime(),
                        DateTime2 = c.DateTime(precision: 7, storeType: "datetime2"),
                        DateTimeOffset = c.DateTimeOffset(precision: 7),
                        Decimal = c.Decimal(precision: 18, scale: 0),
                        Float = c.Double(),
                        Geography = c.Geography(),
                        Geometry = c.Geometry(),
                        Image = c.Binary(storeType: "image"),
                        Int = c.Int(),
                        Money = c.Decimal(storeType: "money"),
                        NChar = c.String(maxLength: 10, fixedLength: true),
                        NText = c.String(storeType: "ntext"),
                        Numeric = c.Decimal(precision: 18, scale: 0, storeType: "numeric"),
                        NVarChar = c.String(maxLength: 50),
                        NVarCharMax = c.String(),
                        Real = c.Single(),
                        SmallDateTime = c.DateTime(storeType: "smalldatetime"),
                        SmallInt = c.Short(),
                        SmallMoney = c.Decimal(storeType: "smallmoney"),
                        Text = c.String(unicode: false, storeType: "text"),
                        Time = c.Time(precision: 7),
                        TimeStamp = c.Binary(fixedLength: true, timestamp: true, storeType: "timestamp"),
                        TinyInt = c.Byte(),
                        UniqueIdentifier = c.Guid(),
                        VarBinary = c.Binary(maxLength: 50),
                        VarBinaryMax = c.Binary(),
                        VarChar = c.String(maxLength: 50, unicode: false),
                        VarCharMax = c.String(unicode: false),
                        Xml = c.String(storeType: "xml"),
                        ZHierarchyID = c.String(maxLength: 50, unicode: false),
                        ZSql_Variant = c.String(maxLength: 50, unicode: false),
                    })
                .PrimaryKey(t => t.AllDataTypeID);
            
            CreateTable(
                "dbo.Attachments",
                c => new
                    {
                        AttachmentID = c.Guid(nullable: false),
                        FileName = c.String(nullable: false, maxLength: 100, unicode: false),
                        FilePath = c.String(nullable: false, unicode: false),
                        FileContent = c.Binary(nullable: false),
                        IsActive = c.Boolean(nullable: false),
                        DisplayOrder = c.Int(),
                        CreatedDate = c.DateTime(nullable: false),
                        CreateBy = c.Guid(nullable: false),
                        UpdatedDate = c.DateTime(),
                        UpdateBy = c.Guid(),
                    })
                .PrimaryKey(t => t.AttachmentID);
            
            CreateTable(
                "dbo.AuditLog",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Who = c.Guid(nullable: false),
                        What = c.String(nullable: false, maxLength: 50, unicode: false),
                        When = c.DateTime(nullable: false),
                        TableName = c.String(nullable: false, maxLength: 50, unicode: false),
                        TableIdValue = c.String(maxLength: 50, unicode: false),
                        OldData = c.String(unicode: false, storeType: "text"),
                        NewData = c.String(unicode: false, storeType: "text"),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.ELMAH_Error",
                c => new
                    {
                        ErrorId = c.Guid(nullable: false),
                        Application = c.String(nullable: false, maxLength: 60),
                        Host = c.String(nullable: false, maxLength: 50),
                        Type = c.String(nullable: false, maxLength: 100),
                        Source = c.String(nullable: false, maxLength: 60),
                        Message = c.String(nullable: false, maxLength: 500),
                        User = c.String(nullable: false, maxLength: 50),
                        StatusCode = c.Int(nullable: false),
                        TimeUtc = c.DateTime(nullable: false),
                        Sequence = c.Int(nullable: false, identity: true),
                        AllXml = c.String(nullable: false),
                    })
                .PrimaryKey(t => t.ErrorId);
            
            CreateTable(
                "dbo.Permissions",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Value = c.Int(nullable: false),
                        Name = c.String(nullable: false, maxLength: 50),
                        Description = c.String(maxLength: 255),
                        IsActive = c.Boolean(nullable: false),
                        CreatedDate = c.DateTime(),
                        CreatedBy = c.String(maxLength: 255),
                        UpdatedDate = c.DateTime(),
                        UpdatedBy = c.String(maxLength: 255),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.TypeOfTypes",
                c => new
                    {
                        TypeOfTypeID = c.Guid(nullable: false),
                        Abbreviation = c.String(),
                        Name = c.String(nullable: false),
                        Key = c.String(),
                        Order = c.Int(),
                        ParentID = c.Guid(),
                        TypeID = c.Guid(),
                        Value = c.String(),
                        CreatedDate = c.DateTime(nullable: false),
                        UpdatedDate = c.DateTime(),
                        CreateBy = c.Guid(),
                        UpdateBy = c.Guid(),
                    })
                .PrimaryKey(t => t.TypeOfTypeID)
                .ForeignKey("dbo.TypeOfTypes", t => t.TypeID)
                .ForeignKey("dbo.TypeOfTypes", t => t.ParentID)
                .Index(t => t.ParentID)
                .Index(t => t.TypeID);
            
            CreateTable(
                "dbo.Users",
                c => new
                    {
                        UserID = c.Guid(nullable: false),
                        StatusID = c.Byte(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        UpdatedDate = c.DateTime(),
                        CreateBy = c.Guid(nullable: false),
                        UpdateBy = c.Guid(),
                        FirstName = c.String(),
                        MiddleName = c.String(),
                        LastName = c.String(),
                        Company = c.String(),
                        Department = c.String(),
                        JobTitle = c.String(),
                        WorkNumber = c.String(),
                        WorkFaxNumber = c.String(),
                        WorkAddress = c.String(),
                        IM = c.String(),
                        Email = c.String(),
                        MobileNumber = c.String(),
                        WebPage = c.String(),
                        OfficeLocation = c.String(),
                        HomeNumber = c.String(),
                        HomeAddress = c.String(),
                        OtherAddress = c.String(),
                        PagerNumber = c.String(),
                        CarNumber = c.String(),
                        HomeFax = c.String(),
                        CompanyNumber = c.String(),
                        Work2Number = c.String(),
                        Home2Number = c.String(),
                        RadioNumber = c.String(),
                        IM2 = c.String(),
                        IM3 = c.String(),
                        Email2 = c.String(),
                        Email3 = c.String(),
                        Assistant = c.String(),
                        AssistantNumber = c.String(),
                        Manager = c.String(),
                        GovtID = c.String(),
                        Account = c.String(),
                        CustomerID = c.String(),
                        Birthday = c.DateTime(nullable: false),
                        Anniversary = c.String(),
                        Spouse = c.String(),
                        Children = c.String(),
                        IUserID = c.Int(nullable: false, identity: true),
                        PhotoUrl = c.String(),
                        PledgeAmount = c.Int(),
                        NewsLetterEmail = c.String(),
                        OtherInfo = c.String(),
                    })
                .PrimaryKey(t => t.UserID)
                .ForeignKey("dbo.Users", t => t.CreateBy)
                .Index(t => t.CreateBy);
            
            CreateTable(
                "dbo.Validations",
                c => new
                    {
                        ValidationID = c.Guid(nullable: false),
                        Integer = c.Int(nullable: false),
                        String = c.String(),
                        Date = c.DateTime(storeType: "date"),
                        BeforeDate = c.DateTime(),
                        AfterDate = c.DateTime(),
                        Age = c.Int(),
                        CreditCard = c.Decimal(precision: 16, scale: 0, storeType: "numeric"),
                        Email = c.String(maxLength: 100),
                        Phone = c.String(maxLength: 15),
                        URL = c.String(),
                        Zip = c.String(maxLength: 5, fixedLength: true, unicode: false),
                        StartsWithDPT = c.String(maxLength: 100),
                        ContainsDPT = c.String(maxLength: 100),
                    })
                .PrimaryKey(t => t.ValidationID);
            
            CreateTable(
                "dbo.AspNetUserRoles",
                c => new
                    {
                        RoleId = c.String(nullable: false, maxLength: 128),
                        UserId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => new { t.RoleId, t.UserId })
                .ForeignKey("dbo.AspNetRoles", t => t.RoleId, cascadeDelete: true)
                .ForeignKey("dbo.AspNetUsers", t => t.UserId, cascadeDelete: true)
                .Index(t => t.RoleId)
                .Index(t => t.UserId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Users", "CreateBy", "dbo.Users");
            DropForeignKey("dbo.TypeOfTypes", "ParentID", "dbo.TypeOfTypes");
            DropForeignKey("dbo.TypeOfTypes", "TypeID", "dbo.TypeOfTypes");
            DropForeignKey("dbo.AccessControlListItems", "RoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.AspNetUserRoles", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserRoles", "RoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.AspNetUserLogins", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.AspNetUserClaims", "UserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.AccessControlListItems", "DomainObjectId", "dbo.DomainObjects");
            DropIndex("dbo.AspNetUserRoles", new[] { "UserId" });
            DropIndex("dbo.AspNetUserRoles", new[] { "RoleId" });
            DropIndex("dbo.Users", new[] { "CreateBy" });
            DropIndex("dbo.TypeOfTypes", new[] { "TypeID" });
            DropIndex("dbo.TypeOfTypes", new[] { "ParentID" });
            DropIndex("dbo.AspNetUserLogins", new[] { "UserId" });
            DropIndex("dbo.AspNetUserClaims", new[] { "UserId" });
            DropIndex("dbo.AccessControlListItems", new[] { "RoleId" });
            DropIndex("dbo.AccessControlListItems", new[] { "DomainObjectId" });
            DropTable("dbo.AspNetUserRoles");
            DropTable("dbo.Validations");
            DropTable("dbo.Users");
            DropTable("dbo.TypeOfTypes");
            DropTable("dbo.Permissions");
            DropTable("dbo.ELMAH_Error");
            DropTable("dbo.AuditLog");
            DropTable("dbo.Attachments");
            DropTable("dbo.AllDataTypes");
            DropTable("dbo.AspNetUserLogins");
            DropTable("dbo.AspNetUserClaims");
            DropTable("dbo.AspNetUsers");
            DropTable("dbo.AspNetRoles");
            DropTable("dbo.DomainObjects");
            DropTable("dbo.AccessControlListItems");
        }
    }
}
