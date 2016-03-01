using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class SubscriptionPlan : BaseEntity
    {
        public SubscriptionPlan()
        {
            Subscriptions = new HashSet<Subscription>();
        }

        public Guid Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        public int? MaxGroups { get; set; }

        public int? MaxUsers { get; set; }

        public int? MaxExample { get; set; }

        public decimal? Price { get; set; }

        public int? TrialPeriod { get; set; }

        public virtual ICollection<Subscription> Subscriptions { get; set; }
    }
}
