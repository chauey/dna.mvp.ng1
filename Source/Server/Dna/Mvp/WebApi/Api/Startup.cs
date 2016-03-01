using Dna.Mvp.Data.Entities;
using Dna.Mvp.Data.Repository;
using Dna.Mvp.Data.Repository.Repositories;
using Dna.Mvp.Notifications;
using Dna.Mvp.Services;
using Dna.Mvp.WebApi.Api.Authentication.Formats;
using Dna.Mvp.WebApi.Api.Authentication.Providers;
using Dna.Mvp.WebApi.Api.Authorization;
using Dna.Mvp.WebApi.Api.Controllers;
using Dna.Mvp.WebApi.Api.Utilities;
using FluentValidation.WebApi;
using Microsoft.Owin;
using Microsoft.Owin.Hosting;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.DataHandler.Encoder;
using Microsoft.Owin.Security.Facebook;
using Microsoft.Owin.Security.Google;
using Microsoft.Owin.Security.Jwt;
using Microsoft.Owin.Security.MicrosoftAccount;
using Microsoft.Owin.Security.OAuth;
using Microsoft.Owin.Security.Twitter;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Owin;
using Owin.Security.Providers.LinkedIn;
using Owin.Security.Providers.Yahoo;
using Repository.Pattern.DataContext;
using Repository.Pattern.Ef6;
using Repository.Pattern.Ef6.Factories;
using Repository.Pattern.Repositories;
using Repository.Pattern.UnitOfWork;
using SimpleInjector;
using SimpleInjector.Integration.WebApi;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Filters;
using System.Web.OData.Builder;
using System.Web.OData.Extensions;

[assembly: OwinStartup(typeof(Dna.Mvp.WebApi.Api.Startup))]

namespace Dna.Mvp.WebApi.Api
{
    //Here is the once-per-application setup information
    public class Startup
    {
        private static readonly string _baseAddress = ConfigurationManager.AppSettings["BaseUrl"];
        private static Container _container;
        private readonly IUserService _userService;
        private Container _iocContainer;

        public Startup(IUserService userService)
        {
            _userService = userService;
        }

        public static OAuthBearerAuthenticationOptions OAuthBearerOptions { get; private set; }
        public static GoogleOAuth2AuthenticationOptions googleAuthOptions { get; private set; }
        public static FacebookAuthenticationOptions facebookAuthOptions { get; private set; }
        public static LinkedInAuthenticationOptions linkedinAuthOptions { get; private set; }
        public static MicrosoftAccountAuthenticationOptions microsoftAuthOptions { get; private set; }
        public static TwitterAuthenticationOptions twitterAuthOptions { get; private set; }
        public static YahooAuthenticationOptions yahooAuthOptions { get; private set; }

        public static void StartServer()
        {
            _container = new Container();
            _container.Register<IDataContextAsync, MvpContext>();
            _container.Register<IUnitOfWorkAsync, UnitOfWork>();
            _container.Register<IRepositoryProvider>(() => new RepositoryProvider(new RepositoryFactories()));
            _container.Register<ICurrentUserResolver, CurrentUserResolver>();
            _container.Register<INotificationProvider, NotificationProvider>();

            _container.Register<IRepositoryAsync<User>, Repository<User>>();
            _container.Register<IRepositoryAsync<AspNetUser>, Repository<AspNetUser>>();
            _container.Register<IRepositoryAsync<AccessControlListItem>, Repository<AccessControlListItem>>();
            _container.Register<IRepositoryAsync<DomainObject>, Repository<DomainObject>>();
            _container.Register<IRepositoryAsync<Permission>, Repository<Permission>>();
            _container.Register<IRepositoryAsync<AspNetRole>, Repository<AspNetRole>>();
            _container.Register<IRepositoryAsync<TypeOfType>, Repository<TypeOfType>>();
            //Service
            _container.Register<IUserService, UserService>();
            _container.Register<ITypeOfTypeService, TypeOfTypeService>();
            _container.Register<IMvpRepository, MvpRepository>();
            _container.Register<IDnaController, DnaController>();

            _container.Verify();

            var webApplication = WebApp.Start(_baseAddress);

            using (webApplication)
            {
                Console.Title = "Dna Host";
                Console.WriteLine("Dna Hosting Application");
                Console.WriteLine("----------------------------------------------------");
                Console.WriteLine("Start Time: {0} ", DateTime.Now.ToString("MM-dd-yyyy HH:m:ss"));
                Console.WriteLine("Running at URL {0}", _baseAddress);
                Console.WriteLine("");
                Console.WriteLine("Copyright {0}", DateTime.Today.Year);
                Console.ReadLine();
            }
        }

