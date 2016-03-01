using System.Web.OData;
using Dna.Mvp.WebApi.Api.ActionResults;
using Dna.Mvp.WebApi.Api.Authorization;
using Repository.Pattern.UnitOfWork;

namespace Dna.Mvp.WebApi.Api.Controllers.Bases
{
    public class DnaOdataController : ODataController
    {
        private readonly ICurrentUserResolver _currentUserRespResolver;
        //public DnaOdataController(IUnitOfWorkAsync unitOfWorkAsync, ICurrentUserResolver userResolver)
        //{
        //    var systemId = userResolver.GetCurrentUserSystemAccountId();
        //    if (systemId.HasValue)
        //    {
        //        unitOfWorkAsync.EnableGlobalFilter("SystemAccount", "SystemAccountId", systemId.Value);
        //        unitOfWorkAsync.EnableGlobalFilter("DocumentAccess", "SystemAccountId", systemId.Value);
        //    }

        //    _currentUserRespResolver = userResolver;
        //}

        /// <summary>
        /// Gets the user id for the current user
        /// </summary>
        /// <returns>integer id for the current user</returns>
        public int? GetCurrentUserId()
        {
            return _currentUserRespResolver.GetCurrentUserId();
        }

        public NotFoundPlainTextActionResult NotFound(string message)
        {
            return new NotFoundPlainTextActionResult(Request, message);
        }

        public ForbiddenPlainTextActionResult Forbidden()
        {
            return new ForbiddenPlainTextActionResult(Request, "You do not have the required permissions to perform the action");
        }

        public ForbiddenPlainTextActionResult Forbidden(string message)
        {
            return new ForbiddenPlainTextActionResult(Request, message);
        }
    }
}