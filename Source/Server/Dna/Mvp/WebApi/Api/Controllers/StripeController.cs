using Dna.Mvp.Web.Models;
using Stripe;
using System.Collections.Generic;
using System.Configuration;
using System.Web.Http;



namespace Dna.Mvp.Web.Controllers
{
    /// <summary>
    /// Original Source from https://github.com/pedropaf/saas-ecom/blob/master/SaasEcom.FrontEnd/content/Controllers/BillingController.cs.pp
    /// </summary>
    [System.Web.Http.RoutePrefix("api/Stripe")]
    public class StripeController : ApiController
    {
        private static readonly string StripeApiKey = ConfigurationManager.AppSettings["StripeApiSecretKey"];

        #region Subscription, Sign-in and User Managers
        ////private ApplicationSignInManager _signInManager;

        ////public ApplicationSignInManager SignInManager
        ////{
        ////    get
        ////    {
        ////        return _signInManager ?? HttpContext.GetOwinContext().Get<ApplicationSignInManager>();
        ////    }
        ////    private set
        ////    {
        ////        _signInManager = value;
        ////    }
        ////}

        ////private ApplicationUserManager _userManager;

        ////public ApplicationUserManager UserManager
        ////{
        ////    get
        ////    {
        ////        return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
        ////    }
        ////    private set
        ////    {
        ////        _userManager = value;
        ////    }
        ////}

        ////private SubscriptionsFacade _subscriptionsFacade;

        /////// <summary>
        /////// SubscriptionsFacade's pretty messing
        /////// </summary>
        ////private SubscriptionsFacade SubscriptionsFacade
        ////{
        ////    get
        ////    {
        ////        return _subscriptionsFacade ?? (_subscriptionsFacade = new SubscriptionsFacade(
        ////            data: new SubscriptionDataService<ApplicationDbContext, ApplicationUser>(HttpContext.GetOwinContext().Get<ApplicationDbContext>()),
        ////            subscriptionProvider: new SubscriptionProvider(ConfigurationManager.AppSettings["StripeApiSecretKey"]),
        ////            cardProvider: new CardProvider(ConfigurationManager.AppSettings["StripeApiSecretKey"], new CardDataService<ApplicationDbContext, ApplicationUser>(Request.GetOwinContext().Get<ApplicationDbContext>())),
        ////            cardDataService: new CardDataService<ApplicationDbContext, ApplicationUser>(Request.GetOwinContext().Get<ApplicationDbContext>()),
        ////            customerProvider: new CustomerProvider(ConfigurationManager.AppSettings["StripeApiSecretKey"]),
        ////            subscriptionPlanDataService: new SubscriptionPlanDataService<ApplicationDbContext, ApplicationUser>(HttpContext.GetOwinContext().Get<ApplicationDbContext>()),
        ////            chargeProvider: new ChargeProvider(ConfigurationManager.AppSettings["StripeApiSecretKey"])));
        ////    }
        ////}

        ////private InvoiceDataService<ApplicationDbContext, ApplicationUser> _invoiceDataService;

        ////private InvoiceDataService<ApplicationDbContext, ApplicationUser> InvoiceDataService
        ////{
        ////    get
        ////    {
        ////        return _invoiceDataService ??
        ////               (_invoiceDataService =
        ////                   new InvoiceDataService<ApplicationDbContext, ApplicationUser>(
        ////                       Request.GetOwinContext().Get<ApplicationDbContext>()));
        ////    }
        ////}

        ////private ICardProvider _cardService;

        ////private ICardProvider CardService
        ////{
        ////    get
        ////    {
        ////        return _cardService ?? (_cardService = new CardProvider(ConfigurationManager.AppSettings["StripeApiSecretKey"],
        ////            new CardDataService<ApplicationDbContext, ApplicationUser>(HttpContext.GetOwinContext().Get<ApplicationDbContext>())));
        ////    }
        ////}

        ////private SubscriptionPlansFacade _subscriptionPlansFacade;

