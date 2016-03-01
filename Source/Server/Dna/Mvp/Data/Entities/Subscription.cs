using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class Subscription : BaseEntity
    {
        public Subscription()
        {
            CustomerSubscriptions = new HashSet<CustomerSubscription>();
            SubscriptionGroups = new HashSet<SubscriptionGroup>();
        }

        public Guid Id { get; set; }

        public Guid? PlanId { get; set; }

        public DateTime? Expiration { get; set; }

        [StringLength(255)]
        public string Name { get; set; }

        public virtual ICollection<CustomerSubscription> CustomerSubscriptions { get; set; }

        public virtual ICollection<SubscriptionGroup> SubscriptionGroups { get; set; }

        public virtual SubscriptionPlan SubscriptionPlan { get; set; }
    }
}
