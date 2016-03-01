using System.Data.Entity.Migrations;

namespace Dna.Mvp.Data.Entities.Migrations
{
    internal sealed class Configuration : DbMigrationsConfiguration<MvpDataContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(MvpDataContext context)
        {
            Seeding.Seed.DeleteAllData(context);
            Seeding.Seed.AddData(context);
        }
    }
}
