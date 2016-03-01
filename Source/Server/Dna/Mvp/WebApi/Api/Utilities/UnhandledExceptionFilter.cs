using System.Net;
using System.Net.Http;
using System.Web.Http.Filters;
using log4net;

namespace Dna.Mvp.WebApi.Api.Utilities
{
    public class UnhandledExceptionFilter : ExceptionFilterAttribute
    {
        private static readonly ILog log = LogManager.GetLogger("A3 Logging");

        public override void OnException(HttpActionExecutedContext context)
        {
#if DEBUG
            var response = context.Request.CreateErrorResponse(HttpStatusCode.InternalServerError, context.Exception);
#else
            var response = context.Request.CreateErrorResponse(HttpStatusCode.InternalServerError, context.Exception.Message);

#endif

            context.Response = response;

            // We use Error for UnhandledException
            log.Error("Server UnhandledException logging", context.Exception);
        }
    }
}