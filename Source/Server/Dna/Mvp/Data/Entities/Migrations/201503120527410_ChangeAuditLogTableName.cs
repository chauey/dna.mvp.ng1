namespace Dna.Mvp.Data.Entities.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ChangeAuditLogTableName : DbMigration
    {
        public override void Up()
        {
            RenameTable(name: "dbo.AuditLog", newName: "AuditLogs");
        }
        
        public override void Down()
        {
            RenameTable(name: "dbo.AuditLogs", newName: "AuditLog");
        }
    }
}
