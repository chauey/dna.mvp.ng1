using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class AuditLog : BaseEntity
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public Guid Who { get; set; }

        [Required]
        [StringLength(50)]
        public string What { get; set; }

        public DateTime When { get; set; }

        [Required]
        [StringLength(50)]
        public string TableName { get; set; }

        [StringLength(50)]
        public string TableIdValue { get; set; }

        [Column(TypeName = "text")]
        public string OldData { get; set; }

        [Column(TypeName = "text")]
        public string NewData { get; set; }
    }
}