        public void Configuration(IAppBuilder app)
        {

            var config = new HttpConfiguration();
            RegisterCorsConfig(config);

            DisableCache(app);

            // Implement UnhandledExceptionFilter 
            config.Filters.Add(new UnhandledExceptionFilter());

            // Implement Formatter
            config.MessageHandlers.Add(new MethodOverrideHandler());

            ConfigureIoC(config); // Dependency Injection
            ConfigureOAuth(app); // OAuth

            // Comment out for CustomizeAttribute
            ConfigureAuth(app); // Authentication
            RegisterFilterProviders(config); // Authorization

            // Register WebApi (without OData)
            RegisterApiConfig(config);
            app.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);
            app.UseWebApi(config);

            // Register WebApi OData
            RegisterOdataConfig(config);

            //http://fluentvalidation.codeplex.com/
            FluentValidationModelValidatorProvider.Configure(config);
        }

        public void ConfigureOAuth(IAppBuilder app)
        {
            // Use a cookie to temporarily store information about a user logging in with a third party login provider
            app.UseExternalSignInCookie(Microsoft.AspNet.Identity.DefaultAuthenticationTypes.ExternalCookie);
            OAuthBearerOptions = new OAuthBearerAuthenticationOptions();


            // Config for Authorization Server
            OAuthAuthorizationServerOptions OAuthServerOptions = new OAuthAuthorizationServerOptions()
            {
                AllowInsecureHttp = true,
                TokenEndpointPath = new PathString("/token"),
                AccessTokenExpireTimeSpan = TimeSpan.FromMinutes(480),
                Provider = new CustomOAuthProvider(_container, new MvpRepository()),
                AccessTokenFormat = new CustomJwtFormat("http://localhost"),
                // RefreshTokenProvider = new SimpleRefreshTokenProvider()

            };

            // Config for Resource Server
            var issuer = "http://localhost";
            var audience = "86b6477804ce4ec8b3a17c775160b346";
            var secret = TextEncodings.Base64Url.Decode("4BP724M_er2aAPVklcHzl_tCruUOFCdzFEtiJmrB1lY");

            app.UseJwtBearerAuthentication(
                new JwtBearerAuthenticationOptions
                {
                    AuthenticationMode = AuthenticationMode.Active,
                    AllowedAudiences = new[] { audience },
                    IssuerSecurityTokenProviders = new IIssuerSecurityTokenProvider[]
                    {
                        new SymmetricKeyIssuerSecurityTokenProvider(issuer, secret)
                    }
                });

            // Token Generation
            app.UseOAuthAuthorizationServer(OAuthServerOptions);
            app.UseOAuthBearerAuthentication(OAuthBearerOptions);

            #region External Logins
            // Google 
            googleAuthOptions = new GoogleOAuth2AuthenticationOptions()
            {
                //ClientId = "474818352230-q5cn2bs8uit9idb0usj7u0stqq6g01k1.apps.googleusercontent.com",
                //ClientSecret = "4CPf1uaDhCXOyGLkMKJ9Qhps",
                ClientId = "474818352230-98ng0du6l7sg1d5gqoukbs25fn95hmgp.apps.googleusercontent.com",
                ClientSecret = "3_VTKJFQtPoExX0v1f_jWPtJ",
                Provider = new GoogleAuthProvider()
            };
            app.UseGoogleAuthentication(googleAuthOptions);

            // Facebook
            facebookAuthOptions = new FacebookAuthenticationOptions()
            {
                //AppId = "1477930152458479",
                //AppSecret = "3705b844f0bb59aa1136998942cc39ce",
                AppId = "834760529948191",
                AppSecret = "45257a38cf17f60e18ebbc2af14f30b2",
                Provider = new FacebookAuthProvider()
            };
            app.UseFacebookAuthentication(facebookAuthOptions);

            // LinkedIn
            linkedinAuthOptions = new LinkedInAuthenticationOptions()
            {
                ClientId = "75l8yxw4bnsg54",
                ClientSecret = "wwzNFtFBmnmNxfhP",
                Provider = new LinkedInAuthProvider()
            };
            app.UseLinkedInAuthentication(linkedinAuthOptions);

            // Microsoft
            microsoftAuthOptions = new MicrosoftAccountAuthenticationOptions()
            {
                ClientId = "000000004012BAAD",
                ClientSecret = "pGwrzDUr969SCiWa2y8LNLjZ1keRUa",
                Provider = new MicrosoftAuthProvider()
            };
            app.UseMicrosoftAccountAuthentication(microsoftAuthOptions);

            // Twitter
            twitterAuthOptions = new TwitterAuthenticationOptions()
            {
                ConsumerKey = "GCL91UYRo0m3LlYS2uxyvHp8g",
                ConsumerSecret = "ZXtLTZGOI2tSyjPaoTpEEs1TwyVQ4kWS4M2tYB6zarH4oz6HAO",
                Provider = new TwitterAuthProvider()
            };
            app.UseTwitterAuthentication(twitterAuthOptions);

            // Yahoo
            yahooAuthOptions = new YahooAuthenticationOptions()
            {
                ConsumerKey = "dj0yJmk9eVZ6akF3MUxhNEcyJmQ9WVdrOVkyNVdZV05tTnpZbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1kNw--",
                ConsumerSecret = "45d113e2791d4a8bc76cb6214a34bc87763734ca",
                Provider = new YahooAuthProvider()
            };
            app.UseYahooAuthentication(yahooAuthOptions);
            #endregion
        }

