namespace Dna.Mvp.Data.Entities.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ChangeStringLengthOfAllowedOrigin : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Clients", "AllowedOrigin", c => c.String(maxLength: 200));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Clients", "AllowedOrigin", c => c.String(maxLength: 100));
        }
    }
}
