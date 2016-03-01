using Dna.Mvp.WebApi.Api.Authentication.Entities;
using Dna.Mvp.WebApi.Api.Authentication.Models;
using System.Web.Http;

namespace Dna.Mvp.Controllers
{
    [RoutePrefix("api/audience")]
    public class AudienceController : ApiController
    {
        [Route("")]
        public IHttpActionResult Post(AudienceModel audienceModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Audience newAudience = AudiencesStore.AddAudience(audienceModel.Name);

            return Ok<Audience>(newAudience);

        }
    }
}