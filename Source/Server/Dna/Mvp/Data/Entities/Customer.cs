using Dna.Mvp.Data.Entities.Core;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Dna.Mvp.Data.Entities
{
    [JsonObject(IsReference = false)]

    public partial class Customer : BaseEntity
    {
        public Customer()
        {
            Cards = new HashSet<Card>();
            //Users = new HashSet<User>();
        }

        [Key]
        public string Id { get; set; }

        [Required]
        [StringLength(50)]
        public string StripeId { get; set; }

        public bool Deliquent { get; set; }

        public Guid? DefaultCardId { get; set; }

        [StringLength(35)]
        public string FirstName { get; set; }

        [StringLength(35)]
        public string LastName { get; set; }

        //public virtual AspNetUser AspNetUser { get; set; }

        public virtual ICollection<Card> Cards { get; set; }

        //public virtual ICollection<User> Users { get; set; }

        [NotMapped]
        public bool HasPaymentDetails
        {
            get { return this.Cards != null && this.Cards.Any(); }
        }

        [NotMapped]
        public string FullName
        {
            get { return FirstName + " " + LastName; }
        }
    }
}
