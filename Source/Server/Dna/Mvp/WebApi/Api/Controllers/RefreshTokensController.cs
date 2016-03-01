using System.Web.Http;

namespace Dna.Mvp.Controllers
{
    using Dna.Mvp.WebApi.Api.Authentication;
    using System.Threading.Tasks;

    // Revoking Refresh Tokens: delete the refresh token record from table “RefreshTokens” 
    // and once the user tries to request new access token using the deleted refresh token,
    // it will fail and he needs to authenticate again using his username/password 
    // in order to obtain new access token and refresh token. 
    [RoutePrefix("api/RefreshTokens")]
    public class RefreshTokensController : ApiController
    {

        private AuthRepository _repo = null;

        public RefreshTokensController()
        {
            _repo = new AuthRepository();
        }

        [Authorize(Users = "Admin")]
        [Route("")]
        public IHttpActionResult Get()
        {
            return Ok(_repo.GetAllRefreshTokens());
        }

        //[Authorize(Users = "Admin")]
        [AllowAnonymous]
        [Route("")]
        public async Task<IHttpActionResult> Delete(string tokenId)
        {
            var result = await _repo.RemoveRefreshToken(tokenId);
            if (result)
            {
                return Ok();
            }
            return BadRequest("Token Id does not exist");

        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _repo.Dispose();
            }

            base.Dispose(disposing);
        }
    }
}
