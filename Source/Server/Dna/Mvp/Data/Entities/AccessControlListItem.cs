using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using Newtonsoft.Json;
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class AccessControlListItem : BaseEntity
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [ForeignKey("DomainObject")]
        public int? DomainObjectId { get; set; }

        [Required]
        [StringLength(128)]
        [ForeignKey("Role")]
        public string RoleId { get; set; }

        public int PermissionValue { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedDate { get; set; }

        [Required]
        [StringLength(255)]
        public string CreatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        [StringLength(255)]
        public string UpdatedBy { get; set; }

        public virtual AspNetRole Role { get; set; }

        public virtual DomainObject DomainObject { get; set; }
    }
}
