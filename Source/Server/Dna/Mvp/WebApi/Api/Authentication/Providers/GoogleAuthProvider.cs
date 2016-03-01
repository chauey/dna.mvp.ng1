namespace Dna.Mvp.WebApi.Api.Authentication.Providers
{
    using System.Security.Claims;
    using System.Threading.Tasks;

    using Microsoft.Owin.Security.Google;

    // read the external claims set by the external provider, 
    // those set of external claims will contain information about 
    // the authenticated user and we’re interested in the claim named “AccessToken”
    public class GoogleAuthProvider : IGoogleOAuth2AuthenticationProvider
    {
        public void ApplyRedirect(GoogleOAuth2ApplyRedirectContext context)
        {
            context.Response.Redirect(context.RedirectUri);
        }

        public Task Authenticated(GoogleOAuth2AuthenticatedContext context)
        {
            context.Identity.AddClaim(new Claim("ExternalAccessToken", context.AccessToken));
            return Task.FromResult<object>(null);
        }

        public Task ReturnEndpoint(GoogleOAuth2ReturnEndpointContext context)
        {
            return Task.FromResult<object>(null);
        }
    }
}