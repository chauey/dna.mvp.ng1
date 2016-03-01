using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;

namespace Dna.Mvp.WebApi.Api.ActionResults
{
    public class ErrorResult : IHttpActionResult
    {

        public string Message { get; private set; }
        public HttpRequestMessage Request { get; private set; }
        public HttpStatusCode StatusCode { get; private set; }
        public ErrorResult(HttpRequestMessage request, string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest)
        {
            Request = request;
            Message = message;
            StatusCode = statusCode;
        }


        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            return Task.FromResult(ExecuteResult());
        }

        public HttpResponseMessage ExecuteResult()
        {
            var response = new HttpResponseMessage();

            if (!string.IsNullOrWhiteSpace(Message))
                response = Request.CreateErrorResponse(StatusCode, new Exception(Message).Message);

            response.RequestMessage = Request;
            return response;
        }
    }
}