

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class Space
    {
        [Key]
        public Guid SpaceID { get; set; }

        [Required]
        [StringLength(100)]
        public string SpaceName { get; set; }

        [ForeignKey("User")]
        [StringLength(128)]
        public string PayerId { get; set; }

        public virtual User User { get; set; }
    }
}
