using System.Collections.Generic;
using Dna.Mvp.Data.Entities.Filters;
using EntityFramework.DynamicFilters;
using System.Data.Entity;
using System.Linq;
using System.Security.Principal;

namespace Dna.Mvp.Data.Entities
{
    public partial class MvpContext
    {
        public readonly Dictionary<string, object> MultiTenantAutomaticProperties;

        public void DisableGlobalFilter(string filterName)
        {
            MultiTenantAutomaticProperties.Remove(filterName);
            this.DisableFilter(filterName);
            this.SetFilterScopedParameterValue(filterName, null);
        }

        public void EnableGlobalFilter(string filterName, string parameterName, object value)
        {
            /* Within a single DbContext instance, filter parameter values can also be changed.
             * These changes are scoped to only that DbContext instance and do not affect
             * any other DbContext instances.
             * 
             * Global parameter values can also be changed
             * using the SetFilterGlobalParameterValue extension method.
             */

            MultiTenantAutomaticProperties[filterName] = value;
            this.EnableFilter(filterName);
            this.SetFilterScopedParameterValue(filterName, parameterName, () => value);
        }

        //partial void AddGlobalFilter(DbModelBuilder modelBuilder)
        //{
        //    modelBuilder.Filter(
        //        "Customer",
        //        (ICustomerFilterable c, string customerId) => c.CustomerId == customerId,
        //        DoSomethingForCustomerFilter);
        //    modelBuilder.DisableFilterGlobally("Customer");

        //    //modelBuilder.Filter("BlogEntryFilter",
        //    //        (ICustomerFilterable c, string customerId) => (c.CustomerId == customerId),
        //    //        GetAllUserForCustomer(Thread.CurrentPrincipal));
        //}

        private static string GetAllUserForCustomer(IPrincipal principal)
        {
            return principal.Identity.Name;
        }

        private static bool FilterCustomerGroup(Group g, string customerId)
        {
            var customers = g.CustomerGroups.Where(cg => cg.CustomerId == customerId);

            return customers.Any();
        }

        private static string DoSomethingForCustomerFilter()
        {
            return string.Empty;
        }
    }
}