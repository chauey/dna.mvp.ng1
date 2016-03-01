
namespace Dna.Mvp.WebApi.Api.Authentication.Providers
{
    using Owin.Security.Providers.Yahoo;
    using System.Security.Claims;
    using System.Threading.Tasks;

    public class YahooAuthProvider : YahooAuthenticationProvider
    {
        public Task Authenticated(YahooAuthenticatedContext context)
        {
            context.Identity.AddClaim(new Claim("ExternalAccessToken", context.AccessToken));
            return Task.FromResult<object>(null);
        }
    }
}