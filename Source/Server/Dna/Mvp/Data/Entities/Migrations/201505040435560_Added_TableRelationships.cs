namespace Dna.Mvp.Data.Entities.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Added_TableRelationships : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.TableRelationships",
                c => new
                    {
                        Id = c.Guid(nullable: false, identity: true),
                        Table1Name = c.String(nullable: false),
                        Table2Name = c.String(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.TableRelationships");
        }
    }
}
