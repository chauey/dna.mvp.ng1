using Microsoft.AspNet.Identity.EntityFramework;
using System.Data.Entity;

namespace Dna.Mvp.WebApi.Api.Authentication
{
    using Dna.Mvp.WebApi.Api.Authentication.Entities;

    public class AuthContext : IdentityDbContext<IdentityUser>
    {
        // Database context class which will be responsible to 
        // communicate with our database
        public AuthContext()
            : base("MvpContext")
        {
        }

        // Make these entities available on the DbContext
        public DbSet<Client> Clients { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
    }
}