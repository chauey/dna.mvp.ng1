using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dna.Mvp.Data.Entities
{
    public interface IStripeEntity
    {
        string StripeID { get; set; }
    }

    public interface IExtendedProperties
    {
        IDictionary<string, object> Metadata { get; set; }
    }

    public interface IAuditableEntity
    {
        DateTime? CreatedDate { get; set; }
        DateTime? UpdatedDate { get; set; }
    }

    public abstract class StripeEntity : JObject, IStripeEntity, IExtendedProperties, IAuditableEntity
    {
        [Required]
        [MaxLength(50)]
        public string StripeID { get; set; }

        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }

        [NotMapped]
        public IDictionary<string, object> Metadata { get; set; }
    }
}
