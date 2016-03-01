using System.ComponentModel.DataAnnotations;

namespace Dna.Mvp.WebApi.Api.Authentication.Models
{
    public class AudienceModel
    {
        [MaxLength(100)]
        [Required]
        public string Name { get; set; }
    }
}