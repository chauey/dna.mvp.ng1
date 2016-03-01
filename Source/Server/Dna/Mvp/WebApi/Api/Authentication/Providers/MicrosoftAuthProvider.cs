
namespace Dna.Mvp.WebApi.Api.Authentication.Providers
{
    using Microsoft.Owin.Security.MicrosoftAccount;
    using System.Security.Claims;
    using System.Threading.Tasks;

    public class MicrosoftAuthProvider : MicrosoftAccountAuthenticationProvider
    {
        public Task Authenticated(MicrosoftAccountAuthenticatedContext context)
        {
            context.Identity.AddClaim(new Claim("ExternalAccessToken", context.AccessToken));
            return Task.FromResult<object>(null);
        }
    }
}