        ////private SubscriptionPlansFacade SubscriptionPlansFacade
        ////{
        ////    get
        ////    {
        ////        return _subscriptionPlansFacade ?? (_subscriptionPlansFacade = new SubscriptionPlansFacade(
        ////            new SubscriptionPlanDataService<ApplicationDbContext, ApplicationUser>(HttpContext.GetOwinContext().Get<ApplicationDbContext>()),
        ////            new SubscriptionPlanProvider(ConfigurationManager.AppSettings["StripeApiSecretKey"])));
        ////    }
        ////}
        #endregion

        [System.Web.Http.AllowAnonymous]
        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("Plans")]
        public StripePlanCollection GetPlans()
        {
            StripePlanService planService = new StripePlanService(StripeApiKey);
            IEnumerable<StripePlan> plans = planService.List();

            return new StripePlanCollection(plans);
        }

        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("Customer")]
        public StripeCustomer GetCustomer(string stripeCustomerID)
        {
            StripeCustomerService customerService = new StripeCustomerService(StripeApiKey);
            StripeCustomer customer = customerService.Get(stripeCustomerID);

            return customer;
        }

        ////public async Task<IHttpActionResult> Index()
        ////{
        ////    ViewBag.Subscriptions = await SubscriptionsFacade.UserActiveSubscriptionsAsync(User.Identity.GetUserId());
        ////    ViewBag.PaymentDetails = await SubscriptionsFacade.DefaultCreditCard(User.Identity.GetUserId());
        ////    ViewBag.Invoices = await InvoiceDataService.UserInvoicesAsync(User.Identity.GetUserId());
        ////    return Ok();
        ////}

        ////public async Task<IHttpActionResult> ChangeSubscription()
        ////{
        ////    var currentSubscription = (await SubscriptionsFacade.UserActiveSubscriptionsAsync(User.Identity.GetUserId())).FirstOrDefault();
        ////    var model = new ChangeSubscriptionViewModel
        ////    {
        ////        SubscriptionPlans = await SubscriptionPlansFacade.GetAllAsync(),
        ////        CurrentSubscription = currentSubscription != null ? currentSubscription.SubscriptionPlan.Id : string.Empty
        ////    };

        ////    return Ok(model);
        ////}

        //[HttpPost]
        //[System.Web.Mvc.ValidateAntiForgeryToken]
        //public async Task<IHttpActionResult> ChangeSubscription(ChangeSubscriptionViewModel model)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
        //        await SubscriptionsFacade.UpdateSubscriptionAsync(user.Id, user.StripeCustomerId, model.NewPlan);
        //        // TempData.Add("flash", new FlashSuccessViewModel("Your subscription plan has been updated."));
        //    }
        //    else
        //    {
        //        // TempData.Add("flash", new FlashSuccessViewModel("Sorry, there was an error updating your plan, try again or contact support."));
        //    }

        //    return RedirectToAction("Index");
        //}

        ////public IHttpActionResult CancelSubscription(int id)
        ////{
        ////    return Ok(new CancelSubscriptionViewModel { Id = id });
        ////}

        ////[HttpPost]
        ////public async Task<IHttpActionResult> CancelSubscription(CancelSubscriptionViewModel model)
        ////{
        ////    if (ModelState.IsValid)
        ////    {
        ////        var currentSubscription = (await SubscriptionsFacade.UserActiveSubscriptionsAsync(User.Identity.GetUserId())).FirstOrDefault();
        ////        var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
        ////        DateTime? endDate; // Because we are passing CancelAtTheEndOfPeriod to EndSubscription, we get the date when the subscription will be cancelled
        ////        if (currentSubscription != null &&
        ////            (endDate = await SubscriptionsFacade.EndSubscriptionAsync(currentSubscription.Id, user, true, model.Reason)) != null)
        ////        {
        ////            // TempData.Add("flash", new FlashSuccessViewModel("Your subscription has been cancelled."));
        ////        }
        ////        else
        ////        {
        ////            // TempData.Add("flash", new FlashDangerViewModel("Sorry, there was a problem cancelling your subscription."));
        ////        }

        ////        return RedirectToAction("Index", "Billing");
        ////    }

        ////    return Ok(model);
        ////}

        //public async Task<IHttpActionResult> ReActivateSubscription()
        //{
        //    var currentSubscription = (await SubscriptionsFacade.UserActiveSubscriptionsAsync(User.Identity.GetUserId())).FirstOrDefault();
        //    var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
        //    if (currentSubscription != null &&
        //        await SubscriptionsFacade.UpdateSubscriptionAsync(user.Id, user.StripeCustomerId, currentSubscription.SubscriptionPlanId))
        //    {
        //        // TempData.Add("flash", new FlashSuccessViewModel("Your subscription plan has been re-activated."));
        //    }
        //    else
        //    {
        //        // TempData.Add("flash", new FlashDangerViewModel("Ooops! There was a problem re-activating your subscription. Please, try again."));
        //    }

        //    return RedirectToAction("Index");
        //}

        ////public IHttpActionResult AddCreditCard()
        ////{
        ////    return Ok(new CreditCardViewModel
        ////    {
        ////        CreditCard = new CreditCard()
        ////    });
        ////}

        ////[HttpPost]
        ////[System.Web.Mvc.ValidateAntiForgeryToken]
        ////public async Task<IHttpActionResult> AddCreditCard(CreditCardViewModel model)
        ////{
        ////    if (ModelState.IsValid)
        ////    {
        ////        var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
        ////        await CardService.AddAsync(user, model.CreditCard);
        ////        // TempData.Add("flash", new FlashSuccessViewModel("Your credit card has been saved successfully."));
        ////        return RedirectToAction("Index");
        ////    }

        ////    return Ok(model);
        ////}

        ////public async Task<IHttpActionResult> ChangeCreditCard(int? id)
        ////{
        ////    if (id == null)
        ////    {
        ////        return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
        ////    }

        ////    var model = new CreditCardViewModel
        ////    {
        ////        CreditCard = await CardService.FindAsync(User.Identity.GetUserId(), id)
        ////    };

        ////    // If the card doesn't exist or doesn't belong the logged in user
        ////    if (model.CreditCard == null || model.CreditCard.SaasEcomUserId != User.Identity.GetUserId())
        ////    {
        ////        return HttpNotFound();
        ////    }
        ////    model.CreditCard.ClearCreditCardDetails();

        ////    return Ok(model);
        ////}

        ////[HttpPost]
        ////[System.Web.Mvc.ValidateAntiForgeryToken]
        ////public async Task<IHttpActionResult> ChangeCreditCard(CreditCardViewModel model)
        ////{
        ////    var userId = User.Identity.GetUserId();
        ////    if (ModelState.IsValid && await CardService.CardBelongToUser(model.CreditCard.Id, userId))
        ////    {
        ////        var user = await UserManager.FindByIdAsync(userId);
        ////        await CardService.UpdateAsync(user, model.CreditCard);

        ////        // TempData.Add("flash", new FlashSuccessViewModel("Your credit card has been updated successfully."));

        ////        return RedirectToAction("Index");
        ////    }

        ////    return Ok(model);
        ////}

        ////public IHttpActionResult BillingAddress()
        ////{
        ////    // TODO: Get Billing address from your model
        ////    var model = new BillingAddress();
        ////    return Ok(model);
        ////}

        ////[HttpPost]
        ////public IHttpActionResult BillingAddress(BillingAddress model)
        ////{
        ////    if (ModelState.IsValid)
        ////    {
        ////        // TODO: Call your service to save the billing address
        ////        // TempData.Add("flash", new FlashSuccessViewModel("Your billing address has been saved."));
        ////        return RedirectToAction("Index");
        ////    }

        ////    return Ok(model);
        ////}

        ////public async Task<IHttpActionResult> Invoice(int id)
        ////{
        ////    var invoice = await InvoiceDataService.UserInvoiceAsync(User.Identity.GetUserId(), id);
        ////    return Ok(invoice);
        ////}

        //public async Task<IHttpActionResult> DeleteAccount()
        //{
        //    var user = await _userManager.FindByIdAsync(User.Identity.GetUserId());

        //    // Delete User
        //    await _userManager.DeleteAsync(user);

        //    // TODO: Delete user data
        //    SignInManager.AuthenticationManager.SignOut();
        //    return RedirectToAction("Index", "Home");
        //}
    }
}