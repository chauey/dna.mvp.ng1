using Dna.Mvp.Data.Entities.Core;
using System;
using System.ComponentModel.DataAnnotations;

namespace Dna.Mvp.Data.Entities
{
    public partial class TableRelationship : BaseEntity
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string Table1Name { get; set; }

        [Required]
        public string Table2Name { get; set; }
    }
}
