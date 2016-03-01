using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class Validation : BaseEntity
    {
        public Guid ValidationID { get; set; }

        public int Integer { get; set; }

        public string String { get; set; }

        [Column(TypeName = "date")]
        public DateTime? Date { get; set; }

        public DateTime? BeforeDate { get; set; }

        public DateTime? AfterDate { get; set; }

        [Range(0, 150, ErrorMessage = "Please enter valid age.")]
        public int? Age { get; set; }

        [Column(TypeName = "numeric")]
        public decimal? CreditCard { get; set; }

        [StringLength(100)]
        public string Email { get; set; }

        [StringLength(15)]
        public string Phone { get; set; }

        public string URL { get; set; }

        [StringLength(5)]
        public string Zip { get; set; }

        [StringLength(100)]
        public string StartsWithDPT { get; set; }

        [StringLength(100)]
        public string ContainsDPT { get; set; }


        [ForeignKey("User")]
        [StringLength(128)]
        public string UserId { get; set; }

        public virtual User User { get; set; }
    }
}
