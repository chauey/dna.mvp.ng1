using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;

namespace Dna.Mvp.WebApi.Api.ActionResults
{
    public class FileStreamResult : IHttpActionResult
    {
        private readonly string _contentType;
        private readonly string _fileName;
        private readonly byte[] _fileStream;

        public FileStreamResult(byte[] fileStream, string contentType, string fileName)
        {
            this._fileStream = fileStream;
            this._contentType = contentType;
            this._fileName = fileName;
        }

        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            return Task.Run(() =>
            {
                HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);

                response.Content = new StringContent("data:" + this._contentType + ";base64," + Convert.ToBase64String(this._fileStream));
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(_contentType);
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
                response.Content.Headers.ContentDisposition.FileName = this._fileName;
                return response;
            }, cancellationToken);
        }
    }
}
