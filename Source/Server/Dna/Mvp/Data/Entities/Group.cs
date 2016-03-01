using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class Group : BaseEntity
    {
        public Group()
        {
            CustomerGroups = new HashSet<CustomerGroup>();
            GroupOwners = new HashSet<GroupOwner>();
            GroupRoles = new HashSet<GroupRole>();
            GroupUsers = new HashSet<GroupUser>();
            SubscriptionGroups = new HashSet<SubscriptionGroup>();
            AspNetRoles = new HashSet<AspNetRole>();
        }

        public Guid Id { get; set; }

        public Guid? PayerId { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        public virtual ICollection<CustomerGroup> CustomerGroups { get; set; }

        public virtual ICollection<GroupOwner> GroupOwners { get; set; }

        public virtual ICollection<GroupRole> GroupRoles { get; set; }

        public virtual ICollection<GroupUser> GroupUsers { get; set; }

        public virtual ICollection<SubscriptionGroup> SubscriptionGroups { get; set; }

        public virtual ICollection<AspNetRole> AspNetRoles { get; set; }
    }
}
