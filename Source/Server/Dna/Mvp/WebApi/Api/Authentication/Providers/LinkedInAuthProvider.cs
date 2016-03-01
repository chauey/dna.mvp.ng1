namespace Dna.Mvp.WebApi.Api.Authentication.Providers
{
    using System.Security.Claims;
    using System.Threading.Tasks;


    using Owin.Security.Providers.LinkedIn;

    public class LinkedInAuthProvider : ILinkedInAuthenticationProvider
    {
        public Task Authenticated(LinkedInAuthenticatedContext context)
        {
            context.Identity.AddClaim(new Claim("ExternalAccessToken", context.AccessToken));
            return Task.FromResult<object>(null);
        }

        public Task ReturnEndpoint(LinkedInReturnEndpointContext context)
        {
            return Task.FromResult<object>(null);
        }
    }
}