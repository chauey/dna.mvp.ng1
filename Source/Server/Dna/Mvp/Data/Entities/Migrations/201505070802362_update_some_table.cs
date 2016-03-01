namespace Dna.Mvp.Data.Entities.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class update_some_table : DbMigration
    {
        public override void Up()
        {
            RenameTable(name: "dbo.GroupRoleMappings", newName: "GroupAspNetRoles");
            DropForeignKey("dbo.CustomerRoleMappings", "AspNetRoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.CustomerRoleMappings", "CustomerId", "dbo.Customers");
            DropForeignKey("dbo.CustomerRoles", "AspNetRoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.GroupRoles", "AspNetRoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.GroupOwners", "OwnerId", "dbo.Users");
            DropForeignKey("dbo.GroupRoles", "GroupId", "dbo.Groups");
            DropForeignKey("dbo.Subscriptions", "PlanId", "dbo.SubscriptionPlans");
            DropForeignKey("dbo.CustomerRoles", "CustomerId", "dbo.Customers");
            DropIndex("dbo.Users", new[] { "Id" });
            DropIndex("dbo.GroupOwners", new[] { "OwnerId" });
            DropIndex("dbo.Subscriptions", new[] { "PlanId" });
            DropIndex("dbo.CustomerRoleMappings", new[] { "AspNetRoleId" });
            DropIndex("dbo.CustomerRoleMappings", new[] { "CustomerId" });
            RenameColumn(table: "dbo.GroupAspNetRoles", name: "AspNetRoleId", newName: "AspNetRole_Id");
            RenameColumn(table: "dbo.GroupAspNetRoles", name: "GroupId", newName: "Group_Id");
            RenameIndex(table: "dbo.GroupAspNetRoles", name: "IX_GroupId", newName: "IX_Group_Id");
            RenameIndex(table: "dbo.GroupAspNetRoles", name: "IX_AspNetRoleId", newName: "IX_AspNetRole_Id");
            DropPrimaryKey("dbo.GroupAspNetRoles");
            AddColumn("dbo.Customers", "AspNetRole_Id", c => c.String(maxLength: 128));
            AddColumn("dbo.GroupOwners", "User_Id", c => c.String(maxLength: 128));
            AddColumn("dbo.Subscriptions", "SubscriptionPlan_Id", c => c.Guid());
            AddPrimaryKey("dbo.GroupAspNetRoles", new[] { "Group_Id", "AspNetRole_Id" });
            CreateIndex("dbo.AspNetUsers", "Id");
            CreateIndex("dbo.Customers", "AspNetRole_Id");
            CreateIndex("dbo.GroupOwners", "User_Id");
            CreateIndex("dbo.Subscriptions", "SubscriptionPlan_Id");
            AddForeignKey("dbo.Customers", "AspNetRole_Id", "dbo.AspNetRoles", "Id");
            AddForeignKey("dbo.CustomerRoles", "AspNetRoleId", "dbo.AspNetRoles", "Id", cascadeDelete: true);
            AddForeignKey("dbo.GroupRoles", "AspNetRoleId", "dbo.AspNetRoles", "Id", cascadeDelete: true);
            AddForeignKey("dbo.GroupOwners", "User_Id", "dbo.Users", "Id");
            AddForeignKey("dbo.GroupRoles", "GroupId", "dbo.Groups", "Id", cascadeDelete: true);
            AddForeignKey("dbo.Subscriptions", "SubscriptionPlan_Id", "dbo.SubscriptionPlans", "Id");
            AddForeignKey("dbo.CustomerRoles", "CustomerId", "dbo.Customers", "Id", cascadeDelete: true);
            DropTable("dbo.CustomerRoleMappings");
        }
        
        public override void Down()
        {
            CreateTable(
                "dbo.CustomerRoleMappings",
                c => new
                    {
                        AspNetRoleId = c.String(nullable: false, maxLength: 128),
                        CustomerId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => new { t.AspNetRoleId, t.CustomerId });
            
            DropForeignKey("dbo.CustomerRoles", "CustomerId", "dbo.Customers");
            DropForeignKey("dbo.Subscriptions", "SubscriptionPlan_Id", "dbo.SubscriptionPlans");
            DropForeignKey("dbo.GroupRoles", "GroupId", "dbo.Groups");
            DropForeignKey("dbo.GroupOwners", "User_Id", "dbo.Users");
            DropForeignKey("dbo.GroupRoles", "AspNetRoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.CustomerRoles", "AspNetRoleId", "dbo.AspNetRoles");
            DropForeignKey("dbo.Customers", "AspNetRole_Id", "dbo.AspNetRoles");
            DropIndex("dbo.Subscriptions", new[] { "SubscriptionPlan_Id" });
            DropIndex("dbo.GroupOwners", new[] { "User_Id" });
            DropIndex("dbo.Customers", new[] { "AspNetRole_Id" });
            DropIndex("dbo.AspNetUsers", new[] { "Id" });
            DropPrimaryKey("dbo.GroupAspNetRoles");
            DropColumn("dbo.Subscriptions", "SubscriptionPlan_Id");
            DropColumn("dbo.GroupOwners", "User_Id");
            DropColumn("dbo.Customers", "AspNetRole_Id");
            AddPrimaryKey("dbo.GroupAspNetRoles", new[] { "AspNetRoleId", "GroupId" });
            RenameIndex(table: "dbo.GroupAspNetRoles", name: "IX_AspNetRole_Id", newName: "IX_AspNetRoleId");
            RenameIndex(table: "dbo.GroupAspNetRoles", name: "IX_Group_Id", newName: "IX_GroupId");
            RenameColumn(table: "dbo.GroupAspNetRoles", name: "Group_Id", newName: "GroupId");
            RenameColumn(table: "dbo.GroupAspNetRoles", name: "AspNetRole_Id", newName: "AspNetRoleId");
            CreateIndex("dbo.CustomerRoleMappings", "CustomerId");
            CreateIndex("dbo.CustomerRoleMappings", "AspNetRoleId");
            CreateIndex("dbo.Subscriptions", "PlanId");
            CreateIndex("dbo.GroupOwners", "OwnerId");
            CreateIndex("dbo.Users", "Id");
            AddForeignKey("dbo.CustomerRoles", "CustomerId", "dbo.Customers", "Id");
            AddForeignKey("dbo.Subscriptions", "PlanId", "dbo.SubscriptionPlans", "Id");
            AddForeignKey("dbo.GroupRoles", "GroupId", "dbo.Groups", "Id");
            AddForeignKey("dbo.GroupOwners", "OwnerId", "dbo.Users", "Id", cascadeDelete: true);
            AddForeignKey("dbo.GroupRoles", "AspNetRoleId", "dbo.AspNetRoles", "Id");
            AddForeignKey("dbo.CustomerRoles", "AspNetRoleId", "dbo.AspNetRoles", "Id");
            AddForeignKey("dbo.CustomerRoleMappings", "CustomerId", "dbo.Customers", "Id", cascadeDelete: true);
            AddForeignKey("dbo.CustomerRoleMappings", "AspNetRoleId", "dbo.AspNetRoles", "Id", cascadeDelete: true);
            RenameTable(name: "dbo.GroupAspNetRoles", newName: "GroupRoleMappings");
        }
    }
}
