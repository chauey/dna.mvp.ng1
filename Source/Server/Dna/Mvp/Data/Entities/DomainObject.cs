using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class DomainObject : BaseEntity
    {
        public DomainObject()
        {
            AccessControlListItems = new HashSet<AccessControlListItem>();
        }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(50)]
        public string Name { get; set; }

        public string Description { get; set; }

        public bool? IsActive { get; set; }

        public DateTime? CreatedDate { get; set; }

        [StringLength(255)]
        public string CreatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        [StringLength(255)]
        public string UpdatedBy { get; set; }

        public virtual ICollection<AccessControlListItem> AccessControlListItems { get; set; }
    }
}
