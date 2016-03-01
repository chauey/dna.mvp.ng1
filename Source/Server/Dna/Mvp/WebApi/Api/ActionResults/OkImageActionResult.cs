using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;

namespace A3.Api.ActionResults
{
    public class OkImageActionResult : IHttpActionResult
    {
        public OkImageActionResult(HttpRequestMessage request, string fileEncodeString,string fileName,string fileType)
        {
            Request = request;
            FileEncodeString = fileEncodeString;
            FileName = fileName;
            FileType = fileType;
        }

        public string FileEncodeString { get; private set; }
        public HttpRequestMessage Request { get; private set; }
        public  string FileName { get; private set; }
        public string FileType { get; set; }

        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            return Task.FromResult(ExecuteResult());
        }

        public HttpResponseMessage ExecuteResult()
        {
            var result = Request.CreateResponse(HttpStatusCode.OK);
            result.Content = new StringContent("data:image/" + FileType + ";base64," + FileEncodeString);
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
            result.Content.Headers.ContentDisposition.FileName = FileName;

            return result;
        }
    }
}