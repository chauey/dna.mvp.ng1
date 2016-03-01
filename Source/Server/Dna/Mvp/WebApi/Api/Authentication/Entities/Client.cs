
namespace Dna.Mvp.WebApi.Api.Authentication.Entities
{
    using System.ComponentModel.DataAnnotations;

    // http://bitoftech.net/2014/07/16/enable-oauth-refresh-tokens-angularjs-app-using-asp-net-web-api-2-owin/
    public class Client
    {
        [Key]
        public string Id { get; set; }

        // Secret column is hashed so anyone has an access 
        // to the database will not be able to see the secrets, 
        [Required]
        public string Secret { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        // Application Type column with value (1) means it is Native – Confidential 
        // client which should send the secret once the access token is requested
        public ApplicationTypes ApplicationType { get; set; }

        // Active column is very useful; if the system admin decided 
        // to deactivate this client, so any new requests asking for 
        // access token from this deactivated client will be rejected
        public bool Active { get; set; }

        // Refresh Token Life Time column is used to set when the refresh token 
        // (not the access token) will expire in minutes
        public int RefreshTokenLifeTime { get; set; }

        // Allowed Origin column is used configure CORS and to 
        // set “Access-Control-Allow-Origin” on the back-end API
        [MaxLength(100)]
        public string AllowedOrigin { get; set; }
    }

    // Define the Application Type
    public enum ApplicationTypes
    {
        JavaScript = 0,
        NativeConfidential = 1
    };
}