using Dna.Mvp.Data.Entities;
using Dna.Mvp.Data.Repository;
using Dna.Mvp.Data.Repository.Repositories;
using Dna.Mvp.Results;
using Dna.Mvp.Web.Models;
using Dna.Mvp.WebApi.Api.Authentication;
using Dna.Mvp.WebApi.Api.Helpers;
using Dna.Mvp.WebApi.Api.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.DataProtection;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json.Linq;
using SendGrid;
using Stripe;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Results;

namespace Dna.Mvp.WebApi.Api.Controllers
{
    //[RequireHttps]
    [RoutePrefix("api/Account")]
    public class AccountController : ApiController
    {
        private const string FreePlanID = "669E2847-FD1B-4F07-B202-2B018259F7F0";
        private static readonly string StripeApiSecretKey = ConfigurationManager.AppSettings["StripeApiSecretKey"];
        private readonly IMvpRepository _baseRepository;
        private AuthRepository _repo = null;

        private IAuthenticationManager Authentication
        {
            get { return Request.GetOwinContext().Authentication; }
        }

        private AuthContext _ctx { get; set; }

        private UserManager<IdentityUser> _userManager { get; set; }

        public AccountController()
        {
            this._baseRepository = new MvpRepository();
            _repo = new AuthRepository();
            _ctx = new AuthContext();
            _userManager = new UserManager<IdentityUser>(new UserStore<IdentityUser>(_ctx));

            var provider = new DpapiDataProtectionProvider();
            _userManager.UserTokenProvider = new DataProtectorTokenProvider<IdentityUser>(provider.Create("ConfirmationToken"))
            {
                TokenLifespan = TimeSpan.FromHours(3)
            };
        }

        // POST api/Account/Register
        [AllowAnonymous]
        [Route("Register")]
        public async Task<IHttpActionResult> Register(AccountBindingModel registerBindingModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityResult result = await _repo.RegisterUser(registerBindingModel);

            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }

            #region [20150312 Dzung] Register and create Stripe Customer with free plan

            // TODO: Add FirstName and LastName when registration later...
            StripeCustomerCreateOptions customerCreateOptions = new StripeCustomerCreateOptions
            {
                Email = registerBindingModel.Email,
                PlanId = FreePlanID // create new Customer with Free plan
            };

            StripeCustomer customer;

            try
            {
                StripeCustomerService customerService = new StripeCustomerService(StripeApiSecretKey);
                customer = customerService.Create(customerCreateOptions);

                var user = await _repo.FindUser(registerBindingModel.UserName, registerBindingModel.Password);

                Customer customerData = new Customer
                {
                    Id = user.Id,
                    StripeId = customer.Id,
                    Deliquent = customer.Delinquent
                };

                this._baseRepository.AddCustomer(customerData);
            }
            catch (Exception ex)
            {
                Elmah.ErrorSignal.FromCurrentContext().Raise(ex);
            }

            #endregion

            return Ok();
        }

                // POST api/Account/ForgotPassword
        [AllowAnonymous]
        [Route("ForgotPassword")]
        public async Task<IHttpActionResult> ForgotPassword(ForgotPasswordBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityUser user = await _userManager.FindByEmailAsync(model.EmailAddress);
            if (user == null || !(await _userManager.IsEmailConfirmedAsync(user.Id)))
            {
                // Don't reveal that the user does not exist or is not confirmed
                return NotFound();
            }

            System.Web.Mvc.UrlHelper _url = new System.Web.Mvc.UrlHelper();
            string code =  await _userManager.GeneratePasswordResetTokenAsync(user.Id);
                        
            //var callbackUrl = Url.Link("ForgotPassword", "Account", 
            //    new { UserId = user.Id, code = code }, protocol: Request.Url.Scheme);
            var callbackUrl = new Object();
            try
            {
                string feature = "resetPassword";
                string userName = user.UserName;
                // string token = HttpUtility.UrlEncode(code);

                // Replace "/" char in token string to avoid route issue
                //string token = code.Replace("/", "=DNA=");
                callbackUrl = String.Format("http://localhost:2371/#/{0}?userId={1}&token={2}", feature, user.Id, code);
                //callbackUrl = Url.Link("ForgotPassword",
                //new { UserId = user.Id, code = code });
            }
            catch (Exception e)
            { 
            }

            //await _userManager.SendEmailAsync(user.Id, "Reset Password",
            //"Please reset your password by clicking here: <a href=\"" + callbackUrl + "\">link</a>");
            try
            {
                string _subject = "Reset Password";
                string _body = "Please reset your password by clicking here: <a href=\"" + callbackUrl + "\">link</a>";
                string _recipient = user.Email;

                // Create the email object first, then add the properties.
                var mail = new SendGridMessage();

                // Add the message properties.
                mail.From = new MailAddress("azure_e858183b2be9b9214845a2d87e7603b1@azure.com", "DNA");
                                
                mail.AddTo(user.Email);

                mail.Subject = _subject;

                //Add the HTML and Text bodies
                mail.Html = _body;
                mail.Text = _body;

                var credential = new NetworkCredential(
                    ConfigurationManager.AppSettings["mailAccount"],
                    ConfigurationManager.AppSettings["mailPassword"]
                    );

                // Create a Web transport for sending email.
                var transportWeb = new SendGrid.Web(credential);

                // Send the email.
                if (transportWeb != null)
                {
                    try
                    {
                        await transportWeb.DeliverAsync(mail);
                    }
                    catch (Exception e)
                    { 
                    }
                    
                }                
            }
            catch (Exception ex)
            {
 
            }

            //return View("ForgotPasswordConfirmation");

            //IHttpActionResult errorResult = GetErrorResult(result);
            //if (errorResult != null)
            //{
            //    return errorResult;
            //}

            return Ok();
        }

