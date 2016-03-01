using Dna.Mvp.Data.Entities;
using Dna.Mvp.Data.Repository;
using Dna.Mvp.Services;
using Dna.Mvp.WebApi.Api.Authentication.Models;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json;
using SimpleInjector;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Dna.Mvp.WebApi.Api.Authentication.Providers
{
    public class CustomOAuthProvider : OAuthAuthorizationServerProvider
    {
        private IMvpRepository _repository;
        private Container _container;

        public CustomOAuthProvider(Container container, IMvpRepository repository)
        {
            this._container = container;
            this._repository = repository;
        }

        public override Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {
            string clientId = string.Empty;
            string clientSecret = string.Empty;
            string symmetricKeyAsBase64 = string.Empty;

            if (!context.TryGetBasicCredentials(out clientId, out clientSecret))
            {
                context.TryGetFormCredentials(out clientId, out clientSecret);
            }

            if (context.ClientId == null)
            {
                context.SetError("invalid_clientId", "client_Id is not set");
                return Task.FromResult<object>(null);
            }

            var audience = AudiencesStore.FindAudience(context.ClientId);

            if (audience == null)
            {
                context.SetError("invalid_clientId", string.Format("Invalid client_id '{0}'", context.ClientId));
                return Task.FromResult<object>(null);
            }

            context.Validated();
            return Task.FromResult<object>(null);
        }

        public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {

            context.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] { "*" });

            var identity = new ClaimsIdentity("JWT");
            IdentityUser identityUser;
            // Check user here
            using (AuthRepository _repo = new AuthRepository())
            {
                identityUser = await _repo.FindUser(context.UserName, context.Password);
                if (identityUser == null)
                {
                    context.SetError("invalid_grant", "The user name or password is incorrect.");
                    return;
                }

                identity.AddClaim(new Claim("userId", identityUser.Id));
                identity.AddClaim(new Claim(ClaimTypes.Name, context.UserName));
                identity.AddClaim(new Claim("sub", context.UserName));
                //identity.AddClaim(new Claim(ClaimTypes.Role, "Doctor"));

                ParallelOptions parallelOption = new ParallelOptions();
                parallelOption.MaxDegreeOfParallelism = Environment.ProcessorCount;
                Parallel.ForEach(identityUser.Roles, parallelOption,
                    (role) =>
                    {
                        try
                        {
                            _repo.FindRole(role.RoleId).ContinueWith(
                                (task) =>
                                {
                                    IdentityRole r = task.Result;
                                    identity.AddClaim(new Claim(ClaimTypes.Role, r.Name));
                                });
                        }
                        catch (Exception e)
                        { }
                    });
            }

            //if (context.UserName == context.Password)
            //{
            //    context.SetError("invalid_grant", "The user name or password is incorrect");
            //    //return;
            //    return Task.FromResult<object>(null);
            //}

            try
            {
                var userService = this._container.GetInstance<IUserService>();
                User user = userService.GetUserRefByAspNetUser(context.UserName);

                AuthenticationProperties properties = CreateProperties(user, context.ClientId);
                AuthenticationTicket ticket = new AuthenticationTicket(identity, properties);

                context.Validated(ticket);
                return;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }


        public AuthenticationProperties CreateProperties(User user, string clientId)
        {
            IDictionary<string, string> data = new Dictionary<string, string>();

            if (user != null)
            {
                data.Add("user",
                        JsonConvert.SerializeObject(new
                        {
                            email = user.Email,
                            firstName = user.FirstName,
                            lastName = user.LastName,
                            id = user.Id
                        }));
            }

            data.Add("audience", (clientId == null) ? string.Empty : clientId);

            // Add more properties here as needed

            return new AuthenticationProperties(data);
        }

    }
}