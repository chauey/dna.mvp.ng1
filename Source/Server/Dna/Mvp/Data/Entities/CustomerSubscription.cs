using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public partial class CustomerSubscription : BaseEntity
    {
        public Guid Id { get; set; }

        [StringLength(128)]
        public string CustomerId { get; set; }

        public Guid SubscriptionId { get; set; }

        [StringLength(50)]
        public string Discount { get; set; }

        public int? TaxPercent { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public virtual Customer Customer { get; set; }

        public virtual Subscription Subscription { get; set; }
    }
}
