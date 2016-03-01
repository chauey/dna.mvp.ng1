using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.OData;
using Dna.Mvp.WebApi.Api.Controllers.Bases;
using Dna.Mvp.Data.Entities;
using Dna.Mvp.Services;
using Repository.Pattern.UnitOfWork;
using Dna.Mvp.WebApi.Api.Authorization;
using Dna.Mvp.Data.Entities.Enums;

namespace Dna.Mvp.WebApi.Api.Controllers
{
    public class PermissionController : DnaOdataController
    {
        private readonly IUnitOfWorkAsync _unitOfWorkAsync;
        private readonly IPermissionService _permissionService;

        public PermissionController(IUnitOfWorkAsync unitOfWorkAsync, IPermissionService permissionService)
        {
            _unitOfWorkAsync = unitOfWorkAsync;
            _permissionService = permissionService;
        }

        // GET: /Permission
        [EnableQuery]
        [CustomAuthorize(ResourceString = "Permissions", Permission = MvpPermissions.Read)]
        public IQueryable<Permission> Get()
        {
            return _permissionService.Queryable();
        }

        // GET: /Permission(5)
        [EnableQuery]
        [CustomAuthorize(ResourceString = "Permissions", Permission = MvpPermissions.Read)]
        public SingleResult<Permission> Get([FromODataUri] int key)
        {
            return SingleResult.Create(_permissionService.Queryable().Where(Permissions => Permissions.Id == key));
        }

        // PUT: /Permission(5)
        [CustomAuthorize(ResourceString = "Permissions", Permission = MvpPermissions.Write)]
        public IHttpActionResult Put([FromODataUri] int key, Permission permission)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var isExist = PermissionExists(key);

            if (!isExist)
            {
                return NotFound();
            }

            _permissionService.Update(permission);

            try
            {
                _unitOfWorkAsync.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PermissionExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(permission);
        }

        // POST: /Permission
        [CustomAuthorize(ResourceString = "Permissions", Permission = MvpPermissions.Write)]
        public IHttpActionResult Post(Permission Permissions)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _permissionService.Insert(Permissions);
            _unitOfWorkAsync.SaveChanges();

            return Created(Permissions);
        }

        // PATCH: /Permission(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [CustomAuthorize(ResourceString = "Permissions", Permission = MvpPermissions.Write)]
        public IHttpActionResult Patch([FromODataUri] int key, Delta<Permission> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Permission Permissions = _permissionService.Find(key);
            if (Permissions == null)
            {
                return NotFound();
            }

            patch.Patch(Permissions);

            try
            {
                _unitOfWorkAsync.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PermissionExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(Permissions);
        }

        // DELETE: /Permission(5)
        [CustomAuthorize(ResourceString = "Permissions", Permission = MvpPermissions.Delete)]
        public IHttpActionResult Delete([FromODataUri] int key)
        {
            Permission Permissions = _permissionService.Find(key);
            if (Permissions == null)
            {
                return NotFound();
            }

            _permissionService.Delete(Permissions);
            _unitOfWorkAsync.SaveChanges();

            return StatusCode(HttpStatusCode.NoContent);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _unitOfWorkAsync.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool PermissionExists(int key)
        {
            return _permissionService.Queryable().Count(e => e.Id == key) > 0;
        }
    }
}