        [AllowAnonymous]
        [Route("ResetPassword")]
        public async Task<IHttpActionResult> ResetPassword(ResetPasswordBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityUser user = await _userManager.FindByIdAsync(model.UserId);

            // model.ResetPasswordToken = HttpUtility.UrlEncode(model.ResetPasswordToken);

            // TODO: Current code is not working, not sure if Identity Token works with WebAPI or only works with MVC
            IdentityResult result = await _userManager.ResetPasswordAsync(
                               user.Id, model.ResetPasswordToken, model.NewPassword);

            IHttpActionResult errorResult = GetErrorResult(result);
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok();
        }

        #region External Logins

        // GET api/Account/ExternalLogin
        [OverrideAuthentication]
        // a) Ignore bearer tokens, and it can be accessed if there is external cookie
        // set by external authority (Facebook or Google) or can be accessed anonymously
        [HostAuthentication(DefaultAuthenticationTypes.ExternalCookie)]
        [AllowAnonymous]
        // This end point will be called twice during the authentication, first call will be anonymously
        // and the second time will be once the external cookie is set by the external provider
        [Route("ExternalLogin", Name = "ExternalLogin")]
        public async Task<IHttpActionResult> GetExternalLogin(string provider, string error = null)
        {
            string redirectUri = string.Empty;

            if (error != null)
            {
                return BadRequest(Uri.EscapeDataString(error));
            }

            // b) Now the code flow will check if the user has been authenticated (External cookie has been set),
            // if it is not the case then ChallengeResult will be called again
            if (!User.Identity.IsAuthenticated)
            {
                return new ChallengeResult(provider, this);
            }

            // c) Validate that client and redirect URI which is set by AngularJS application is valid
            // and this client is configured to allow redirect for this URI, so we do not want to end allowing
            // redirection to any URI set by a caller application which will open security threat.
            // To do so we need to add a private helper function named “ValidateClientAndRedirectUri”
            var redirectUriValidationResult = ValidateClientAndRedirectUri(this.Request, ref redirectUri);

            if (!string.IsNullOrWhiteSpace(redirectUriValidationResult))
            {
                return BadRequest(redirectUriValidationResult);
            }

            // d) Get the external login data along with the “ExternalAccessToken” which has been set
            // by the external provider, so we need to add private class named “ExternalLoginData”
            ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

            if (externalLogin == null)
            {
                return InternalServerError();
            }

            if (externalLogin.LoginProvider != provider)
            {
                Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);
                return new ChallengeResult(provider, this);
            }

            // e) Then we need to check if this social login (external user id with external provider) is
            // already linked to local database account or this is first time to authenticate,
            // based on this we are setting flag “hasRegistered” which will be returned to the AngularJS application
            IdentityUser user = await _repo.FindAsync(new UserLoginInfo(externalLogin.LoginProvider, externalLogin.ProviderKey));

            bool hasRegistered = user != null;

