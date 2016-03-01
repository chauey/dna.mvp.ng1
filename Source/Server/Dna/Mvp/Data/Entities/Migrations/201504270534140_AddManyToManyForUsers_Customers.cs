namespace Dna.Mvp.Data.Entities.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddManyToManyForUsers_Customers : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.Customers", "ID", "dbo.AspNetUsers");
            DropIndex("dbo.Customers", new[] { "ID" });
            CreateTable(
                "dbo.UserCustomers",
                c => new
                    {
                        CustomerID = c.String(nullable: false, maxLength: 128),
                        UserID = c.Guid(nullable: false),
                    })
                .PrimaryKey(t => new { t.CustomerID, t.UserID })
                .ForeignKey("dbo.Customers", t => t.CustomerID, cascadeDelete: true)
                .ForeignKey("dbo.Users", t => t.UserID, cascadeDelete: true)
                .Index(t => t.CustomerID)
                .Index(t => t.UserID);
            
            DropColumn("dbo.Users", "CustomerID");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Users", "CustomerID", c => c.String());
            DropForeignKey("dbo.UserCustomers", "UserID", "dbo.Users");
            DropForeignKey("dbo.UserCustomers", "CustomerID", "dbo.Customers");
            DropIndex("dbo.UserCustomers", new[] { "UserID" });
            DropIndex("dbo.UserCustomers", new[] { "CustomerID" });
            DropTable("dbo.UserCustomers");
            CreateIndex("dbo.Customers", "ID");
            AddForeignKey("dbo.Customers", "ID", "dbo.AspNetUsers", "Id");
        }
    }
}
