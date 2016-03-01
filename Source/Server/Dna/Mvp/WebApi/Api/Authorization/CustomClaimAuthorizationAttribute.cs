using Dna.Mvp.Data.Entities;
using Dna.Mvp.Data.Entities.Enums;
using Dna.Mvp.Data.Repository.Repositories;
using Dna.Mvp.WebApi.Api.Helpers;
using Repository.Pattern.UnitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading;
using System.Web.Http;

namespace Dna.Mvp.WebApi.Api.Authorization
{
    public class CustomAuthorizeAttribute : AuthorizeAttribute
    {
        #region Fields
        private static readonly string[] _emptyArray = new string[0];
        private string _resourceString;
        private MvpResources _resource;
        private MvpPermissions _permission;
        private bool _bypassValidation;
        private IUnitOfWorkAsync _unitOfWorkAsync;
        #endregion

        #region Properties

        public bool BypassValidation
        {
            get { return _bypassValidation; }

            set
            {
                _bypassValidation = value;
            }
        }

        public string ResourceString
        {
            get { return _resourceString; }

            set
            {
                _resourceString = value;
            }
        }

        public MvpPermissions Permission
        {
            get { return _permission; }

            set
            {
                _permission = value;
            }
        }
        #endregion

        #region Methods
        protected override bool IsAuthorized(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            _unitOfWorkAsync = actionContext.Request.GetDependencyScope().GetService(typeof(IUnitOfWorkAsync)) as IUnitOfWorkAsync;

            var userIdentity = Thread.CurrentPrincipal;

            if (userIdentity.Identity.IsAuthenticated)
            {
                // Get User ID from Claim Set
                var userId = (userIdentity as ClaimsPrincipal).Claims.FirstOrDefault(x => x.Type == "userId");

                // Get ResourceString and Permission from HttpActionContext/action's authorization attributes
                var authorizeAttributes = actionContext.ActionDescriptor.GetCustomAttributes<CustomAuthorizeAttribute>();
                this.ResourceString = authorizeAttributes.FirstOrDefault().ResourceString;
                this.Permission = authorizeAttributes.FirstOrDefault().Permission;

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

                _resource = Dna.Mvp.WebApi.Api.Helpers.Utilities.GetResource(_resourceString);


                // Get the Access Control List from Memory Cache
                var accessControlList = MemoryCacher.GetValue("AccessControlList") as List<AccessControlListItem>;

                // If the Access Control List is not available, then get it from DB first
                if (accessControlList == null)
                {
                    accessControlList = this._unitOfWorkAsync.RepositoryAsync<AccessControlListItem>().Query().Include(x => x.DomainObject).Select().ToList();
                    MemoryCacher.Add("AccessControlList", accessControlList, DateTime.UtcNow.AddHours(1));
                }

                // HACK to run will back to work later
                // Loop through the logged in user's roles to see if matches any of the Roles that have the passed in permissions
                foreach (var role in user.AspNetRoles)
                {
                    MvpPermissions aclPermission;
                    if (accessControlList.Any(x => x.DomainObject.Name == _resource.ToString() && x.RoleId == role.Id &&
                        Enum.TryParse<MvpPermissions>(x.PermissionValue.ToString(), out aclPermission) &&
                        aclPermission.HasFlag(Permission)))
                    {
                        return true;
                    }
                }

                return false;
            }

            return false;
        }

        protected override void HandleUnauthorizedRequest(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            //base.HandleUnauthorizedRequest(actionContext);

            if (actionContext == null)
            {
                throw new ArgumentNullException("actionContext is null");
            }

            var result = new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.Unauthorized,
                RequestMessage = actionContext.Request
            };

            actionContext.Response = result;
        }

        private static string[] SplitString(string original)
        {
            if (String.IsNullOrEmpty(original))
            {
                return _emptyArray;
            }

            var split = from piece in original.Split(',')
                        let trimmed = piece.Trim()
                        where !String.IsNullOrEmpty(trimmed)
                        select trimmed;

            return split.ToArray();
        }
        #endregion
    }
}
