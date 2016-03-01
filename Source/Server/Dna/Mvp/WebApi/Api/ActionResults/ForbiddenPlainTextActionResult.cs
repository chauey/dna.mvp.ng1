using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;

namespace Dna.Mvp.WebApi.Api.ActionResults
{
    public class ForbiddenPlainTextActionResult : IHttpActionResult
    {
        public ForbiddenPlainTextActionResult(HttpRequestMessage request, string message)
        {
            Request = request;
            Message = message;
        }

        public string Message { get; private set; }
        public HttpRequestMessage Request { get; private set; }

        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            return Task.FromResult(ExecuteResult());
        }

        public HttpResponseMessage ExecuteResult()
        {
            var response = new HttpResponseMessage(HttpStatusCode.Forbidden);

            response = Request.CreateErrorResponse(HttpStatusCode.Forbidden, new Exception(Message).Message);
            response.RequestMessage = Request;
            return response;
        }
    }
}