        /// <summary>
        ///     Dissables Cache by adding headers to response
        /// </summary>
        /// <param name="app">Owin AppBuilder</param>
        private void DisableCache(IAppBuilder app)
        {
            // No cache headers in response
            app.Use((context, next) =>
            {
                context.Response.Headers.Add(new KeyValuePair<string, string[]>("Pragma", new[] { "no-cache" }));
                context.Response.Headers.Add(new KeyValuePair<string, string[]>("Expires", new[] { "-1" }));
                context.Response.Headers.Add(new KeyValuePair<string, string[]>("Cache-Control",
                    new[] { "no-cache", "no-store", "must-revalidate" }));
                return next();
            });
        }

        public void ConfigureAuth(IAppBuilder app)
        {
            var OAuthServerOptions = new OAuthAuthorizationServerOptions
            {
                AllowInsecureHttp = true,
                TokenEndpointPath = new PathString("/login"),
                AccessTokenExpireTimeSpan = TimeSpan.FromMinutes(480),
                Provider = new CustomAuthorizationServerProvider(_container)
            };

            app.UseOAuthAuthorizationServer(OAuthServerOptions);
            app.UseOAuthBearerAuthentication(new OAuthBearerAuthenticationOptions());
        }

        public void ConfigureIoC(HttpConfiguration config)
        {
            _iocContainer = new Container();
            _iocContainer.RegisterWebApiRequest<IDataContextAsync, MvpContext>();
            _iocContainer.RegisterWebApiRequest<IUnitOfWorkAsync, UnitOfWork>();

            // Repositories
            _iocContainer.RegisterWebApiRequest<IRepositoryProvider>(() => new RepositoryProvider(new RepositoryFactories()));
            _iocContainer.RegisterWebApiRequest<IRepositoryAsync<User>, Repository<User>>();
            _iocContainer.RegisterWebApiRequest<IRepositoryAsync<AccessControlListItem>, Repository<AccessControlListItem>>();
            _iocContainer.RegisterWebApiRequest<IRepositoryAsync<DomainObject>, Repository<DomainObject>>();
            _iocContainer.RegisterWebApiRequest<IRepositoryAsync<Permission>, Repository<Permission>>();
            _iocContainer.RegisterWebApiRequest<IRepositoryAsync<AspNetRole>, Repository<AspNetRole>>();
            _iocContainer.RegisterWebApiRequest<IRepositoryAsync<AllDataType>, Repository<AllDataType>>();
            _iocContainer.RegisterWebApiRequest<IRepositoryAsync<Validation>, Repository<Validation>>();
            _iocContainer.RegisterWebApiRequest<IRepositoryAsync<AspNetUser>, Repository<AspNetUser>>();
            _iocContainer.RegisterWebApiRequest<IRepositoryAsync<TypeOfType>, Repository<TypeOfType>>();

            //Service
            _iocContainer.RegisterWebApiRequest<IUserService, UserService>();
            _iocContainer.RegisterWebApiRequest<IAccessControlListItemService, AccessControlListItemService>();
            _iocContainer.RegisterWebApiRequest<IDomainObjectService, DomainObjectService>();
            _iocContainer.RegisterWebApiRequest<IPermissionService, PermissionService>();
            _iocContainer.RegisterWebApiRequest<IAspNetRoleService, AspNetRoleService>();
            _iocContainer.RegisterWebApiRequest<IAllDataTypeService, AllDataTypeService>();
            _iocContainer.RegisterWebApiRequest<IValidationService, ValidationService>();
            _iocContainer.RegisterWebApiRequest<ITypeOfTypeService, TypeOfTypeService>();

            //Providers
            _iocContainer.RegisterWebApiRequest<IUploadUtilityProvider, UploadUtilityProvider>();
            _iocContainer.RegisterWebApiRequest<ICurrentUserResolver, CurrentUserResolver>();
            _iocContainer.RegisterWebApiRequest<INotificationProvider, NotificationProvider>();

            _iocContainer.RegisterWebApiRequest<IDnaController, DnaController>();


            _iocContainer.RegisterWebApiControllers(config);
            _iocContainer.Verify();
            config.DependencyResolver = new SimpleInjectorWebApiDependencyResolver(_iocContainer);
        }

