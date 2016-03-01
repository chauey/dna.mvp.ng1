namespace Dna.Mvp.Data.Entities.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class add_1n_for_User_Validation : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Validations", "UserId", c => c.String(maxLength: 128));
            CreateIndex("dbo.Validations", "UserId");
            AddForeignKey("dbo.Validations", "UserId", "dbo.Users", "Id");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Validations", "UserId", "dbo.Users");
            DropIndex("dbo.Validations", new[] { "UserId" });
            DropColumn("dbo.Validations", "UserId");
        }
    }
}
