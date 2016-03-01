using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class User : BaseEntity
    {
        public User()
        {
            GroupOwners = new HashSet<GroupOwner>();
            GroupUsers = new HashSet<GroupUser>();
            //Customers = new HashSet<Customer>(); 
            Spaces = new HashSet<Space>();
            Validations = new HashSet<Validation>();
        }

        public byte StatusID { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public Guid CreateBy { get; set; }

        public Guid? UpdateBy { get; set; }

        public string FirstName { get; set; }

        public string MiddleName { get; set; }

        public string LastName { get; set; }

        public string Company { get; set; }

        public string Department { get; set; }

        public string JobTitle { get; set; }

        public string WorkNumber { get; set; }

        public string WorkFaxNumber { get; set; }

        public string WorkAddress { get; set; }

        public string IM { get; set; }

        public string Email { get; set; }

        public string MobileNumber { get; set; }

        public string WebPage { get; set; }

        public string OfficeLocation { get; set; }

        public string HomeNumber { get; set; }

        public string HomeAddress { get; set; }

        public string OtherAddress { get; set; }

        public string PagerNumber { get; set; }

        public string CarNumber { get; set; }

        public string HomeFax { get; set; }

        public string CompanyNumber { get; set; }

        public string Work2Number { get; set; }

        public string Home2Number { get; set; }

        public string RadioNumber { get; set; }

        public string IM2 { get; set; }

        public string IM3 { get; set; }

        public string Email2 { get; set; }

        public string Email3 { get; set; }

        public string Assistant { get; set; }

        public string AssistantNumber { get; set; }

        public string Manager { get; set; }

        public string GovtID { get; set; }

        public string Account { get; set; }

        //public string CustomerID { get; set; }

        public DateTime Birthday { get; set; }

        public string Anniversary { get; set; }

        public string Spouse { get; set; }

        public string Children { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IUserID { get; set; }

        public string PhotoUrl { get; set; }

        public int? PledgeAmount { get; set; }

        public string NewsLetterEmail { get; set; }

        public string OtherInfo { get; set; }

        [StringLength(128)]
        public string CustomerId { get; set; }

        //public virtual ICollection<Customer> Customers { get; set; }

        [Key]
        public string Id { get; set; }

        public virtual AspNetUser AspNetUser { get; set; }

        public virtual Customer Customer { get; set; }

        public virtual ICollection<GroupOwner> GroupOwners { get; set; }

        public virtual ICollection<GroupUser> GroupUsers { get; set; }

        public virtual ICollection<Space> Spaces { get; set; }
        public virtual ICollection<Validation> Validations { get; set; }

        [NotMapped]
        public List<Guid> RoleIds { get; set; }

        [NotMapped]
        public string Name
        {
            get { return this.FirstName + " " + this.LastName; }
        }

    }
}
