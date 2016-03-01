using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public partial class CustomerRole : BaseEntity
    {
        public Guid CustomerRoleId { get; set; }

        [Required]
        [StringLength(128)]
        public string AspNetRoleId { get; set; }

        [Required]
        [StringLength(128)]
        public string CustomerId { get; set; }

        public virtual AspNetRole AspNetRole { get; set; }

        public virtual Customer Customer { get; set; }
    }
}
