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
    public class DomainObjectController : DnaOdataController
    {
        private readonly IUnitOfWorkAsync _unitOfWorkAsync;
        private readonly IDomainObjectService _domainObjectService;

        public DomainObjectController(IUnitOfWorkAsync unitOfWorkAsync, IDomainObjectService domainObjectService)
        {
            _unitOfWorkAsync = unitOfWorkAsync;
            _domainObjectService = domainObjectService;
        }

        // GET: /DomainObject
        [EnableQuery]
        [CustomAuthorize(ResourceString = "DomainObjects", Permission = MvpPermissions.Read)]
        public IQueryable<DomainObject> Get()
        {
            return _domainObjectService.Queryable();
        }

        // GET: /DomainObject(5)
        [EnableQuery]
        [CustomAuthorize(ResourceString = "DomainObjects", Permission = MvpPermissions.Read)]
        public SingleResult<DomainObject> Get([FromODataUri] int key)
        {
            return SingleResult.Create(_domainObjectService.Queryable().Where(DomainObjects => DomainObjects.Id == key));
        }

        // PUT: /DomainObject(5)
        [CustomAuthorize(ResourceString = "DomainObjects", Permission = MvpPermissions.Write)]
        public IHttpActionResult Put([FromODataUri] int key, DomainObject domainObject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var isExist = DomainObjectExists(key);

            if (!isExist)
            {
                return NotFound();
            }

            _domainObjectService.Update(domainObject);

            try
            {
                _unitOfWorkAsync.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DomainObjectExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(domainObject);
        }

        // POST: /DomainObject
        [CustomAuthorize(ResourceString = "DomainObjects", Permission = MvpPermissions.Write)]
        public IHttpActionResult Post(DomainObject DomainObjects)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _domainObjectService.Insert(DomainObjects);
            _unitOfWorkAsync.SaveChanges();

            return Created(DomainObjects);
        }

        // PATCH: /DomainObject(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [CustomAuthorize(ResourceString = "DomainObjects", Permission = MvpPermissions.Write)]
        public IHttpActionResult Patch([FromODataUri] int key, Delta<DomainObject> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            DomainObject DomainObjects = _domainObjectService.Find(key);
            if (DomainObjects == null)
            {
                return NotFound();
            }

            patch.Patch(DomainObjects);

            try
            {
                _unitOfWorkAsync.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DomainObjectExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(DomainObjects);
        }

        // DELETE: /DomainObject(5)
        [CustomAuthorize(ResourceString = "DomainObjects", Permission = MvpPermissions.Delete)]
        public IHttpActionResult Delete([FromODataUri] int key)
        {
            DomainObject DomainObjects = _domainObjectService.Find(key);
            if (DomainObjects == null)
            {
                return NotFound();
            }

            _domainObjectService.Delete(DomainObjects);
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

        private bool DomainObjectExists(int key)
        {
            return _domainObjectService.Queryable().Count(e => e.Id == key) > 0;
        }
    }
}
