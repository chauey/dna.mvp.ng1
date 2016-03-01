using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;

    public partial class SubscriptionGroup : BaseEntity
    {
        public Guid Id { get; set; }

        public Guid SubscriptionId { get; set; }

        public Guid GroupId { get; set; }

        public virtual Group Group { get; set; }

        public virtual Subscription Subscription { get; set; }
    }
}
