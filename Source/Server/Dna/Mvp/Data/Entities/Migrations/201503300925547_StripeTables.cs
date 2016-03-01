namespace Dna.Mvp.Data.Entities.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class StripeTables : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Customers",
                c => new
                    {
                        ID = c.String(nullable: false, maxLength: 128),
                        StripeID = c.String(nullable: false, maxLength: 50),
                        Deliquent = c.Boolean(nullable: false),
                        DefaultCardID = c.Guid(),
                        FirstName = c.String(maxLength: 35),
                        LastName = c.String(maxLength: 35),
                    })
                .PrimaryKey(t => t.ID)
                .ForeignKey("dbo.AspNetUsers", t => t.ID)
                .Index(t => t.ID);
            
            CreateTable(
                "dbo.Cards",
                c => new
                    {
                        ID = c.Guid(nullable: false),
                        StripeID = c.String(nullable: false, maxLength: 50),
                        StripeToken = c.String(nullable: false, maxLength: 50),
                        Fingerprint = c.String(maxLength: 50),
                        Last4 = c.String(maxLength: 4),
                        Brand = c.String(maxLength: 50),
                        Funding = c.String(maxLength: 10),
                        IsValid = c.Boolean(nullable: false),
                        CustomerID = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.ID)
                .ForeignKey("dbo.Customers", t => t.CustomerID)
                .Index(t => t.CustomerID);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Customers", "ID", "dbo.AspNetUsers");
            DropForeignKey("dbo.Cards", "CustomerID", "dbo.Customers");
            DropIndex("dbo.Cards", new[] { "CustomerID" });
            DropIndex("dbo.Customers", new[] { "ID" });
            DropTable("dbo.Cards");
            DropTable("dbo.Customers");
        }
    }
}
