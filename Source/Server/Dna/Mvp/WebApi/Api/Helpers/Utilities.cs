using Dna.Mvp.Data.Entities.Enums;
using Dna.Mvp.Data.Repository;
using System;
using System.Diagnostics;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Claims;

namespace Dna.Mvp.WebApi.Api.Helpers
{
    public static class Utilities
    {
        public static bool CheckIfCurrentRoleHasPermissionToThisResource_DB(ClaimsIdentity identity, IMvpRepository repository, MvpResources resource, MvpPermissions permission)
        {
            // Get User ID from Claim Set
            var userId = identity.Claims.ToList().FirstOrDefault(x => x.Type == "userId");

            // Might need to get Role from Claim Set later
            //var role = identity.Claims.ToList().FirstOrDefault(x => x.Type == ClaimTypes.Role);

            // Get the logged in user information
            var user = userId == null ? null : repository.GetAspNetUsers().FirstOrDefault(x => x.Id == userId.Value);
            if (user == null)
            {
                // User doesn't exist, throw exception 
                throw new Exception("User doesn't exist.");
            }

            // Check if user has any role?
            if (user.AspNetRoles == null || user.AspNetRoles.Count == 0)
            {
                // There is no role assigned to the logged in user, throw unauthorized access exception
                throw new UnauthorizedAccessException();
            }

            // Loop through the logged in user's roles to see if matches any of the Roles that have the passed in permissions
            foreach (var role in user.AspNetRoles)
            {
                // Get Permission Value for the user on this resource
                var permissionOnThisResource = (from a in repository.GetAccessControlListItems()
                                                join d in repository.GetDomainObjects() on a.DomainObjectId equals d.Id
                                                where a.IsActive == true && d.IsActive == true &&
                                                      a.RoleId == role.Id && d.Name == resource.ToString() 
                                                select a.PermissionValue).FirstOrDefault();

                MvpPermissions aclPermission;

                // Check if the logged in user has the right permission on this resource
                if (permissionOnThisResource > 0 &&
                    Enum.TryParse<MvpPermissions>(permissionOnThisResource.ToString(), out aclPermission) &&
                    aclPermission.HasFlag(permission))
                {
                    return true;
                }
            }

            return false;
        }

        public static bool CheckIfCurrentRoleHasPermissionToThisResource_Config(ClaimsIdentity identity, IMvpRepository repository, MvpResources resource, MvpPermissions permission)
        {
            // MR. Chau:
            // get from config, which Roles has Read access 
            // get roles from claims
            // loop through roles to see if matches any of the Roles that have Read access

            // Ai:
            // Get UserId from Claims
            //var role = identity.Claims.ToList().FirstOrDefault(x => x.Type == ClaimTypes.Role);
            var userId = identity.Claims.ToList().FirstOrDefault(x => x.Type == "userId");
            var user = userId == null ? null : repository.GetAspNetUsers().FirstOrDefault(x => x.Id == userId.Value);
            if (user == null)
            {
                throw new Exception("User doesn't exist.");
            }

            // loop through roles to see if matches any of the Roles that have Read access
            foreach (var role in user.AspNetRoles)
            {
                // Get Permission Value for the user on this resource
                var permissionOnThisResource = (from a in repository.GetAccessControlListItems()
                                                join d in repository.GetDomainObjects() on a.DomainObjectId equals d.Id
                                                where a.IsActive == true && d.IsActive == true &&
                                                      a.RoleId == role.Id && d.Name == resource.ToString()
                                                select a.PermissionValue).FirstOrDefault();

                MvpPermissions aclPermission;
                if (permissionOnThisResource > 0 &&
                    Enum.TryParse<MvpPermissions>(permissionOnThisResource.ToString(), out aclPermission) &&
                    aclPermission.HasFlag(permission))
                {
                    return true;
                }
            }

            return false;
        }

        [MethodImpl(MethodImplOptions.NoInlining)]
        public static string GetCurrentMethod()
        {
            StackTrace stackTrace = new StackTrace();
            StackFrame stackFrame = stackTrace.GetFrame(1);

            return stackFrame.GetMethod().Name;
        }

        public static MvpResources GetResource(string resourceName)
        {
            MvpResources resource;

            if (!string.IsNullOrEmpty(resourceName))
            {
                if (resourceName.StartsWith("Save"))
                {
                    // Remove the Save work in the resource name
                    resourceName = resourceName.Substring(4);
                }

                // Return the match role
                if (!string.IsNullOrEmpty(resourceName) && Enum.TryParse<MvpResources>(resourceName, out resource))
                {
                    return resource;
                } 
            }

            // If we can't find any role, return None
            return MvpResources.None;
        }
    }
}