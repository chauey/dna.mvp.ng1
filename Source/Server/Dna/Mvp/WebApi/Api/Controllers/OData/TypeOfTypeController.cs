using Dna.Mvp.Data.Entities;
using Dna.Mvp.Data.Entities.Enums;
using Dna.Mvp.Services;
using Dna.Mvp.WebApi.Api.Authorization;
using Dna.Mvp.WebApi.Api.Controllers.Bases;
using Repository.Pattern.UnitOfWork;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.OData;

namespace Dna.Mvp.WebApi.Api.Controllers
{
    public class TypeOfTypeController : DnaOdataController
    {
        private readonly IUnitOfWorkAsync _unitOfWorkAsync;
        private readonly ITypeOfTypeService _typeOfTypeService;

        public TypeOfTypeController(IUnitOfWorkAsync unitOfWorkAsync, ITypeOfTypeService typeOfTypeService)
        {
            _unitOfWorkAsync = unitOfWorkAsync;
            _typeOfTypeService = typeOfTypeService;
        }

        // GET: /AccessControlListItem
        [EnableQuery]
        [CustomAuthorize(ResourceString = "TypeOfTypes", Permission = MvpPermissions.Read)]
        public IQueryable<TypeOfType> Get()
        {
            var result = this._unitOfWorkAsync.RepositoryAsync<TypeOfType>().Queryable();
            return result;
        }

        // GET: /AccessControlListItem(5)
        [EnableQuery]
        [AllowAnonymous]
        [CustomAuthorize(ResourceString = "TypeOfTypes", Permission = MvpPermissions.Read)]
        public SingleResult<TypeOfType> Get(Guid key)
        {
            // Create New
            if (key == Guid.Empty)
            {
                var newTypeOfType = new List<TypeOfType>
                {
                    new TypeOfType
                    {
                        TypeOfTypeID =  Guid.NewGuid(),
                        Name = string.Empty,
                        Abbreviation = string.Empty,
                        CreatedDate = DateTime.Now
                    }
                }.AsQueryable();

                return SingleResult.Create(newTypeOfType);
            }

            var result =
                this._unitOfWorkAsync.RepositoryAsync<TypeOfType>().Queryable().Where(tot => tot.TypeOfTypeID == key);

            //IQueryable<TypeOfType> result = this._typeOfTypeService.Queryable().Where(tot => tot.TypeOfTypeID == key);
            return SingleResult.Create(result);
        }

        [AllowAnonymous]
        // PUT: /AccessControlListItem(5)
        [CustomAuthorize(ResourceString = "TypeOfTypes", Permission = MvpPermissions.Write)]
        public async Task<IHttpActionResult> Put(Guid key, TypeOfType patch)
        {
            //Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // only count to check if there is any record that has the key.
            // Don't try to get/select an entity from that key.
            // It'll change the entity's state and throw an error when updating
            bool isExist = this.TypeOfTypeExists(key);
            if (!isExist)
            {
                return NotFound();
            }

            //patch.Put(typeOfType);

            try
            {
                this._typeOfTypeService.Update(patch);
                await _unitOfWorkAsync.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TypeOfTypeExists(key))
                {
                    return NotFound();
                }

                throw;
            }

            return Updated(patch);
        }

        [AllowAnonymous]
        // POST: /AccessControlListItem
        [CustomAuthorize(ResourceString = "TypeOfTypes", Permission = MvpPermissions.Write)]
        public async Task<IHttpActionResult> Post(TypeOfType item)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _typeOfTypeService.Insert(item);
                await _unitOfWorkAsync.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw;
            }

            return Created(item);
        }

        // PATCH: /AccessControlListItem(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [CustomAuthorize(ResourceString = "TypeOfTypes", Permission = MvpPermissions.Write)]
        public IHttpActionResult Patch(Guid key, Delta<TypeOfType> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            TypeOfType item = _typeOfTypeService.Find(key);
            if (item == null)
            {
                return NotFound();
            }

            patch.Patch(item);

            try
            {
                _unitOfWorkAsync.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TypeOfTypeExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(item);
        }

        // DELETE: /AccessControlListItem(5)
        [CustomAuthorize(ResourceString = "TypeOfTypes", Permission = MvpPermissions.Delete)]
        public IHttpActionResult Delete(Guid key)
        {
            TypeOfType item = _typeOfTypeService.Find(key);
            if (item == null)
            {
                return NotFound();
            }

            _typeOfTypeService.Delete(item);
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

        private bool TypeOfTypeExists(Guid key)
        {
            return _typeOfTypeService.Queryable().Count(e => e.TypeOfTypeID == key) > 0;
        }
    }
}