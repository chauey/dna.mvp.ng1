using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public partial class GroupRole : BaseEntity
    {
        public Guid Id { get; set; }

        public Guid GroupId { get; set; }

        [Required]
        [StringLength(128)]
        public string AspNetRoleId { get; set; }

        public virtual AspNetRole AspNetRole { get; set; }

        public virtual Group Group { get; set; }
    }
}