            // f) Issue a 302 redirect to the “redirect_uri” set by the client application along with 4 values
            // (“external_access_token”, “provider”, “hasLocalAccount”, “external_user_name”),
            // those values will be added as URL hash fragment not as query string so they
            // can be accessed by JS code only running on the return_uri page
            redirectUri = string.Format("{0}#external_access_token={1}&provider={2}&haslocalaccount={3}&external_user_name={4}",
                                            redirectUri,
                                            externalLogin.ExternalAccessToken,
                                            externalLogin.LoginProvider,
                                            hasRegistered.ToString(),
                                            externalLogin.UserName);

            return Redirect(redirectUri);
        }

        // POST api/Account/RegisterExternal
        [AllowAnonymous]
        [Route("RegisterExternal")]
        public async Task<IHttpActionResult> RegisterExternal(RegisterExternalBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var verifiedAccessToken = await VerifyExternalAccessToken(model.Provider, model.ExternalAccessToken);
            if (verifiedAccessToken == null)
            {
                return BadRequest("Invalid Provider or External Access Token");
            }

            IdentityUser user = await _repo.FindAsync(new UserLoginInfo(model.Provider, verifiedAccessToken.user_id));

            bool hasRegistered = user != null;

            if (hasRegistered)
            {
                return BadRequest("External user is already registered");
            }

            user = new IdentityUser() { UserName = model.UserName };

            IdentityResult result = await _repo.CreateAsync(user);
            if (!result.Succeeded)
            {
                return GetErrorResult(result);
            }

            var info = new ExternalLoginInfo()
            {
                DefaultUserName = model.UserName,
                Login = new UserLoginInfo(model.Provider, verifiedAccessToken.user_id)
            };

            result = await _repo.AddLoginAsync(user.Id, info.Login);
            if (!result.Succeeded)
            {
                return GetErrorResult(result);
            }

            // Generate access token response
            var accessTokenResponse = GenerateLocalAccessTokenResponse(model.UserName);

            return Ok(accessTokenResponse);
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("ObtainLocalAccessToken")]
        public async Task<IHttpActionResult> ObtainLocalAccessToken(string provider, string externalAccessToken)
        {
            if (string.IsNullOrWhiteSpace(provider) || string.IsNullOrWhiteSpace(externalAccessToken))
            {
                return BadRequest("Provider or external access token is not sent");
            }

            var verifiedAccessToken = await VerifyExternalAccessToken(provider, externalAccessToken);
            if (verifiedAccessToken == null)
            {
                return BadRequest("Invalid Provider or External Access Token");
            }

            IdentityUser user = await _repo.FindAsync(new UserLoginInfo(provider, verifiedAccessToken.user_id));

            bool hasRegistered = user != null;

            if (!hasRegistered)
            {
                return BadRequest("External user is not registered");
            }

            // Generate access token response
            var accessTokenResponse = GenerateLocalAccessTokenResponse(user.UserName);

            return Ok(accessTokenResponse);
        }

        #endregion External Logins

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _repo.Dispose();
            }

            base.Dispose(disposing);
        }

        #region Helpers

        private IHttpActionResult GetErrorResult(IdentityResult result)
        {
            if (result == null)
            {
                return InternalServerError();
            }

            if (!result.Succeeded)
            {
                if (result.Errors != null)
                {
                    foreach (string error in result.Errors)
                    {
                        ModelState.AddModelError("", error);
                    }
                }

                if (ModelState.IsValid)
                {
                    // No ModelState errors are available to send, so just return an empty BadRequest.
                    return BadRequest();
                }

                return BadRequest(ModelState);
            }

            return null;
        }

        private IHttpActionResult GetErrorResult(Exception error)
        {
            if (error == null)
            {
                return InternalServerError();
            }

            HttpResponseMessage httpErrorMessage = new HttpResponseMessage()
            {
                StatusCode = HttpStatusCode.InternalServerError,
                Content = new StringContent(error.Message)
            };
            return new ResponseMessageResult(httpErrorMessage);
        }

        // Validate that client and redirectURI which is set by AngularJS application is valid
        // and this client is configured to allow redirect for this URI
        private string ValidateClientAndRedirectUri(HttpRequestMessage request, ref string redirectUriOutput)
        {
            Uri redirectUri;

            var redirectUriString = GetQueryString(Request, "redirect_uri");

            if (string.IsNullOrWhiteSpace(redirectUriString))
            {
                return "redirect_uri is required";
            }

            bool validUri = Uri.TryCreate(redirectUriString, UriKind.Absolute, out redirectUri);

            if (!validUri)
            {
                return "redirect_uri is invalid";
            }

            var clientId = GetQueryString(Request, "client_id");

            if (string.IsNullOrWhiteSpace(clientId))
            {
                return "client_Id is required";
            }

            var client = _repo.FindClient(clientId);

            if (client == null)
            {
                return string.Format("Client_id '{0}' is not registered in the system.", clientId);
            }

            // check all AllowedOrigin
            string[] allowOrigin = client.AllowedOrigin.Split(',');
            if (!allowOrigin.ToList().Any(x => string.Equals(
                    x,
                    redirectUri.GetLeftPart(UriPartial.Authority),
                    StringComparison.OrdinalIgnoreCase)))
            {
                return string.Format("The given URL is not allowed by Client_id '{0}' configuration.", clientId);
            }

            redirectUriOutput = redirectUri.AbsoluteUri;

            return string.Empty;
        }

        private string GetQueryString(HttpRequestMessage request, string key)
        {
            var queryStrings = request.GetQueryNameValuePairs();

            if (queryStrings == null) return null;

            var match = queryStrings.FirstOrDefault(keyValue => string.Compare(keyValue.Key, key, true) == 0);

            if (string.IsNullOrEmpty(match.Value)) return null;

            return match.Value;
        }

        // Get and return the external login data along with the “ExternalAccessToken”
        // which has been set by the external provider
        private class ExternalLoginData
        {
            public string LoginProvider { get; set; }

            public string ProviderKey { get; set; }

            public string UserName { get; set; }

            public string ExternalAccessToken { get; set; }

            public static ExternalLoginData FromIdentity(ClaimsIdentity identity)
            {
                if (identity == null)
                {
                    return null;
                }

                Claim providerKeyClaim = identity.FindFirst(ClaimTypes.NameIdentifier);

                if (providerKeyClaim == null || String.IsNullOrEmpty(providerKeyClaim.Issuer) || String.IsNullOrEmpty(providerKeyClaim.Value))
                {
                    return null;
                }

                if (providerKeyClaim.Issuer == ClaimsIdentity.DefaultIssuer)
                {
                    return null;
                }

                return new ExternalLoginData
                {
                    LoginProvider = providerKeyClaim.Issuer,
                    ProviderKey = providerKeyClaim.Value,
                    UserName = identity.FindFirstValue(ClaimTypes.Name),
                    ExternalAccessToken = identity.FindFirstValue("ExternalAccessToken"),
                };
            }
        }

        private async Task<ParsedExternalAccessToken> VerifyExternalAccessToken(string provider, string accessToken)
        {
            ParsedExternalAccessToken parsedToken = null;

            var verifyTokenEndPoint = "";
            var appToken = "";

            if (provider == "Facebook")
            {
                // You can get it from here: https://developers.facebook.com/tools/accesstoken/
                // More about debug_token here: http://stackoverflow.com/questions/16641083/how-does-one-get-the-app-access-token-for-debug-token-inspection-on-facebook

                //var appToken = "1477930152458479|uIzYBw0JqhfE89q7oE7WJv2KdSQ";
                appToken = "834760529948191|45257a38cf17f60e18ebbc2af14f30b2";
                verifyTokenEndPoint = string.Format("https://graph.facebook.com/debug_token?input_token={0}&access_token={1}", accessToken, appToken);
            }
            else if (provider == "Google")
            {
                appToken = "474818352230-98ng0du6l7sg1d5gqoukbs25fn95hmgp.apps.googleusercontent.com|3_VTKJFQtPoExX0v1f_jWPtJ";
                verifyTokenEndPoint = string.Format("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={0}", accessToken);
            }
            //else if (provider == "LinkedIn")
            //{
            //    var appToken = "4fdaf036-2121-414b-950d-68ceaa5a83c6";
            //    verifyTokenEndPoint = string.Format("https://api.linkedin.com/v1/people/~?oauth2_access_token={0}", accessToken);
            //}
            else
            {
                return null;
            }

            var client = new HttpClient();
            var uri = new Uri(verifyTokenEndPoint);
            var response = await client.GetAsync(uri);

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();

                dynamic jObj = (JObject)Newtonsoft.Json.JsonConvert.DeserializeObject(content);

                parsedToken = new ParsedExternalAccessToken();

                if (provider == "Facebook")
                {
                    parsedToken.user_id = jObj["data"]["user_id"];
                    parsedToken.app_id = jObj["data"]["app_id"];

                    if (!string.Equals(Startup.facebookAuthOptions.AppId, parsedToken.app_id, StringComparison.OrdinalIgnoreCase))
                    {
                        return null;
                    }
                }
                else if (provider == "Google")
                {
                    parsedToken.user_id = jObj["user_id"];
                    parsedToken.app_id = jObj["audience"];

                    if (!string.Equals(Startup.googleAuthOptions.ClientId, parsedToken.app_id, StringComparison.OrdinalIgnoreCase))
                    {
                        return null;
                    }
                }
                // UNDONE:
                //else if (provider == "LinkedIn")
                //{
                //    parsedToken.user_id = jObj["user_id"];
                //    parsedToken.app_id = jObj["audience"];

                //    if (!string.Equals(Startup.googleAuthOptions.ClientId, parsedToken.app_id, StringComparison.OrdinalIgnoreCase))
                //    {
                //        return null;
                //    }
                //}
            }

            return parsedToken;
        }

        private JObject GenerateLocalAccessTokenResponse(string userName)
        {
            var tokenExpiration = TimeSpan.FromDays(1);

            ClaimsIdentity identity = new ClaimsIdentity(OAuthDefaults.AuthenticationType);

            identity.AddClaim(new Claim(ClaimTypes.Name, userName));
            identity.AddClaim(new Claim("role", "user"));

            var props = new AuthenticationProperties()
            {
                IssuedUtc = DateTime.UtcNow,
                ExpiresUtc = DateTime.UtcNow.Add(tokenExpiration),
            };

            var ticket = new AuthenticationTicket(identity, props);

            var accessToken = Startup.OAuthBearerOptions.AccessTokenFormat.Protect(ticket);

            JObject tokenResponse = new JObject(
                new JProperty("userName", userName),
                new JProperty("access_token", accessToken),
                new JProperty("token_type", "bearer"),
                new JProperty("expires_in", tokenExpiration.TotalSeconds.ToString()),
                new JProperty(".issued", ticket.Properties.IssuedUtc.ToString()),
                //new JProperty("roleId", userName),
                new JProperty(".expires", ticket.Properties.ExpiresUtc.ToString()));

            return tokenResponse;
        }

        #endregion Helpers

        #region Manage Account

        private const string LocalLoginProvider = "Local";

        public ISecureDataFormat<AuthenticationTicket> AccessTokenFormat { get; private set; }

        [HttpGet]
        [Route("GetPlans")]
        public StripePlanCollection GetPlans()
        {
            StripePlanService planService = new StripePlanService(StripeApiSecretKey);
            IEnumerable<StripePlan> plans = planService.List();

            return new StripePlanCollection(plans);
        }

        [HttpGet]
        [Route("GetUserInfo")]
        public async Task<ManageAccountModel> GetUserInfo()
        {
            IdentityUser user = await _repo.FindByUsername(User.Identity.Name);

            if (user == null)
            {
                return null;
            }

            List<LoginProviderViewModel> logins = user.Logins.Select(linkedAccount => new LoginProviderViewModel
            {
                LoginProvider = linkedAccount.LoginProvider,
                ProviderKey = linkedAccount.ProviderKey
            }).ToList();

            if (user.PasswordHash != null)
            {
                logins.Add(new LoginProviderViewModel
                {
                    LoginProvider = LocalLoginProvider,
                    ProviderKey = user.UserName,
                });
            }

            #region Try check if user already has Stripe information (customer, card)

            // don't send any Stripe information about the Card or Customer (id or token) to client.
            bool hasCreditCard = false, hasStripeRegistered = false;
            Customer customer = this._baseRepository.GetCustomers().FirstOrDefault(c => c.Id == user.Id);
            if (customer != null)
            {
                hasStripeRegistered = true;

                Card card = this._baseRepository.GetCards().FirstOrDefault(c => c.CustomerID == customer.Id);
                hasCreditCard = card != null;
            }

            #endregion

            return new ManageAccountModel
            {
                LocalLoginProvider = LocalLoginProvider,
                Account = user,
                Logins = logins,
                Stripe = new ManageAccountModel.StripeInfos
                {
                    HasCreditCard = hasCreditCard,
                    HasStripeRegistered = hasStripeRegistered
                }
                // UNDONE
                //ExternalLoginProviders = this.GetExternalLogin()
            };
        }

        [HttpGet]
        [Route("GetUserCards")]
        public async Task<IList<CreditCardViewModel>> GetUserCards()
        {
            IList<CreditCardViewModel> cardList = new List<CreditCardViewModel>();
            IdentityUser user = await _repo.FindByUsername(User.Identity.Name);

            if (user == null)
            {
                return cardList;
            }

            var customer = this._baseRepository.GetCustomers().SingleOrDefault(c => c.Id == user.Id);
            if (customer == null)
            {
                return cardList;
            }

            StripeCustomerService customerService = new StripeCustomerService(StripeApiSecretKey);
            StripeCustomer stripeCustomer = customerService.Get(customer.StripeId);
            if (stripeCustomer == null)
            {
                return cardList;
            }

            foreach (StripeCard stripeCard in stripeCustomer.StripeCardList.StripeCards)
            {
                bool isDefault = stripeCard.Id == stripeCustomer.StripeDefaultCardId;

                cardList.Add(new CreditCardViewModel
                {
                    IsDefault = isDefault,
                    CustomerID = customer.Id,
                    Last4 = stripeCard.Last4
                });
            }

            return cardList;
        }

        [Route("AddUserCard")]
        public async Task<IHttpActionResult> AddUserCard(UserCardToken token)
        {
            IdentityUser user = await _userManager.FindByNameAsync(User.Identity.Name);
            if (user == null)
            {
                return NotFound();
            }

            Customer customer = this._baseRepository.GetCustomers().FirstOrDefault(c => c.Id == user.Id);
            if (customer == null)
            {
                return NotFound();
            }

            StripeCustomer stripeCustomer = null;

            try
            {
                StripeCardService cardService = new StripeCardService(StripeApiSecretKey);
                StripeCard stripeCard = cardService.Create(customer.StripeId, new StripeCardCreateOptions
                {
                    Card = new StripeCreditCardOptions
                    {
                        TokenId = token.Token,
                    }
                });

                if (token.SetAsDefaultCard)
                {
                    StripeCustomerService customerService = new StripeCustomerService(StripeApiSecretKey);
                    stripeCustomer = customerService.Update(customer.StripeId, new StripeCustomerUpdateOptions
                    {
                        DefaultCard = stripeCard.Id
                    });
                }

                Card newCard = new Card
                {
                    ID = Guid.NewGuid(),
                    StripeID = stripeCard.Id,
                    StripeToken = token.Token,
                    Last4 = stripeCard.Last4,
                    CustomerID = customer.Id,
                };

                this._baseRepository.AddCard(customer.Id, newCard, token.SetAsDefaultCard);
            }
            catch (Exception ex)
            {
                Elmah.ErrorSignal.FromCurrentContext().Raise(ex);
            }

            return Ok(stripeCustomer);
        }

        #region Subscribe won't be needed anymore
        //[Route("Subscribe")]
        //public async Task<IHttpActionResult> Subscribe(SubscriptionViewModel subscription)
        //{
        //    IdentityUser user = await _userManager.FindByNameAsync(User.Identity.Name);
        //    if (user == null)
        //    {
        //        return NotFound();
        //    }

        //    #region Card Token
        //    StripeTokenCreateOptions tokenCreateOptions = new StripeTokenCreateOptions
        //    {
        //        Card = new StripeCreditCardOptions
        //        {
        //            // donot set these properties if you set the TokenId
        //            CardNumber = subscription.Card.Number,
        //            CardExpirationYear = subscription.Card.ExpYear,
        //            CardExpirationMonth = subscription.Card.ExpMonth,
        //            CardCvc = subscription.Card.Cvc // optional unless we enable CVC check on Stripe
        //        }
        //    };

        //    StripeToken stripeToken;
        //    try
        //    {
        //        StripeTokenService tokenService = new StripeTokenService(ConfigurationManager.AppSettings["StripeApiSecretKey"]);
        //        stripeToken = tokenService.Create(tokenCreateOptions);
        //    }
        //    catch (Exception ex)
        //    {
        //        return GetErrorResult(ex);
        //    }

        //    #endregion

            
        //    #region Customer
        //    StripeCustomerCreateOptions customerCreateOptions = new StripeCustomerCreateOptions
        //    {
        //        Email = user.Email,
        //        Card = new StripeCreditCardOptions
        //        {
        //            // set this property if using a token
        //            TokenId = stripeToken.Id
        //        },
        //        PlanId = subscription.PlanID
        //    };

        //    StripeCustomer customer;
        //    try
        //    {
        //        StripeCustomerService customerService = new StripeCustomerService(ConfigurationManager.AppSettings["StripeApiSecretKey"]);
        //        customer = customerService.Create(customerCreateOptions);
        //    }
        //    catch (Exception ex)
        //    {
        //        return GetErrorResult(ex);
        //    }
        //    #endregion

        //    #region Update DB
            

        //    Card creditCard = new Card
        //    {
        //        ID = Guid.NewGuid(),
        //        StripeID = stripeToken.StripeCard.Id,
        //        StripeToken = stripeToken.Id,
        //        Brand = stripeToken.StripeCard.Brand,
        //        Funding = stripeToken.StripeCard.Funding,
        //        Fingerprint = stripeToken.StripeCard.Fingerprint,
        //        Last4 = stripeToken.StripeCard.Last4,
        //        CustomerID = user.Id
        //    };

        //    Customer customerData = new Customer
        //    {
        //        ID = user.Id,
        //        StripeID = customer.Id,
        //        Deliquent = customer.Delinquent,
        //        DefaultCardID = creditCard.ID
        //    };

        //    try
        //    {
        //        this._baseRepository.AddCustomerAndCard(customerData, creditCard);
        //    }
        //    catch (Exception ex)
        //    {
        //        return GetErrorResult(ex);
        //    }
        //    #endregion

        //    return Ok(customer);
        //}
        #endregion

        [HttpGet]
        [Route("UserCurrentSubscriptionPlan")]
        public async Task<IHttpActionResult> GetStripeCustomerInfos()
        {
            // get the current login info
            IdentityUser user = await _userManager.FindByNameAsync(User.Identity.Name);
            if (user == null)
            {
                return NotFound();
            }

            bool hasCreditCard = false, hasStripeRegistered = false;
            string currentSubscriptionPlanId = string.Empty;

            // get the stripe-customer info from DB
            Customer customer = this._baseRepository.GetCustomers().FirstOrDefault(c => c.Id == user.Id);
            if (customer != null)
            {
                hasStripeRegistered = true;
                hasCreditCard = customer.DefaultCardId != null;

                // try to get the current stripe-subscription of the customer
                StripeSubscriptionService subscriptionService =
                    new StripeSubscriptionService(ConfigurationManager.AppSettings["StripeApiSecretKey"]);
                IEnumerable<StripeSubscription> subscriptions = subscriptionService.List(customer.StripeId);
                IList<StripeSubscription> subscriptionList = subscriptions as IList<StripeSubscription> ??
                                                             subscriptions.ToList();
                if (subscriptions != null && subscriptionList.Any())
                {
                    StripeSubscription currentSubscription = subscriptionList.FirstOrDefault(s => s.Status == "active");
                    if (currentSubscription != null)
                    {
                        currentSubscriptionPlanId = currentSubscription.StripePlan.Id;
                    }
                }
            }

            // return if the current user has registered for Stripe and her/his current subscription-plan
            // DONOt return any Stripe information such as customer-id or card token to client
            return Ok(new StripeCustomerInfo
            {
                CurrentSubscriptionPlanID = currentSubscriptionPlanId,
                HasCreditCard = hasCreditCard,
                HasStripeRegistered = hasStripeRegistered
            });
        }

        [Route("UpdateSubscription")]
        public async Task<IHttpActionResult> UpdateSubscription(UpdateSubscriptionViewModel subscription)
        {
            IdentityUser user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return NotFound();
            }

            Customer customer = this._baseRepository.GetCustomers().FirstOrDefault(c => c.Id == user.Id);
            if (customer == null)
            {
                return NotFound();
            }

            try
            {
                // if user hasn't got any payment information (credit-card)
                // create one for him/her using the token
                if (!string.IsNullOrEmpty(subscription.Token))
                {
                    StripeCardService cardService = new StripeCardService(StripeApiSecretKey);
                    StripeCard stripeCard = cardService.Create(customer.StripeId, new StripeCardCreateOptions
                    {
                        Card = new StripeCreditCardOptions
                        {
                            TokenId = subscription.Token
                        }
                    });

                    Card card = new Card
                    {
                        ID = Guid.NewGuid(),
                        StripeID = stripeCard.Id,
                        StripeToken = subscription.Token,
                        CustomerID = customer.Id
                    };

                    // add a brand new card for the user/customer (this is a default card)
                    this._baseRepository.AddCard(customer.Id, card, true);
                }

                StripeCustomerService customerService = new StripeCustomerService(StripeApiSecretKey);
                StripeCustomer stripeCustomer = customerService.Get(customer.StripeId);
                
                if (stripeCustomer != null && stripeCustomer.StripeSubscriptionList != null)
                {
                    StripeSubscription stripeActiveSubscription =
                        stripeCustomer.StripeSubscriptionList.StripeSubscriptions.FirstOrDefault(
                            s => s.Status == "active");

                    if (stripeActiveSubscription != null)
                    {
                        StripeSubscriptionService subscriptionService = new StripeSubscriptionService(StripeApiSecretKey);

                        // update current subscription with new PlanID
                        subscriptionService.Update(stripeCustomer.Id, stripeActiveSubscription.Id,
                            new StripeSubscriptionUpdateOptions
                            {
                                PlanId =  subscription.NewPlanID
                            });

                        return Ok(new StripeCustomerInfo
                        {
                            CurrentSubscriptionPlanID = subscription.NewPlanID,
                            HasCreditCard = true,
                            HasStripeRegistered = true
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Elmah.ErrorSignal.FromCurrentContext().Raise(ex);
            }

            return Ok();
        }

        [Route("UpdateUserInfo")]
        [HttpPost]
        public async Task<IHttpActionResult> UpdateUserInfo(IdentityUser model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityUser originalUser = await _userManager.FindByNameAsync(model.UserName);

            originalUser.PhoneNumber = model.PhoneNumber;
            originalUser.Email = model.Email;

            IdentityResult result = await _userManager.UpdateAsync(originalUser);

            IHttpActionResult errorResult = GetErrorResult(result);
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok();
        }

        [Route("ChangePassword")]
        [HttpPost]
        public async Task<IHttpActionResult> ChangePassword(ChangePasswordBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityUser user = await _userManager.FindByNameAsync(User.Identity.Name);
            IdentityResult result = await _userManager.ChangePasswordAsync(
                user.Id, model.OldPassword, model.NewPassword);

            IHttpActionResult errorResult = GetErrorResult(result);
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok();
        }

        [Route("SetPassword")]
        [HttpPost]
        public async Task<IHttpActionResult> SetPassword(SetPasswordBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityUser user = await _userManager.FindByNameAsync(User.Identity.Name);
            IdentityResult result = await _userManager.AddPasswordAsync(user.Id, model.NewPassword);

            IHttpActionResult errorResult = GetErrorResult(result);
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok();
        }

        [Route("AddLogin")]
        [HttpPost]
        public async Task<IHttpActionResult> AddExternalLogin(AddExternalLoginBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);

            AuthenticationTicket ticket = AccessTokenFormat.Unprotect(model.ExternalAccessToken);

            if (ticket == null || ticket.Identity == null || (ticket.Properties != null
                && ticket.Properties.ExpiresUtc.HasValue
                && ticket.Properties.ExpiresUtc.Value < DateTimeOffset.UtcNow))
            {
                return BadRequest("External login failure.");
            }

            ExternalLoginData externalData = ExternalLoginData.FromIdentity(ticket.Identity);

            if (externalData == null)
            {
                return BadRequest("The external login is already associated with an account.");
            }

            IdentityUser user = await _userManager.FindByNameAsync(User.Identity.Name);
            IdentityResult result = await _userManager.AddLoginAsync(user.Id,
                new UserLoginInfo(externalData.LoginProvider, externalData.ProviderKey));

            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok();
        }

        [Route("RemoveLogin")]
        [HttpPost]
        public async Task<IHttpActionResult> RemoveLogin(RemoveLoginBindingModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityResult result;
            IdentityUser user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (model.LoginProvider == LocalLoginProvider)
            {
                result = await _userManager.RemovePasswordAsync(user.Id);
            }
            else
            {
                result = await _userManager.RemoveLoginAsync(user.Id,
                    new UserLoginInfo(model.LoginProvider, model.ProviderKey));
            }

            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok();
        }

        #endregion Manage Account

        [HttpGet]
        [AllowAnonymous]
        public void Logout()
        {
            MemoryCacher.Delete("AccessControlList");
        }
    }
}
