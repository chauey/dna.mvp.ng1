namespace Dna.Mvp.Data.Entities.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Update_Schema_CustomerUserGroupRole : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.Users", "User1_UserID", "dbo.Users");
            DropForeignKey("dbo.UserCustomers", "UserID", "dbo.Users");
            DropIndex("dbo.Users", new[] { "User1_UserID" });
            DropIndex("dbo.UserCustomers", new[] { "UserID" });
            DropPrimaryKey("dbo.Users");
            DropPrimaryKey("dbo.UserCustomers");
            CreateTable(
                "dbo.CustomerGroups",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        CustomerId = c.String(maxLength: 128),
                        GroupId = c.Guid(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Customers", t => t.CustomerId)
                .ForeignKey("dbo.Groups", t => t.GroupId, cascadeDelete: true)
                .Index(t => t.CustomerId)
                .Index(t => t.GroupId);
            
            CreateTable(
                "dbo.Groups",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        PayerId = c.Guid(),
                        Name = c.String(nullable: false, maxLength: 255),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.GroupOwners",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        GroupId = c.Guid(nullable: false),
                        OwnerId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Groups", t => t.GroupId, cascadeDelete: true)
                .ForeignKey("dbo.Users", t => t.OwnerId, cascadeDelete: true)
                .Index(t => t.GroupId)
                .Index(t => t.OwnerId);
            
            CreateTable(
                "dbo.GroupRoles",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        GroupId = c.Guid(nullable: false),
                        AspNetRoleId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Groups", t => t.GroupId)
                .ForeignKey("dbo.AspNetRoles", t => t.AspNetRoleId)
                .Index(t => t.GroupId)
                .Index(t => t.AspNetRoleId);
            
            CreateTable(
                "dbo.GroupUsers",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        GroupId = c.Guid(nullable: false),
                        UserId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Groups", t => t.GroupId, cascadeDelete: true)
                .ForeignKey("dbo.Users", t => t.UserId, cascadeDelete: true)
                .Index(t => t.GroupId)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.SubscriptionGroups",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        SubscriptionId = c.Guid(nullable: false),
                        GroupId = c.Guid(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Groups", t => t.GroupId, cascadeDelete: true)
                .ForeignKey("dbo.Subscriptions", t => t.SubscriptionId, cascadeDelete: true)
                .Index(t => t.SubscriptionId)
                .Index(t => t.GroupId);
            
            CreateTable(
                "dbo.Subscriptions",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        PlanId = c.Guid(),
                        Expiration = c.DateTime(),
                        Name = c.String(maxLength: 255),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.SubscriptionPlans", t => t.PlanId)
                .Index(t => t.PlanId);
            
            CreateTable(
                "dbo.CustomerSubscriptions",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        CustomerId = c.String(maxLength: 128),
                        SubscriptionId = c.Guid(nullable: false),
                        Discount = c.String(maxLength: 50),
                        TaxPercent = c.Int(),
                        StartDate = c.DateTime(),
                        EndDate = c.DateTime(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Customers", t => t.CustomerId)
                .ForeignKey("dbo.Subscriptions", t => t.SubscriptionId, cascadeDelete: true)
                .Index(t => t.CustomerId)
                .Index(t => t.SubscriptionId);
            
            CreateTable(
                "dbo.SubscriptionPlans",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        Name = c.String(nullable: false, maxLength: 255),
                        MaxGroups = c.Int(),
                        MaxUsers = c.Int(),
                        MaxExample = c.Int(),
                        Price = c.Decimal(precision: 18, scale: 2),
                        TrialPeriod = c.Int(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.CustomerRoles",
                c => new
                    {
                        CustomerRoleId = c.Guid(nullable: false),
                        AspNetRoleId = c.String(nullable: false, maxLength: 128),
                        CustomerId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => t.CustomerRoleId)
                .ForeignKey("dbo.Customers", t => t.CustomerId)
                .ForeignKey("dbo.AspNetRoles", t => t.AspNetRoleId)
                .Index(t => t.AspNetRoleId)
                .Index(t => t.CustomerId);
            
            CreateTable(
                "dbo.CustomerRoleMappings",
                c => new
                    {
                        AspNetRoleId = c.String(nullable: false, maxLength: 128),
                        CustomerId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => new { t.AspNetRoleId, t.CustomerId })
                .ForeignKey("dbo.AspNetRoles", t => t.AspNetRoleId, cascadeDelete: true)
                .ForeignKey("dbo.Customers", t => t.CustomerId, cascadeDelete: true)
                .Index(t => t.AspNetRoleId)
                .Index(t => t.CustomerId);
            
            CreateTable(
                "dbo.GroupRoleMappings",
                c => new
                    {
                        AspNetRoleId = c.String(nullable: false, maxLength: 128),
                        GroupId = c.Guid(nullable: false),
                    })
                .PrimaryKey(t => new { t.AspNetRoleId, t.GroupId })
                .ForeignKey("dbo.AspNetRoles", t => t.AspNetRoleId, cascadeDelete: true)
                .ForeignKey("dbo.Groups", t => t.GroupId, cascadeDelete: true)
                .Index(t => t.AspNetRoleId)
                .Index(t => t.GroupId);
            
            AddColumn("dbo.Users", "Id", c => c.String(nullable: false, maxLength: 128));
            AddColumn("dbo.Users", "CustomerId", c => c.String(maxLength: 128));
            AlterColumn("dbo.UserCustomers", "UserID", c => c.String(nullable: false, maxLength: 128));
            AddPrimaryKey("dbo.Users", "Id");
            AddPrimaryKey("dbo.UserCustomers", new[] { "CustomerID", "UserID" });
            CreateIndex("dbo.Users", "Id");
            CreateIndex("dbo.Users", "CustomerId");
            CreateIndex("dbo.UserCustomers", "UserID");
            AddForeignKey("dbo.Users", "CustomerId", "dbo.Customers", "Id");
            AddForeignKey("dbo.Users", "Id", "dbo.AspNetUsers", "Id");
            AddForeignKey("dbo.UserCustomers", "UserID", "dbo.Users", "Id", cascadeDelete: true);
            DropColumn("dbo.Users", "UserID");
            DropColumn("dbo.Users", "User1_UserID");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Users", "User1_UserID", c => c.Guid());
            AddColumn("dbo.Users", "UserID", c => c.Guid(nullable: false));
            DropForeignKey("dbo.UserCustomers", "UserID", "dbo.Users");
            DropForeignKey("dbo.GroupRoleMappings", "GroupId", "dbo.Groups");
            DropForeignKey("dbo.GroupRoleMappings", "AspNetRoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.GroupRoles", "AspNetRoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.CustomerRoleMappings", "CustomerId", "dbo.Customers");
            DropForeignKey("dbo.CustomerRoleMappings", "AspNetRoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.CustomerRoles", "AspNetRoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.Users", "Id", "dbo.AspNetUsers");
            DropForeignKey("dbo.GroupOwners", "OwnerId", "dbo.Users");
            DropForeignKey("dbo.Users", "CustomerId", "dbo.Customers");
            DropForeignKey("dbo.CustomerRoles", "CustomerId", "dbo.Customers");
            DropForeignKey("dbo.Subscriptions", "PlanId", "dbo.SubscriptionPlans");
            DropForeignKey("dbo.SubscriptionGroups", "SubscriptionId", "dbo.Subscriptions");
            DropForeignKey("dbo.CustomerSubscriptions", "SubscriptionId", "dbo.Subscriptions");
            DropForeignKey("dbo.CustomerSubscriptions", "CustomerId", "dbo.Customers");
            DropForeignKey("dbo.SubscriptionGroups", "GroupId", "dbo.Groups");
            DropForeignKey("dbo.GroupUsers", "UserId", "dbo.Users");
            DropForeignKey("dbo.GroupUsers", "GroupId", "dbo.Groups");
            DropForeignKey("dbo.GroupRoles", "GroupId", "dbo.Groups");
            DropForeignKey("dbo.GroupOwners", "GroupId", "dbo.Groups");
            DropForeignKey("dbo.CustomerGroups", "GroupId", "dbo.Groups");
            DropForeignKey("dbo.CustomerGroups", "CustomerId", "dbo.Customers");
            DropIndex("dbo.GroupRoleMappings", new[] { "GroupId" });
            DropIndex("dbo.GroupRoleMappings", new[] { "AspNetRoleId" });
            DropIndex("dbo.CustomerRoleMappings", new[] { "CustomerId" });
            DropIndex("dbo.CustomerRoleMappings", new[] { "AspNetRoleId" });
            DropIndex("dbo.UserCustomers", new[] { "UserID" });
            DropIndex("dbo.CustomerRoles", new[] { "CustomerId" });
            DropIndex("dbo.CustomerRoles", new[] { "AspNetRoleId" });
            DropIndex("dbo.CustomerSubscriptions", new[] { "SubscriptionId" });
            DropIndex("dbo.CustomerSubscriptions", new[] { "CustomerId" });
            DropIndex("dbo.Subscriptions", new[] { "PlanId" });
            DropIndex("dbo.SubscriptionGroups", new[] { "GroupId" });
            DropIndex("dbo.SubscriptionGroups", new[] { "SubscriptionId" });
            DropIndex("dbo.GroupUsers", new[] { "UserId" });
            DropIndex("dbo.GroupUsers", new[] { "GroupId" });
            DropIndex("dbo.GroupRoles", new[] { "AspNetRoleId" });
            DropIndex("dbo.GroupRoles", new[] { "GroupId" });
            DropIndex("dbo.GroupOwners", new[] { "OwnerId" });
            DropIndex("dbo.GroupOwners", new[] { "GroupId" });
            DropIndex("dbo.CustomerGroups", new[] { "GroupId" });
            DropIndex("dbo.CustomerGroups", new[] { "CustomerId" });
            DropIndex("dbo.Users", new[] { "CustomerId" });
            DropIndex("dbo.Users", new[] { "Id" });
            DropPrimaryKey("dbo.UserCustomers");
            DropPrimaryKey("dbo.Users");
            AlterColumn("dbo.UserCustomers", "UserID", c => c.Guid(nullable: false));
            DropColumn("dbo.Users", "CustomerId");
            DropColumn("dbo.Users", "Id");
            DropTable("dbo.GroupRoleMappings");
            DropTable("dbo.CustomerRoleMappings");
            DropTable("dbo.CustomerRoles");
            DropTable("dbo.SubscriptionPlans");
            DropTable("dbo.CustomerSubscriptions");
            DropTable("dbo.Subscriptions");
            DropTable("dbo.SubscriptionGroups");
            DropTable("dbo.GroupUsers");
            DropTable("dbo.GroupRoles");
            DropTable("dbo.GroupOwners");
            DropTable("dbo.Groups");
            DropTable("dbo.CustomerGroups");
            AddPrimaryKey("dbo.UserCustomers", new[] { "CustomerID", "UserID" });
            AddPrimaryKey("dbo.Users", "UserID");
            CreateIndex("dbo.UserCustomers", "UserID");
            CreateIndex("dbo.Users", "User1_UserID");
            AddForeignKey("dbo.UserCustomers", "UserID", "dbo.Users", "UserID", cascadeDelete: true);
            AddForeignKey("dbo.Users", "User1_UserID", "dbo.Users", "UserID");
        }
    }
}
