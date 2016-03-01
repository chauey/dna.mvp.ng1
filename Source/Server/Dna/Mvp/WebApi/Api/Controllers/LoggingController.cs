using Dna.Mvp.WebApi.Api.Authorization;
using Dna.Mvp.WebApi.Api.Controllers.Bases;
using Dna.Utilities;
using Repository.Pattern.UnitOfWork;
using System;
using System.Threading.Tasks;
using System.Web.Http;

namespace Dna.Mvp.WebApi.Api.Controllers
{
    public class LoggingController : DnaApiController
    {
        public LoggingController(IUnitOfWorkAsync uow, ICurrentUserResolver currentUserResolver)
            : base (uow, currentUserResolver)
        {
        }

        [CustomAuthorize(BypassValidation = true)]
        [HttpPost]
        public async Task<IHttpActionResult> WriteLog()
        {
            var errorResultValue = await Request.Content.ReadAsStringAsync();

            LoggingExceptionUtility.Log(ExceptionType.Error, new Exception(errorResultValue), false);
            return Ok();
        }
    }
}