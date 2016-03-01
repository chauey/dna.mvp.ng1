using System.Collections.Generic;


#region generated codes

using Dna.Mvp.Data.Entities;
using Newtonsoft.Json.Linq;
using System;
using System.Web.Http;

namespace Dna.Mvp.Controllers
{
    //[RequireHttps]
    //[Authorize]
    [AllowAnonymous]
    public class HomeController : ApiController
    {
        [HttpGet]
        [AllowAnonymous]
        public IEnumerable<string> GetAllHome()
        {
            return new List<string>(){"aa"};
        }

        [HttpPost]
        public void WriteAuditLog(JObject jParameter)
        {
            try
            {
                dynamic auditLogDynamic = jParameter;
                AuditLog auditLog = new AuditLog();
                MvpContext dataContext = new MvpContext();

                auditLog.OldData = auditLogDynamic.OldData != null ? auditLogDynamic.OldData.ToString() : string.Empty;
                auditLog.NewData = auditLogDynamic.NewData != null ? auditLogDynamic.NewData.ToString() : string.Empty;
                auditLog.TableIdValue = auditLogDynamic.TableIdValue != null ? auditLogDynamic.TableIdValue.ToString() : string.Empty;
                auditLog.TableName = auditLogDynamic.TableName != null ? auditLogDynamic.TableName.ToString() : string.Empty;
                auditLog.What = auditLogDynamic.What != null ? auditLogDynamic.What.ToString() : string.Empty;
                auditLog.When = auditLogDynamic.When != null ? DateTime.Parse(auditLogDynamic.When.ToString()) : DateTime.UtcNow;
                auditLog.Who = Guid.Empty; // UNDONE: Need to get logged in user ID

                dataContext.AuditLogs.Add(auditLog);
                dataContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log error
                Elmah.ErrorSignal.FromCurrentContext().Raise(ex);
            }
        }

        //public ActionResult Index()
        //{
        //    return View();
        //}

        //public ActionResult About()
        //{
        //    ViewBag.Message = "Your application description page.";

        //    return View();
        //}

        //public ActionResult Contact()
        //{
        //    ViewBag.Message = "Your contact page.";

        //    return View();
        //}
    }
}
#endregion