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
    public class ValidationController : DnaOdataController
    {
        private readonly IUnitOfWorkAsync _unitOfWorkAsync;
        private readonly IValidationService _validationService;

        public ValidationController(IUnitOfWorkAsync unitOfWorkAsync, IValidationService validationService)
        {
            _unitOfWorkAsync = unitOfWorkAsync;
            _validationService = validationService;
        }

        // GET: /Validation
        [EnableQuery]
        [CustomAuthorize(ResourceString = "Validations", Permission = MvpPermissions.Read)]
        public IQueryable<Validation> Get()
        {
            return _validationService.Queryable();
        }

        // GET: /Validation(5)
        [EnableQuery]
        [CustomAuthorize(ResourceString = "Validations", Permission = MvpPermissions.Read)]
        public SingleResult<Validation> Get(Guid key)
        {
            return SingleResult.Create(_validationService.Queryable().Where(Validations => Validations.ValidationID == key));
        }

        // PUT: /Validation(5)        
        [CustomAuthorize(ResourceString = "Validations", Permission = MvpPermissions.Write)]
        public IHttpActionResult Put(Guid key, Validation validation)
        {
            
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var isExist = ValidationExists(key);

            if (!isExist)
            {
                return NotFound();
            }

            _validationService.Update(validation);

            try
            {
                _unitOfWorkAsync.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ValidationExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(validation);
        }

        // POST: /Validation
        [CustomAuthorize(ResourceString = "Validations", Permission = MvpPermissions.Write)]
        public IHttpActionResult Post(Validation Validations)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _validationService.Insert(Validations);
            _unitOfWorkAsync.SaveChanges();

            return Created(Validations);
        }

        // PATCH: /Validation(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [CustomAuthorize(ResourceString = "Validations", Permission = MvpPermissions.Write)]
        public IHttpActionResult Patch(Guid key, Delta<Validation> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Validation Validations = _validationService.Find(key);
            if (Validations == null)
            {
                return NotFound();
            }

            patch.Patch(Validations);

            try
            {
                _unitOfWorkAsync.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ValidationExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(Validations);
        }

        // DELETE: /Validation(5)
        [CustomAuthorize(ResourceString = "Validations", Permission = MvpPermissions.Delete)]
        public IHttpActionResult Delete(Guid key)
        {
            Validation Validations = _validationService.Find(key);
            if (Validations == null)
            {
                return NotFound();
            }

            _validationService.Delete(Validations);
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

        private bool ValidationExists(Guid key)
        {
            return _validationService.Queryable().Count(e => e.ValidationID == key) > 0;
        }
    }
}
