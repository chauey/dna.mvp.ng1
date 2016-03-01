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
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.OData;

namespace Dna.Mvp.WebApi.Api.Controllers
{
    public class AllDataTypeController : DnaOdataController
    {
        private readonly IUnitOfWorkAsync _unitOfWorkAsync;
        private readonly IAllDataTypeService _allDataTypeService;

        public AllDataTypeController(IUnitOfWorkAsync unitOfWorkAsync, IAllDataTypeService domainObjectService)
        {
            _unitOfWorkAsync = unitOfWorkAsync;
            _allDataTypeService = domainObjectService;
        }

        // GET: /AllDataType
        [EnableQuery]
        [CustomAuthorize(ResourceString = "AllDataTypes", Permission = MvpPermissions.Read)]
        public IQueryable<AllDataType> Get()
        {
            return _allDataTypeService.Queryable();
        }

        // GET: /AllDataType(5)
        [EnableQuery]
        [CustomAuthorize(ResourceString = "AllDataTypes", Permission = MvpPermissions.Read)]
        public SingleResult<AllDataType> Get(Guid key)
        {
            var result = SingleResult.Create(_allDataTypeService.Query(t => t.Id == key).Select().AsQueryable());
            
            return result;
        }

        // PUT: /AllDataType(5)
        [CustomAuthorize(ResourceString = "AllDataTypes", Permission = MvpPermissions.Write)]
        public IHttpActionResult Put(Guid key, AllDataType allDataType)
        {
            if (!ModelState.IsValid)
            {
                // return BadRequest(ModelState);
            }
            var isExist = AllDataTypeExists(key);

            if (!isExist)
            {
                return NotFound();
            }

            try
            {
                _allDataTypeService.Update(allDataType);
            }
            catch (Exception ex)
            { 
            }

            try
            {
                _unitOfWorkAsync.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AllDataTypeExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(allDataType);
        }

        // POST: /AllDataType
        [CustomAuthorize(ResourceString = "AllDataTypes", Permission = MvpPermissions.Write)]
        public IHttpActionResult Post(AllDataType AllDataTypes)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _allDataTypeService.Insert(AllDataTypes);
            _unitOfWorkAsync.SaveChanges();

            return Created(AllDataTypes);
        }

        // PATCH: /AllDataType(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [CustomAuthorize(ResourceString = "AllDataTypes", Permission = MvpPermissions.Write)]
        public async Task<IHttpActionResult> Patch(Guid key, Delta<AllDataType> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            AllDataType AllDataTypes = await _allDataTypeService.FindAsync(key);
            if (AllDataTypes == null)
            {
                return NotFound();
            }

            patch.Patch(AllDataTypes);

            try
            {
                await _unitOfWorkAsync.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AllDataTypeExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(AllDataTypes);
        }

        // DELETE: /AllDataType(5)
        [CustomAuthorize(ResourceString = "AllDataTypes", Permission = MvpPermissions.Delete)]
        public IHttpActionResult Delete([FromODataUri] int key)
        {
            AllDataType AllDataTypes = _allDataTypeService.Find(key);
            if (AllDataTypes == null)
            {
                return NotFound();
            }

            _allDataTypeService.Delete(AllDataTypes);
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

        private bool AllDataTypeExists(Guid key)
        {
            return _allDataTypeService.Queryable().Count(e => e.Id == key) > 0;
        }
    }
}
