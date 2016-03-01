using Stripe;
using System.Collections.Generic;
using System.Linq;

namespace Dna.Mvp.Web.Models
{
    public class StripePlanCollection
    {
        public StripePlanCollection(IEnumerable<StripePlan> plans)
        {
            this.Plans = plans.ToArray();
        }

        public StripePlan[] Plans { get; private set; }
    }

    public class StripeCustomerInfo
    {
        public bool HasCreditCard { get; set; }
        public bool HasStripeRegistered { get; set; }

        public string CurrentSubscriptionPlanID { get; set; }
    }

    public class UpdateSubscriptionViewModel
    {
        public string Token { get; set; }
        public string NewPlanID { get; set; }
    }

    public class SubscriptionViewModel
    {
        public string PlanID { get; set; }
        public CreditCardViewModel Card { get; set; }
    }

    public class CreditCardViewModel
    {
        public bool IsDefault { get; set; }
        public string Number { get; set; }
        public string Last4 { get; set; }
        public string Cvc{ get; set; }
        public string ExpMonth { get; set; }
        public string ExpYear { get; set; }
        public string CustomerID { get; set; }
    }

    public class UserCardToken
    {
        public bool SetAsDefaultCard { get; set; }
        public string Token { get; set; }
    }
}