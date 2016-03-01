using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Results;
using Dna.Mvp.WebApi.Api.Authentication;
using Dna.Mvp.WebApi.Api.Models;
using Dna.Mvp.Data.Entities;
using Dna.Mvp.Data.Repository;
using Dna.Mvp.Data.Repository.Repositories;
using Dna.Mvp.Results;
using Dna.Mvp.Web.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json.Linq;
using Stripe;

namespace Dna.Mvp.WebApi.Api.Controllers
{
    //[RequireHttps]
    [RoutePrefix("/Lookup")]
    public class LookupController : ApiController
    {
        public LookupController()
        {

        }
    }
}
