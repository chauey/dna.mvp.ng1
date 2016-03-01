using Dna.Mvp.Data.Entities;
using Dna.Mvp.WebApi.Api.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using System.Web.Script.Serialization;

namespace Dna.Mvp.Controllers
{
    public class FileController : ApiController
    {
        private readonly JavaScriptSerializer _js = new JavaScriptSerializer { MaxJsonLength = 41943040 };
        //private readonly string _storageRoot = HttpContext.Current.Server.MapPath(ConfigurationManager.AppSettings["FileUploadPath"]);
        private readonly string _storageRoot;
        private MvpContext dbContext = new MvpContext();

        public FileController()
        {
            _storageRoot = HostingEnvironment.MapPath(ConfigurationManager.AppSettings["FileUploadPath"]);
            if (_storageRoot == null)
            {
                var uriPath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().GetName().CodeBase);
                _storageRoot = new Uri(uriPath).LocalPath + "/" + ConfigurationManager.AppSettings["FileUploadPath"];
            }
        }

        [HttpPost]
        public HttpResponseMessage Post()
        {
            return UploadFile(HttpContext.Current);
        }

        [HttpPut]
        public HttpResponseMessage Put()
        {
            return UploadFile(HttpContext.Current);
        }

        private HttpResponseMessage UploadFile(HttpContext context)
        {
            var statuses = new List<FilesStatus>();
            var headers = context.Request.Headers;

            string userID = context.Request["userID"];
            string isNew = context.Request["isNew"];

            if (!string.IsNullOrEmpty(userID))
            {
                UploadUserImage(userID, bool.Parse(isNew), headers["X-File-Name"], context);
            }
            else
            {
                if (string.IsNullOrEmpty(headers["X-File-Name"]))
                {
                    UploadWholeFile(context, statuses);
                }
                else
                {
                    UploadPartialFile(headers["X-File-Name"], context, statuses);
                }
            }

            return WriteJsonIframeSafe(context, statuses);
        }

        private HttpResponseMessage WriteJsonIframeSafe(HttpContext context, List<FilesStatus> statuses)
        {
            context.Response.AddHeader("Vary", "Accept");
            var response = new HttpResponseMessage()
            {
                Content = new StringContent(_js.Serialize(statuses.ToArray()))
            };
            if (context.Request["HTTP_ACCEPT"].Contains("application/json"))
            {
                response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            }
            else
            {
                response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
            }
            return response;
        }

        // Upload user image 
        private void UploadUserImage(string userID, bool isNew, string filename, HttpContext context)
        {
            if (context.Request.Files.Count == 1)
            {
                // Check and remove old image
                if (!isNew)
                {
                    User currentUser = dbContext.Users.FirstOrDefault(p => p.Id == userID);

                    if (currentUser != null && !string.IsNullOrEmpty(currentUser.PhotoUrl))
                    {
                        string oldPath = Path.Combine(this._storageRoot, currentUser.PhotoUrl);

                        // Remove exited file
                        if (System.IO.File.Exists(oldPath))
                        {
                            System.IO.File.Delete(oldPath);
                        }
                    }
                }

                var file = context.Request.Files[0];
                string fullName = Path.GetFileName(file.FileName);
                string fullPath = this._storageRoot + fullName;

                Directory.CreateDirectory(this._storageRoot);
                file.SaveAs(fullPath);

                dbContext.SaveChangesAsync();
            }
        }

        // Upload partial file
        private void UploadPartialFile(string fileName, HttpContext context, List<FilesStatus> statuses)
        {
            if (context.Request.Files.Count != 1) throw new HttpRequestValidationException("Attempt to upload chunked file containing more than one fragment per request");
            var inputStream = context.Request.Files[0].InputStream;

            //_cloudBlobManager.StoreFileInAzureStorage(Settings.RootContainerName, fileName, inputStream);
        }

        // Upload entire file
        private void UploadWholeFile(HttpContext context, List<FilesStatus> statuses)
        {
            for (int i = 0; i < context.Request.Files.Count; i++)
            {
                var file = context.Request.Files[i];
                string fullName = Path.GetFileName(file.FileName);
                string fullPath = this._storageRoot + fullName;

                Directory.CreateDirectory(this._storageRoot);
                file.SaveAs(fullPath);

                statuses.Add(new FilesStatus(fullName, file.ContentLength));

                this.SaveFileToDb(file, fullName);
            }

            dbContext.SaveChangesAsync();
        }

        private void SaveFileToDb(HttpPostedFile file, string fullName)
        {
            // Save file into database
            var memoryStream = new MemoryStream();
            file.InputStream.CopyTo(memoryStream);
            memoryStream.Flush();

            Attachment attachment = new Attachment();
            attachment.AttachmentID = Guid.NewGuid();
            attachment.CreateBy = Guid.Empty;
            attachment.CreatedDate = DateTime.Now;
            attachment.DisplayOrder = 0;
            attachment.FileContent = memoryStream.ToArray();
            attachment.FileName = fullName;
            attachment.FilePath = "/" + fullName;
            attachment.IsActive = true;

            dbContext.Attachments.Add(attachment);
        }
    }
}