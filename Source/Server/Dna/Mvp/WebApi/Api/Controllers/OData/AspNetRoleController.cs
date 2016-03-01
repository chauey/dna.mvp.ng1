using Dna.Mvp.Data.Entities;
using Dna.Mvp.Data.Entities.Enums;
using Dna.Mvp.Services;
using Dna.Mvp.WebApi.Api.Authorization;
using Dna.Mvp.WebApi.Api.Controllers.Bases;
using Repository.Pattern.UnitOfWork;
using System;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.OData;

namespace Dna.Mvp.WebApi.Api.Controllers
{
    public class AspNetRoleController : DnaOdataController
    {
        private readonly IUnitOfWorkAsync _unitOfWorkAsync;
        private readonly IAspNetRoleService _aspNetRoleService;

        public AspNetRoleController(IUnitOfWorkAsync unitOfWorkAsync, IAspNetRoleService aspNetRoleService)
        {
            _unitOfWorkAsync = unitOfWorkAsync;
            _aspNetRoleService = aspNetRoleService;
        }

        // GET: /AspNetRole
        [EnableQuery]
        [CustomAuthorize(ResourceString = "AspNetRoles", Permission = MvpPermissions.Read)]
        public IQueryable<AspNetRole> Get()
        {
            return _aspNetRoleService.Queryable();
        }

        // GET: /AspNetRole(5)
        [EnableQuery]
        [CustomAuthorize(ResourceString = "AspNetRoles", Permission = MvpPermissions.Read)]
        public SingleResult<AspNetRole> Get([FromODataUri]string key)
        {
            return SingleResult.Create(_aspNetRoleService.Queryable().Where(AspNetRoles => AspNetRoles.Id == key));
        }

        // PUT: /AspNetRole(5)
        [CustomAuthorize(ResourceString = "AspNetRoles", Permission = MvpPermissions.Write)]
        public IHttpActionResult Put([FromODataUri]string key, AspNetRole aspNetRole)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var isExist = AspNetRoleExists(key);

            if (!isExist)
            {
                return NotFound();
            }

            _aspNetRoleService.Update(aspNetRole);

            try
            {
                _unitOfWorkAsync.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AspNetRoleExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(aspNetRole);
        }

        // POST: /AspNetRole
        [CustomAuthorize(ResourceString = "AspNetRoles", Permission = MvpPermissions.Write)]
        public IHttpActionResult Post(AspNetRole AspNetRoles)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _aspNetRoleService.Insert(AspNetRoles);
            _unitOfWorkAsync.SaveChanges();

            return Created(AspNetRoles);
        }

        // PATCH: /AspNetRole(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [CustomAuthorize(ResourceString = "AspNetRoles", Permission = MvpPermissions.Write)]
        public IHttpActionResult Patch(string key, Delta<AspNetRole> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            AspNetRole AspNetRoles = _aspNetRoleService.Find(key);
            if (AspNetRoles == null)
            {
                return NotFound();
            }

            patch.Patch(AspNetRoles);

            try
            {
                _unitOfWorkAsync.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AspNetRoleExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(AspNetRoles);
        }

        // DELETE: /AspNetRole(5)
        [CustomAuthorize(ResourceString = "AspNetRoles", Permission = MvpPermissions.Delete)]
        public IHttpActionResult Delete([FromODataUri] string key)
        {
            AspNetRole AspNetRoles = _aspNetRoleService.Find(key);
            if (AspNetRoles == null)
            {
                return NotFound();
            }

            _aspNetRoleService.Delete(AspNetRoles);
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

        private bool AspNetRoleExists(string key)
        {
            return _aspNetRoleService.Queryable().Count(e => e.Id == key.ToString()) > 0;
        }
    }
}
