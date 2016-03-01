using Dna.Mvp.Data.Entities;
using Dna.Mvp.Services;
using Dna.Mvp.WebApi.Api.Helpers;
using Repository.Pattern.UnitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Web.Http;
using Dna.Mvp.Data.Entities;
using Dna.Mvp.Services;
using Dna.Mvp.WebApi.Api.Models;
using Newtonsoft.Json.Linq;
using Repository.Pattern.UnitOfWork;

namespace Dna.Mvp.WebApi.Api.Controllers
{

    public interface IDnaController
    {
    }

    [AllowAnonymous]
    public class DnaController : ApiController, IDnaController
    {
        private readonly IUnitOfWorkAsync _unitOfWorkAsync;

        public DnaController(IUnitOfWorkAsync unitOfWorkAsync)
        {
            _unitOfWorkAsync = unitOfWorkAsync;
        }

        [HttpGet]
        [AllowAnonymous]
        public object GetSample()
        {
            return _unitOfWorkAsync.RepositoryAsync<User>().Queryable();
            //return context.Users.ToList();
        }

        #region Look-up list

        /// <summary>
        /// Query returing a 1-element array with a lookups object whose 
        /// properties are all Rooms, Tracks, and TimeSlots.
        /// </summary>
        /// <returns>
        /// Returns one object, not an IQueryable, 
        /// whose properties are "rooms", "tracks", "timeslots".
        /// The items arrive as arrays.
        /// </returns>
        [HttpGet]
        public object Lookups()
        {
            var parentTypeOfTypes =
                _unitOfWorkAsync.RepositoryAsync<TypeOfType>()
                    .Query(x => x.ParentID == null || x.ParentID == Guid.Empty)
                    .Select()
                    .OrderBy(x => x.Name)
                    .ToList();
            var types = _unitOfWorkAsync.RepositoryAsync<TypeOfType>().Query().Select().OrderBy(x => x.Name).ToList();
            var domainObjects =
                _unitOfWorkAsync.RepositoryAsync<DomainObject>().Query().Select().OrderBy(x => x.Name).ToList();
            var roles = _unitOfWorkAsync.RepositoryAsync<AspNetRole>().Query().Select().OrderBy(x => x.Name).ToList();
            var permissions =
                _unitOfWorkAsync.RepositoryAsync<Permission>()
                    .Query()
                    .Select(x => new { x.Value, x.Description })
                    .OrderBy(x => x.Value)
                    .ToList();

            //// Insert first empty items
            //parentTypeOfTypes.Insert(0, new TypeOfType() { TypeOfTypeID = new Guid(Guid.Empty.ToString().Replace("0", "1")), Name = "[Select a Parent]" });
            //types.Insert(0, new TypeOfType() { TypeOfTypeID = Guid.Empty, Name = "[Select a Type]" });

            return new { parentTypeOfTypes, types, domainObjects, roles, permissions };
        }

        #endregion

        #region Get Many-Many table

        [HttpGet]
        [AllowAnonymous]
        public ICollection<AspNetRole> GetAspNetRolesByRefUserId(string id)
        {

            //var user = _unitOfWorkAsync.RepositoryAsync<AspNetUser>().Query(x => x.Id == id).Include(x => x.AspNetRoles).Select().First();
            var user = _unitOfWorkAsync.RepositoryAsync<AspNetUser>()
                    .Query(x => x.Id == id)
                    .Include(x => x.AspNetRoles)
                    .Select()
                    .First();
            if (user != null)
                return user.AspNetRoles;
            else
                return null;
        }

        [HttpGet]
        [AllowAnonymous]
        public ICollection<AspNetRole> GetUnassignedAspNetRolesByRefUserId(string id)
        {

            //var user = _unitOfWorkAsync.RepositoryAsync<AspNetUser>().Query(x => x.Id == id).Include(x => x.AspNetRoles).Select().First();
            var user = _unitOfWorkAsync.RepositoryAsync<AspNetUser>()
                    .Query(x => x.Id == id)
                    .Include(x => x.AspNetRoles)
                    .Select()
                    .First();
            if (user != null)
            {
                var assignedRoles = user.AspNetRoles.ToList();
                var list = _unitOfWorkAsync.RepositoryAsync<AspNetRole>().Query().Select().ToList().Where(x => !assignedRoles.Contains(x));
                return list.ToList();
            }
            else
                return null;
        }

        [HttpPost]
        [AllowAnonymous]
        public void UpdatedAspNetRoles(AspNetUserRolesDto aspNetUserRolesDto)
        {
            if (aspNetUserRolesDto == null) return;

            var user = _unitOfWorkAsync.RepositoryAsync<AspNetUser>()
                .Query(x => x.Id == aspNetUserRolesDto.UserId)
                .Include(x => x.AspNetRoles)
                .Select()
                .First();
            if (user != null)
            {
                var newAssignRoles = _unitOfWorkAsync.RepositoryAsync<AspNetRole>()
                        .Query(x => aspNetUserRolesDto.RolesIds.Contains(x.Id))
                        .Select()
                        .ToList();

                var currentAssignedRoles = user.AspNetRoles.ToList();
                foreach (var role in currentAssignedRoles)
                {
                    user.AspNetRoles.Remove(role);
                }

                //_unitOfWorkAsync.SaveChanges();

                foreach (var newAssignRole in newAssignRoles)
                {
                    user.AspNetRoles.Add(newAssignRole);
                }

                _unitOfWorkAsync.SaveChanges();
            }
        }
        #endregion
        
        [HttpGet]
        [AllowAnonymous]
        public object GetAllAccessControlListAndPermissions()
        {
            var userIdentity = Thread.CurrentPrincipal;
            ClaimsPrincipal claims = userIdentity as ClaimsPrincipal;
            List<AccessControlListItem> accessControlList = new List<AccessControlListItem>();
            List<Permission> permissions = new List<Permission>();

            if (claims.Identity.IsAuthenticated)
            {
                // Get User ID from Claim Set
                var userId = claims.Claims.FirstOrDefault(x => x.Type == "userId");

                // Might need to get Role from Claim Set later
                //var role = identity.Claims.ToList().FirstOrDefault(x => x.Type == ClaimTypes.Role);

                // Get the logged in user information
                var user = userId == null ? null : _unitOfWorkAsync.RepositoryAsync<AspNetUser>().Query(x => x.Id == userId.Value).Include(x => x.AspNetRoles).Select().FirstOrDefault();
                if (user == null)
                {
                    // User doesn't exist
                    return false;
                }

                // Check if user has any role?
                if (user.AspNetRoles == null || user.AspNetRoles.Count == 0)
                {
                    // There is no role assigned to the logged in user, throw unauthorized access exception
                    return false;
                }

                List<string> roleIds = user.AspNetRoles.Select(x => x.Id).ToList();

                accessControlList = this._unitOfWorkAsync.RepositoryAsync<AccessControlListItem>().Query(x => roleIds.Contains(x.RoleId)).Include(x => x.DomainObject).Select().ToList();
                permissions = this._unitOfWorkAsync.RepositoryAsync<Permission>().Queryable().ToList();

                // UNDONE: Need to put this code back
                // Add the Access Control List to Memory Cache with expiration after 60 minutes
                MemoryCacher.Add("AccessControlList", accessControlList, DateTime.UtcNow.AddHours(1));

            }

            //return accessControlList.AsQueryable();
            return new { accessControlList, permissions };

        }
    }
}