using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.OData;
using Dna.Mvp.WebApi.Api.Controllers.Bases;
using Dna.Mvp.Data.Entities;
using Dna.Mvp.Services;
using Repository.Pattern.UnitOfWork;
using System.Threading;
using System.Security.Claims;
using Dna.Mvp.WebApi.Api.Authorization;
using Dna.Mvp.Data.Entities.Enums;

namespace Dna.Mvp.WebApi.Api.Controllers
{
    public class AccessControlListItemController : DnaOdataController
    {
        private readonly IUnitOfWorkAsync _unitOfWorkAsync;
        private readonly IAccessControlListItemService _accessControlListItemService;

        public AccessControlListItemController(IUnitOfWorkAsync unitOfWorkAsync, IAccessControlListItemService accessControlListItemService)
        {
            _unitOfWorkAsync = unitOfWorkAsync;
            _accessControlListItemService = accessControlListItemService;
        }

        // GET: /AccessControlListItem
        [EnableQuery]
        [CustomAuthorize(ResourceString = "AccessControlListItems", Permission = MvpPermissions.Read)]
        public IQueryable<AccessControlListItem> Get()
        {
            return _accessControlListItemService.Queryable();
        }

        // GET: /AccessControlListItem(5)
        [EnableQuery]
        [CustomAuthorize(ResourceString = "AccessControlListItems", Permission = MvpPermissions.Read)]
        public SingleResult<AccessControlListItem> Get([FromODataUri] int key)
        {
            IQueryable<AccessControlListItem> result = this._accessControlListItemService.Queryable().Where(a => a.Id == key);
            return SingleResult.Create(result);
        }

        // PUT: /AccessControlListItem(5)
        [CustomAuthorize(ResourceString = "AccessControlListItems", Permission = MvpPermissions.Write)]
        public IHttpActionResult Put([FromODataUri] int key, AccessControlListItem accessControlListItem)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var isExist = AccessControlListItemExists(key);

            if (!isExist)
            {
                return NotFound();
            }

            _accessControlListItemService.Update(accessControlListItem);

            try
            {
                _unitOfWorkAsync.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AccessControlListItemExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(accessControlListItem);
        }

        // POST: /AccessControlListItem
        [CustomAuthorize(ResourceString = "AccessControlListItems", Permission = MvpPermissions.Write)]
        public IHttpActionResult Post(AccessControlListItem accessControlListItems)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _accessControlListItemService.Insert(accessControlListItems);
            _unitOfWorkAsync.SaveChanges();

            return Created(accessControlListItems);
        }

        // PATCH: /AccessControlListItem(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [CustomAuthorize(ResourceString = "AccessControlListItems", Permission = MvpPermissions.Write)]
        public IHttpActionResult Patch([FromODataUri] int key, Delta<AccessControlListItem> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            AccessControlListItem accessControlListItems = _accessControlListItemService.Find(key);
            if (accessControlListItems == null)
            {
                return NotFound();
            }

            patch.Patch(accessControlListItems);

            try
            {
                _unitOfWorkAsync.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AccessControlListItemExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(accessControlListItems);
        }

        // DELETE: /AccessControlListItem(5)
        [CustomAuthorize(ResourceString = "AccessControlListItems", Permission = MvpPermissions.Delete)]
        public IHttpActionResult Delete([FromODataUri] int key)
        {
            AccessControlListItem accessControlListItems = _accessControlListItemService.Find(key);
            if (accessControlListItems == null)
            {
                return NotFound();
            }

            _accessControlListItemService.Delete(accessControlListItems);
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

        private bool AccessControlListItemExists(int key)
        {
            return _accessControlListItemService.Queryable().Count(e => e.Id == key) > 0;
        }
    }
}
