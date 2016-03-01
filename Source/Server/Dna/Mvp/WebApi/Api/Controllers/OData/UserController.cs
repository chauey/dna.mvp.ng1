using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.OData.Query;
using System.Web.OData;
using Dna.Mvp.WebApi.Api.Authorization;
using Dna.Mvp.WebApi.Api.Controllers.Bases;
using Dna.Mvp.Data.Entities;
using Dna.Mvp.Data.Entities.Enums;
using Dna.Mvp.Services;
using Repository.Pattern.UnitOfWork;

namespace Dna.Mvp.WebApi.Api.Controllers
{
    public class UserController : DnaOdataController
    {
        private readonly IUnitOfWorkAsync _unitOfWorkAsync;
        private readonly IUserService _userService;

        public UserController(IUnitOfWorkAsync unitOfWorkAsync, IUserService userService)
        {
            _unitOfWorkAsync = unitOfWorkAsync;
            _userService = userService;
        }

        // GET: /User
        [EnableQuery]
        [CustomAuthorize(ResourceString = "Users", Permission = MvpPermissions.Read)]
        public IQueryable<User> Get()
        {
            return _userService.Queryable();
        }

        // GET: /User(5)
        [EnableQuery]
        [CustomAuthorize(ResourceString = "Users", Permission = MvpPermissions.Read)]
        public SingleResult<User> Get([FromODataUri] string key)
        {
            var result = SingleResult.Create(_userService.Queryable().Where(t => t.Id == key));
            return result;
        }

        // PUT: /User(5)
        [EnableQuery]
        [CustomAuthorize(ResourceString = "Users", Permission = MvpPermissions.Write)]
        public async Task<IHttpActionResult> Put(string key, User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            key = key.Replace("'", string.Empty);
            if (key != user.Id)
            {
                return BadRequest();
            }

            var emailExists = _userService.Query(x => x.Email == user.Email && x.Id != key && x.Email != null && x.Email != "").Select().Any();
            if (emailExists)
            {
                ModelState.AddModelError("EmailExists", "Email address already exists");
                return BadRequest(ModelState);
            }

            _userService.Update(user);

            try
            {
                await _unitOfWorkAsync.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(key))
                {
                    return NotFound();
                }
                throw;
            }

            return Updated(user);
        }

        // POST: /User
        [EnableQuery]
        [CustomAuthorize(ResourceString = "Users", Permission = MvpPermissions.Write)]
        public async Task<IHttpActionResult> Post(User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var emailExists = _userService.Query(x => x.Email == user.Email).Select().Any();
            if (emailExists)
            {
                ModelState.AddModelError("EmailExists", "Email address already exists");
                return BadRequest(ModelState);
            }

            _userService.Insert(user);

            try
            {
                await _unitOfWorkAsync.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (UserExists(user.Id))
                {
                    return Conflict();
                }
                throw;
            }

            _userService.SendUserCreationEmail(user);

            return Created(user);
        }

        //// PATCH: /User(5)
        [AcceptVerbs("PATCH", "MERGE")]
        [EnableQuery]
        [CustomAuthorize(ResourceString = "Users", Permission = MvpPermissions.Write)]
        public async Task<IHttpActionResult> Patch([FromODataUri] string key, Delta<User> patch)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            object newEmail;
            if (patch.TryGetPropertyValue("Email", out newEmail))
            {
                var emailExists = _userService.Query(x => x.Email == (string)newEmail && x.Id != key).Select().Any();
                if (emailExists)
                {
                    ModelState.AddModelError("EmailExists", "Email address already exists");
                    return BadRequest(ModelState);
                }
            }

            var user = await _userService.FindAsync(key);

            if (user == null)
            {
                return NotFound();
            }

            patch.Patch(user);

            try
            {
                await _unitOfWorkAsync.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(key))
                {
                    return NotFound();
                }
                throw;
            }

            return Updated(user);
        }

        // DELETE: /User(5)
        [EnableQuery]
        [CustomAuthorize(ResourceString = "Users", Permission = MvpPermissions.Delete)]
        public async Task<IHttpActionResult> Delete([FromODataUri] string key)
        {
            var user = await _userService.FindAsync(key);

            if (user == null)
            {
                return NotFound();
            }

            _userService.Delete(user);
            await _unitOfWorkAsync.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        private bool UserExists(string key)
        {
            //return _userService.Query(e => e.Id == key).Select().Any();

            // HACK: To setup for unit testing
            return _userService.Queryable().Any(e => e.Id == key);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _unitOfWorkAsync.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}