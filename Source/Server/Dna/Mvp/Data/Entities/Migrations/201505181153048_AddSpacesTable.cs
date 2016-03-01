namespace Dna.Mvp.Data.Entities.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddSpacesTable : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Spaces",
                c => new
                    {
                        SpaceID = c.Guid(nullable: false),
                        SpaceName = c.String(nullable: false, maxLength: 100),
                        PayerId = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.SpaceID)
                .ForeignKey("dbo.Users", t => t.PayerId)
                .Index(t => t.PayerId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Spaces", "PayerId", "dbo.Users");
            DropIndex("dbo.Spaces", new[] { "PayerId" });
            DropTable("dbo.Spaces");
        }
    }
}
