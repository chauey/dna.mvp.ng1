using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public partial class CustomerGroup : BaseEntity
    {
        public Guid Id { get; set; }

        [StringLength(128)]
        public string CustomerId { get; set; }

        public Guid GroupId { get; set; }

        public virtual Customer Customer { get; set; }

        public virtual Group Group { get; set; }
    }
}
