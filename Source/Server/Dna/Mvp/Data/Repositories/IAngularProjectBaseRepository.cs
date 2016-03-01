using Breeze.ContextProvider;
using Dna.Mvp.Data.Entities;
using Newtonsoft.Json.Linq;
using System.Linq;

namespace Dna.Mvp.Data.Repository
{
    public interface IMvpRepository
    {
        void DisableGlobalFilter(string filterName);

        void EnableGlobalFilter(string filterName, string parameterName, object value);

        SaveResult SaveChanges(JObject saveBundle);

        string GetMetadata();

        IQueryable<TypeOfType> GetParentTypeOfTypes();

        IQueryable<AllDataType> GetAllDataTypes();

        IQueryable<AspNetRole> GetAspNetRoles();

        IQueryable<AspNetUserClaim> GetAspNetUserClaims();

        IQueryable<AspNetUserLogin> GetAspNetUserLogins();

        IQueryable<AspNetUser> GetAspNetUsers();

        IQueryable<Attachment> GetAttachments();

        IQueryable<AuditLog> GetAuditLog();

        IQueryable<ELMAH_Error> GetELMAH_Error();

        IQueryable<TypeOfType> GetTypeOfTypes();

        IQueryable<User> GetUsers();

        IQueryable<Validation> GetValidations();

        IQueryable<AccessControlListItem> GetAccessControlListItems();

        IQueryable<DomainObject> GetDomainObjects();

        IQueryable<Permission> GetPermissions();

        IQueryable<AccessControlListItem> GetAllAccessControlList();

        IQueryable<Group> GetGroups();
        
        IQueryable<Customer> GetCustomers();

        IQueryable<Card> GetCards();

        int AddCustomer(Customer customer);

        int AddCard(string customerID, Card card, bool setDefaultCard);
    }
}