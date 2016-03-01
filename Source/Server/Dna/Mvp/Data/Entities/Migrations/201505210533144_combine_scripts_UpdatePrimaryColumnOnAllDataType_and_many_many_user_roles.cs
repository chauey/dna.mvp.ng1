namespace Dna.Mvp.Data.Entities.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class combine_scripts_UpdatePrimaryColumnOnAllDataType_and_many_many_user_roles : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.UserCustomers", "CustomerID", "dbo.Customers");
            DropForeignKey("dbo.UserCustomers", "UserID", "dbo.Users");
            DropIndex("dbo.UserCustomers", new[] { "CustomerID" });
            DropIndex("dbo.UserCustomers", new[] { "UserID" });
            DropPrimaryKey("dbo.AllDataTypes");
            AddColumn("dbo.AllDataTypes", "Id", c => c.Guid(nullable: false));
            AddPrimaryKey("dbo.AllDataTypes", "Id");
            DropColumn("dbo.AllDataTypes", "AllDataTypeID");
            DropTable("dbo.UserCustomers");
        }
        
        public override void Down()
        {
            CreateTable(
                "dbo.UserCustomers",
                c => new
                    {
                        CustomerID = c.String(nullable: false, maxLength: 128),
                        UserID = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => new { t.CustomerID, t.UserID });
            
            AddColumn("dbo.AllDataTypes", "AllDataTypeID", c => c.Guid(nullable: false));
            DropPrimaryKey("dbo.AllDataTypes");
            DropColumn("dbo.AllDataTypes", "Id");
            AddPrimaryKey("dbo.AllDataTypes", "AllDataTypeID");
            CreateIndex("dbo.UserCustomers", "UserID");
            CreateIndex("dbo.UserCustomers", "CustomerID");
            AddForeignKey("dbo.UserCustomers", "UserID", "dbo.Users", "Id", cascadeDelete: true);
            AddForeignKey("dbo.UserCustomers", "CustomerID", "dbo.Customers", "Id", cascadeDelete: true);
        }
    }
}
