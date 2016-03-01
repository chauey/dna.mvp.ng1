using Dna.Mvp.Data.Entities;
using System;
using System.Linq;
using System.Security.Claims;

namespace Dna.Mvp.WebApi.Api.Authorization
{
    public interface ICurrentUserResolver
    {
        /// <summary>
        ///     Returns the currently loged in user's UserId
        /// </summary>
        /// <returns>Null if no user is logged in</returns>
        int? GetCurrentUserId();

        string GetCurrentCustomerId();

        /// <summary>
        /// Builds a claims identity for a user
        /// </summary>
        /// <param name="user">User to build the identity for</param>
        /// <param name="authenticationType">Type of authentication to be used</param>
        /// <returns>ClaimsIdentity for a user</returns>
        ClaimsIdentity BuildClaimsIdentity(User user, string authenticationType);
    }

    public class CurrentUserResolver : ICurrentUserResolver
    {
        private const string CustomerId = "customerId";
        private const string UserID = "userId";

        public int? GetCurrentUserId()
        {
            var userIdFromClaim =
                ClaimsPrincipal.Current.Claims.Where(c => c.Type == UserID)
                    .Select(c => c.Value)
                    .FirstOrDefault();

            int userIdFromClaimInt;
            if (int.TryParse(userIdFromClaim, out userIdFromClaimInt))
                return userIdFromClaimInt;

            return null;
        }

        public string GetCurrentCustomerId()
        {
            var customerIdFromClaim =
                ClaimsPrincipal.Current.Claims.Where(c => c.Type == CustomerId)
                    .Select(c => c.Value)
                    .FirstOrDefault();

            return customerIdFromClaim;
        }

        public ClaimsIdentity BuildClaimsIdentity(User user, string authenticationType)
        {
            if (user == null)
                throw new ArgumentException("user");

            if (string.IsNullOrEmpty(authenticationType))
                throw new ArgumentException("authenticationType");

            var identity = new ClaimsIdentity(authenticationType);

            identity.AddClaim(new Claim(CustomerId, user.CustomerId));

            ////if (permissions.CanEditUsers) identity.AddClaim(new Claim(ClaimTypes.Role, "CanEditUsers"));
            ////if (permissions.CanEditUserGroups) identity.AddClaim(new Claim(ClaimTypes.Role, "CanEditUserGroups"));
            ////if (permissions.CanEditObligees) identity.AddClaim(new Claim(ClaimTypes.Role, "CanEditObligees"));
            ////if (permissions.CanEditBondTypes) identity.AddClaim(new Claim(ClaimTypes.Role, "CanEditBondTypes"));
            ////if (permissions.CanEditDocumentLibrary) identity.AddClaim(new Claim(ClaimTypes.Role, "CanEditDocumentLibrary"));

            return identity;
        }
    }
}