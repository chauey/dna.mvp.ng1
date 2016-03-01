using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public partial class GroupUser : BaseEntity
    {
        public Guid Id { get; set; }

        public Guid GroupId { get; set; }

        [Required]
        [StringLength(128)]
        public string UserId { get; set; }

        public virtual Group Group { get; set; }

        public virtual User User { get; set; }
    }
}
