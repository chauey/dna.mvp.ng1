using Dna.Mvp.Data.Entities;
using Dna.Mvp.Data.Repository;
using Dna.Mvp.WebApi.Api.Authorization;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Dna.Mvp.Providers
{
    using Dna.Mvp.WebApi.Api.Authentication;
    using Dna.Mvp.WebApi.Api.Authentication.Entities;

    // Validating the Client Information
    public class SimpleAuthorizationServerProvider : OAuthAuthorizationServerProvider
    {
        private readonly IMvpRepository _baseRepository;
        private readonly ICurrentUserResolver _currentUserResolver;

        public SimpleAuthorizationServerProvider(IMvpRepository baseRepository, ICurrentUserResolver currentUserResolver)
        {
            this._baseRepository = baseRepository;
            this._currentUserResolver = currentUserResolver;
        }

        // http://bitoftech.net/2014/07/16/enable-oauth-refresh-tokens-angularjs-app-using-asp-net-web-api-2-owin/
        public override Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {
            string clientId = string.Empty;
            string clientSecret = string.Empty;
            Client client = null;

            // 1. Get the Client id and secret from the authorization header
            if (!context.TryGetBasicCredentials(out clientId, out clientSecret))
            {
                context.TryGetFormCredentials(out clientId, out clientSecret);
            }

            // 2. If the consumer didn’t set client information at all, so if we want to enforce 
            // setting the client id always then you need to invalidate the context
            if (context.ClientId == null)
            {
                //Remove the comments from the below line context.SetError, and invalidate context 
                //if you want to force sending clientId/secrects once obtain access tokens. 
                context.Validated();
                //context.SetError("invalid_clientId", "ClientId should be sent.");
                return Task.FromResult<object>(null);
            }

            // 3. After receiving the client id, check our database if the client is already registered with our back-end API, 
            using (AuthRepository _repo = new AuthRepository())
            {
                client = _repo.FindClient(context.ClientId);
            }

            // If it is not registered we’ll invalidate the context and reject the request.
            if (client == null)
            {
                context.SetError("invalid_clientId", string.Format("Client '{0}' is not registered in the system.", context.ClientId));
                return Task.FromResult<object>(null);
            }

            // 4. If the client is registered we need to check his application type, so if it was 
            // “JavaScript – Non Confidential” client, we’ll not check or ask for the secret. 
            // If it is Native – Confidential app,
            // then the client secret is mandatory and it will be validated against the secret stored in the database.
            if (client.ApplicationType == ApplicationTypes.NativeConfidential)
            {
                if (string.IsNullOrWhiteSpace(clientSecret))
                {
                    context.SetError("invalid_clientId", "Client secret should be sent.");
                    return Task.FromResult<object>(null);
                }
                else
                {
                    if (client.Secret != Helper.GetHash(clientSecret))
                    {
                        context.SetError("invalid_clientId", "Client secret is invalid.");
                        return Task.FromResult<object>(null);
                    }
                }
            }

            // 5. Check if the client is not active, invalidate the request
            if (!client.Active)
            {
                context.SetError("invalid_clientId", "Client is inactive.");
                return Task.FromResult<object>(null);
            }

            // 6. Store the client allowed origin and refresh token life time value on the Owin context 
            // so it will be available once we generate the refresh token and set its expiry life time.
            context.OwinContext.Set<string>("as:clientAllowedOrigin", client.AllowedOrigin);
            context.OwinContext.Set<string>("as:clientRefreshTokenLifeTime", client.RefreshTokenLifeTime.ToString());

            // 7. If all is valid we mark the context as valid context which means that client check has passed
            context.Validated();
            return Task.FromResult<object>(null);
        }

        // Validating the Resource Owner Credentials
        public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {
            // 1. Reading the allowed origin value for this client from the Owin context
            ////var allowedOrigin = context.OwinContext.Get<string>("as:clientAllowedOrigin");

            ////if (allowedOrigin == null) allowedOrigin = "*";

            ////// then we use this value to add the header “Access-Control-Allow-Origin” to Owin context response
            ////// (by doing this and for any JavaScript application we’ll prevent using the same client id 
            ////// to build another JavaScript application hosted on another domain)
            ////context.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] { allowedOrigin });
            context.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] { "*" });

            string currentCustomerId = string.Empty;

            // 2. Check the username/password for the resource owner if it is valid
            using (AuthRepository _repo = new AuthRepository())
            {
                IdentityUser user = await _repo.FindUser(context.UserName, context.Password);

                if (user == null)
                {
                    context.SetError("invalid_grant", "The user name or password is incorrect.");
                    return;
                }

                User userEntity = this._baseRepository.GetUsers().SingleOrDefault(u => u.Id == user.Id);
                if (userEntity != null)
                {
                    currentCustomerId = userEntity.CustomerId;
                }
            }

            // generate set of claims for this user along with authentication properties 
            // which contains the client id and userName
            var identity = new ClaimsIdentity(context.Options.AuthenticationType);
            identity.AddClaim(new Claim(ClaimTypes.Name, context.UserName));
            identity.AddClaim(new Claim("sub", context.UserName));
            identity.AddClaim(new Claim("role", "user"));
            identity.AddClaim(new Claim("customerId", currentCustomerId));

            var props = new AuthenticationProperties(new Dictionary<string, string>
                {
                    { 
                        "as:client_id", (context.ClientId == null) ? string.Empty : context.ClientId
                    },
                    { 
                        "userName", context.UserName
                    }
                });

            // 3. Access token will be generated behind the scenes when we call “context.Validated(ticket)”
            var ticket = new AuthenticationTicket(identity, props);
            context.Validated(ticket);
        }

        public override Task TokenEndpoint(OAuthTokenEndpointContext context)
        {
            foreach (KeyValuePair<string, string> property in context.Properties.Dictionary)
            {
                context.AdditionalResponseParameters.Add(property.Key, property.Value);
            }

            return Task.FromResult<object>(null);
        }

        // Issue new claims or updating existing claims and contain them 
        // into the new access token generated before sending it to the user
        public override Task GrantRefreshToken(OAuthGrantRefreshTokenContext context)
        {
            // 1. Read the client id value from the original ticket, 
            // this is the client id which get stored in the magical signed string
            var originalClient = context.Ticket.Properties.Dictionary["as:client_id"];
            var currentClient = context.ClientId;

            // Compare this client id against the client id sent with the request
            if (originalClient != currentClient)
            {
                // reject this request because we need to make sure that the refresh token used here 
                // is bound to the same client when it was generated
                context.SetError("invalid_clientId", "Refresh token is issued to a different clientId.");
                return Task.FromResult<object>(null);
            }

            // Change auth ticket for refresh token requests
            var newIdentity = new ClaimsIdentity(context.Ticket.Identity);
            newIdentity.AddClaim(new Claim("newClaim", "newValue"));

            // 2. Add new claims or remove existing claims
            var newTicket = new AuthenticationTicket(newIdentity, context.Ticket.Properties);
            // Generate new access token and return it in the response body
            context.Validated(newTicket);

            // 3. New refresh token is generated and returned 
            // in the response along with the new access token
            return Task.FromResult<object>(null);
        }
    }
}