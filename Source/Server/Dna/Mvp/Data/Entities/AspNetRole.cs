using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class AspNetRole : BaseEntity
    {
        public AspNetRole()
        {
            AccessControlListItems = new HashSet<AccessControlListItem>();
            CustomerRoles = new HashSet<CustomerRole>();
            GroupRoles = new HashSet<GroupRole>();
            AspNetUsers = new HashSet<AspNetUser>();
            Customers = new HashSet<Customer>();
            Groups = new HashSet<Group>();
        }

        public string Id { get; set; }

        [Required]
        [StringLength(256)]
        public string Name { get; set; }

        public virtual ICollection<AccessControlListItem> AccessControlListItems { get; set; }

        public virtual ICollection<CustomerRole> CustomerRoles { get; set; }

        public virtual ICollection<GroupRole> GroupRoles { get; set; }

        public virtual ICollection<AspNetUser> AspNetUsers { get; set; }

        public virtual ICollection<Customer> Customers { get; set; }

        public virtual ICollection<Group> Groups { get; set; }
    }
}
