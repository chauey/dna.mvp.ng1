using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System.ComponentModel.DataAnnotations;

    public partial class Client : BaseEntity
    {
        public string Id { get; set; }

        [Required]
        public string Secret { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        public int ApplicationType { get; set; }

        public bool Active { get; set; }

        public int RefreshTokenLifeTime { get; set; }

        [StringLength(200)]
        public string AllowedOrigin { get; set; }
    }
}
