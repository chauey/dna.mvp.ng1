using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public partial class Attachment : BaseEntity
    {
        public Guid AttachmentID { get; set; }

        [Required]
        [StringLength(100)]
        public string FileName { get; set; }

        [Required]
        public string FilePath { get; set; }

        [Required]
        public byte[] FileContent { get; set; }

        public bool IsActive { get; set; }

        public int? DisplayOrder { get; set; }

        public DateTime CreatedDate { get; set; }

        public Guid CreateBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public Guid? UpdateBy { get; set; }
    }
}
