using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public partial class Card : BaseEntity
    {
        public Guid ID { get; set; }

        [Required]
        [StringLength(50)]
        public string StripeID { get; set; }

        [Required]
        [StringLength(50)]
        public string StripeToken { get; set; }

        [StringLength(50)]
        public string Fingerprint { get; set; }

        [StringLength(4)]
        public string Last4 { get; set; }

        [StringLength(50)]
        public string Brand { get; set; }

        [StringLength(10)]
        public string Funding { get; set; }

        public bool IsValid { get; set; }

        [StringLength(128)]
        public string CustomerID { get; set; }

        public virtual Customer Customer { get; set; }
    }
}
