using Dna.Mvp.Services;
using Microsoft.Owin.Security.OAuth;
using SimpleInjector;
using System.Threading.Tasks;

namespace Dna.Mvp.WebApi.Api.Authorization
{
    public class CustomAuthorizationServerProvider : OAuthAuthorizationServerProvider
    {
        private readonly Container _container;
        private ICurrentUserResolver _currentUserResolver;
        private IUserService _userService;

        public CustomAuthorizationServerProvider(Container container)
        {
            _container = container;
            //_userService = userService;
        }

        public override async Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {
            // for now we allow all client apps to be validated.
            // we should do some sort of shared secret key authentication
            // to validate the client app
            context.Validated();
        }

        //public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        //{
        //    try
        //    {
        //        _currentUserResolver = _container.GetInstance<ICurrentUserResolver>();
        //        _userService = _container.GetInstance<IUserService>();

        //        // NOT SURE THIS IS NEEDED BECAUSE WE DO THIS ELSEWHERE
        //        context.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] {"*"});

        //        // get user and include groups
        //        var user = _userService
        //            .Query(x => x.Email == context.UserName)
        //            .Select().SingleOrDefault();

        //        //if (user == null || !_userService.IsValidPassword(user, context.Password))
        //        //{
        //        //    context.SetError("invalid_grant", "Incorrect username or password");
        //        //    return;
        //        //}

        //        //if (user.IsLockedOut)
        //        //{
        //        //    context.SetError("invalid_grant", "Account is locked");
        //        //    return;
        //        //}

        //        var identity = BuildClaimsIdentity(user, context.Options.AuthenticationType);

        //        var properties = CreateProperties(user);
        //        var token = new AuthenticationTicket(identity, properties);
               
        //        context.Validated(token);
        //    }
        //    catch (Exception ex)
        //    {
                
        //    }
        //}

        //public AuthenticationProperties CreateProperties(User user)
        //{
        //    var permissions = _userService.GetPermissionsByUser(user);

        //    IDictionary<string, string> data = new Dictionary<string, string>();
        //    data.Add("user",
        //        JsonConvert.SerializeObject(new
        //        {
        //            systemAccountId = user.SystemAccountId,
        //            email = user.Email,
        //            firstName = user.FirstName,
        //            lastName = user.LastName,
        //            fullName = user.FullName,
        //            id = user.Id
        //        }));
        //    data.Add("permissions",
        //        JsonConvert.SerializeObject(permissions,
        //            new JsonSerializerSettings {ContractResolver = new CamelCasePropertyNamesContractResolver()}));
        //    data.Add("systemAccount", JsonConvert.SerializeObject(new
        //    {
        //        companyName = user.SystemAccount.CompanyName,
        //        isCarrier = user.SystemAccount.AccountType == SystemAccount.SystemAccountType.Carrier,
        //        isAgency = user.SystemAccount.AccountType == SystemAccount.SystemAccountType.Agency,
        //        isMGA = user.SystemAccount.AccountType == SystemAccount.SystemAccountType.MGA
        //    }));
        //    return new AuthenticationProperties(data);
        //}

        public override async Task TokenEndpoint(OAuthTokenEndpointContext context)
        {
            // re-write additional parameters to be placed in token
            foreach (var property in context.Properties.Dictionary)
                context.AdditionalResponseParameters.Add(property.Key, property.Value);
        }

        //public ClaimsIdentity BuildClaimsIdentity(User user, string authenticationType)
        //{
        //    var userPermissions = _userService.GetPermissionsByUser(user);
        //    return _currentUserResolver.BuildClaimsIdentity(user, userPermissions, authenticationType);
        //}
    }
}