        private static void RegisterCorsConfig(HttpConfiguration config)
        {
            var cors = new EnableCorsAttribute("*", "*", "*", "DataServiceVersion, MaxDataServiceVersion");
            cors.ExposedHeaders.Add("Content-Disposition");
            config.EnableCors(cors);
        }

        /// <summary>
        ///     Register WebApi (without OData) configuration with route
        /// </summary>
        /// <param name="config"></param>
        private static void RegisterApiConfig(HttpConfiguration config)
        {
            config.MapHttpAttributeRoutes();
            // config.Routes.MapHttpRoute(
            //    name: "DefaultApi1",
            //    routeTemplate: "api/{controller}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);
            
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional, action = RouteParameter.Optional }
            );

            config.Routes.MapHttpRoute(
                name: "CustomApi1",
                routeTemplate: "api/{controller}/{action}",
                defaults: new { id = RouteParameter.Optional, action = RouteParameter.Optional }
            );
      

            config.Formatters.Clear();
            config.Formatters.Add(new JsonMediaTypeFormatter());
            config.Formatters.JsonFormatter.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
            var jsonFormatter = config.Formatters.OfType<JsonMediaTypeFormatter>().First();
            jsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            //config.MapHttpAttributeRoutes();
        }

        private static void RegisterOdataConfig(HttpConfiguration config)
        {
            var builder = new ODataConventionModelBuilder();

            builder.Namespace = "Dna";
            builder.EntitySet<User>(typeof(User).Name);
            builder.EntitySet<AccessControlListItem>(typeof(AccessControlListItem).Name);
            builder.EntitySet<DomainObject>(typeof(DomainObject).Name);
            builder.EntitySet<Permission>(typeof(Permission).Name);
            builder.EntitySet<AspNetRole>(typeof(AspNetRole).Name);
            builder.EntitySet<AllDataType>(typeof(AllDataType).Name);
            builder.EntitySet<Validation>(typeof(Validation).Name);
            builder.EntitySet<TypeOfType>(typeof(TypeOfType).Name);
            builder.EntitySet<Space>(typeof(Space).Name);

            #region Config custom functions & their routes
            // Forgot password function that update user with new PasswordResetKey
            builder.EntityType<User>().Collection.Action("ForgotPassword").Returns<string>().Parameter<string>("Email");

            // Forgot password verify function with 2 params
            var forgotPasswordVerifyAction = builder.EntityType<User>().Collection.Action("ForgotPasswordVerify");
            forgotPasswordVerifyAction.Parameter<string>("Email");
            forgotPasswordVerifyAction.Parameter<string>("PasswordResetKey");
            forgotPasswordVerifyAction.Returns<string>();

            // Change password verify function with 3 params
            var changePasswordAction = builder.EntityType<User>().Collection.Action("ChangePassword");
            changePasswordAction.Parameter<string>("Email");
            changePasswordAction.Parameter<string>("NewPassword");
            changePasswordAction.Parameter<string>("PasswordResetKey");
            changePasswordAction.Returns<string>();

            // Register an unbound function api
            builder.Function("ForgotPassword").Returns<string>().Parameter<string>("Email");

            builder.EntityType<User>().Collection.Action("DeleteProfilePicture");

            // Change password manual function with 3 params
            var changePasswordManualAction = builder.EntityType<User>().Collection.Action("ChangePasswordManual");
            changePasswordManualAction.Parameter<string>("Password");
            changePasswordManualAction.Returns<string>();


            #endregion

            builder.EnableLowerCamelCase();

            config.MapODataServiceRoute("odata", null, builder.GetEdmModel());

            config.AddODataQueryFilter();
            config.EnsureInitialized();
        }

        private static void RegisterFilterProviders(HttpConfiguration config)
        {
            var providers = config.Services.GetFilterProviders().ToList();
            config.Filters.Add(new CustomAuthorizeAttribute());
            var defaultprovider = providers.First(p => p is ActionDescriptorFilterProvider);
            config.Services.Remove(typeof(IFilterProvider), defaultprovider);
        }

        public class MethodOverrideHandler : DelegatingHandler
        {
            protected override Task<HttpResponseMessage> SendAsync(
                HttpRequestMessage request, CancellationToken cancellationToken)
            {
                // request.Content.Headers.ContentType = MediaTypeHeaderValue.Parse("application/json;IEEE754Compatible=true");

                return base.SendAsync(request, cancellationToken);
            }
        }
    }
}