using Breeze.ContextProvider;
using Breeze.ContextProvider.EF6;
using Dna.Mvp.Data.Entities;
using Newtonsoft.Json.Linq;
using Repository.Pattern.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using EntityState = System.Data.Entity.EntityState;

namespace Dna.Mvp.Data.Repository.Repositories
{
    public class MvpRepository : IMvpRepository
    {
        private readonly EFContextProvider<MvpDataContext>
            _contextProvider = new EFContextProvider<MvpDataContext>();

        private IRepositoryAsync<AspNetUser> _repositoryAsync;
        private IRepositoryAsync<AccessControlListItem> _aclRepositoryAsync;

        public MvpRepository()
        {
        }

        ////public MvpRepository(IRepositoryAsync<AspNetUser> repositoryAsync, IRepositoryAsync<AccessControlListItem> aclRepositoryAsync)
        ////{
        ////    _repositoryAsync = repositoryAsync;
        ////    _aclRepositoryAsync = aclRepositoryAsync;
        ////}

        public void DisableGlobalFilter(string filterName)
        {
            //if (this.Context != null)
            //{
            //    this.Context.DisableGlobalFilter(filterName);
            //}
        }

        public void EnableGlobalFilter(string filterName, string parameterName, object value)
        {
            //if (this.Context != null)
            //{
            //    this.Context.EnableGlobalFilter(filterName, parameterName, value);
            //}
        }

        public string Metadata
        {
            get { return this._contextProvider.Metadata(); }
        }

        private MvpDataContext Context
        {
            get { return this._contextProvider.Context; }
        }

        public string GetMetadata()
        {
            return this._contextProvider.Metadata();
        }

        public SaveResult SaveChanges(JObject saveBundle)
        {
            return this._contextProvider.SaveChanges(saveBundle);
        }

        public IQueryable<AllDataType> GetAllDataTypes()
        {
            return this.Context.AllDataTypes;
        }

        public IQueryable<AspNetRole> GetAspNetRoles()
        {
            return this.Context.AspNetRoles;
        }

        public IQueryable<AspNetUserClaim> GetAspNetUserClaims()
        {
            return this.Context.AspNetUserClaims;
        }

        public IQueryable<AspNetUserLogin> GetAspNetUserLogins()
        {
            return this.Context.AspNetUserLogins;
        }

        public IQueryable<AspNetUser> GetAspNetUsers()
        {
            return this.Context.AspNetUsers.Include("AspNetRoles");
        }

        public IQueryable<Attachment> GetAttachments()
        {
            return this.Context.Attachments;
        }

        public IQueryable<AuditLog> GetAuditLog()
        {
            return this.Context.AuditLogs;
        }

        public IQueryable<AccessControlListItem> GetAccessControlListItems()
        {
            return this.Context.AccessControlListItems.Include("Role").Include("DomainObject");
        }

        public IQueryable<DomainObject> GetDomainObjects()
        {
            return this.Context.DomainObjects;
        }

        public IQueryable<Permission> GetPermissions()
        {
            return this.Context.Permissions;
        }

        public IQueryable<ELMAH_Error> GetELMAH_Error()
        {
            return this.Context.ELMAH_Error;
        }

        public IQueryable<TypeOfType> GetTypeOfTypes()
        {
            return this.Context.TypeOfTypes;
        }

        public IQueryable<User> GetUsers()
        {
            return this.Context.Users.Include("Customers");
        }

        public IQueryable<Validation> GetValidations()
        {
            return this.Context.Validations;
        }

        public IQueryable<TypeOfType> GetParentTypeOfTypes()
        {
            return this.Context.TypeOfTypes.Where(x => x.ParentID == null || x.ParentID == Guid.Empty);
        }

        public IQueryable<AccessControlListItem> GetAllAccessControlList()
        {
            List<AccessControlListItem> accessControlList = this.Context.AccessControlListItems.Include("Role").Include("DomainObject").ToList();
            return accessControlList.AsQueryable();
        }

        public IQueryable<Group> GetGroups()
        {
            return this.Context.Groups;
        }

        public IQueryable<Customer> GetCustomers()
        {
            return this.Context.Customers;
        }

        public IQueryable<Card> GetCards()
        {
            return this.Context.Cards;
        }

        public int AddCustomerAndCard(Customer customer, Card card)
        {
            this.Context.Customers.Add(customer);
            this.Context.Cards.Add(card);
            return this.Context.SaveChanges();
        }

        public int AddCustomer(Customer customer)
        {
            this.Context.Customers.Add(customer);
            return this.Context.SaveChanges();
        }

        public int AddCard(string customerID, Card card, bool setDefaultCard = true)
        {
            int result = 0;

            Customer customer = this.GetCustomers().SingleOrDefault(c => c.Id == customerID);
            if (customer == null)
            {
                return result;
            }

            if (string.IsNullOrWhiteSpace(card.CustomerID))
            {
                card.CustomerID = customerID;
            }

            this.Context.Cards.Add(card);
            result = this.Context.SaveChanges();

            if (setDefaultCard)
            {
                customer.DefaultCardId = card.ID;
                this.Context.Entry(customer).State = EntityState.Modified;
                result = this.Context.SaveChanges();
            }

            return result;
        }
        //public ICollection<Customer> GetCustomersByRefUserId(int userId)
        //{
        //    User user = this.Context.Users.Include("Customers").FirstOrDefault(x => x.IUserID == userId);
        //    if (user != null)
        //        return user.Customers;
        //    else
        //        return null;
        //}
    }
}

