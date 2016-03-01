namespace Dna.Mvp.Data.Entities.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class RemoveCreatedByRelationshipToUsersTable : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.Users", "CreateBy", "dbo.Users");
            DropIndex("dbo.Users", new[] { "CreateBy" });
            AddColumn("dbo.Users", "User1_UserID", c => c.Guid());
            CreateIndex("dbo.Users", "User1_UserID");
            AddForeignKey("dbo.Users", "User1_UserID", "dbo.Users", "UserID");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Users", "User1_UserID", "dbo.Users");
            DropIndex("dbo.Users", new[] { "User1_UserID" });
            DropColumn("dbo.Users", "User1_UserID");
            CreateIndex("dbo.Users", "CreateBy");
            AddForeignKey("dbo.Users", "CreateBy", "dbo.Users", "UserID");
        }
    }
}
