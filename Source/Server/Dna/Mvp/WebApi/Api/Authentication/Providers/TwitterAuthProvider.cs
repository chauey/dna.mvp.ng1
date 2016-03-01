
namespace Dna.Mvp.WebApi.Api.Authentication.Providers
{
    using Microsoft.Owin.Security.Twitter;
    using System.Security.Claims;
    using System.Threading.Tasks;

    public class TwitterAuthProvider : TwitterAuthenticationProvider
    {
        public Task Authenticated(TwitterAuthenticatedContext context)
        {
            context.Identity.AddClaim(new Claim("ExternalAccessToken", context.AccessToken));
            return Task.FromResult<object>(null);
        }
    }
}