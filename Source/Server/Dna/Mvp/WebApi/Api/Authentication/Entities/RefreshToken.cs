using System;

namespace Dna.Mvp.WebApi.Api.Authentication.Entities
{
    using System.ComponentModel.DataAnnotations;

    // Store the refresh tokens
    // http://bitoftech.net/2014/07/16/enable-oauth-refresh-tokens-angularjs-app-using-asp-net-web-api-2-owin/
    public class RefreshToken
    {
        // Id column contains hashed value of the refresh token id
        [Key]
        public string Id { get; set; }

        // Subject column indicates to which user this 
        // refresh token belongs, and the same applied for Client Id column
        [Required]
        [MaxLength(50)]
        public string Subject { get; set; }
        [Required]
        [MaxLength(50)]
        public string ClientId { get; set; }

        // Issued UTC and Expires UTC columns are for displaying purpose only
        public DateTime IssuedUtc { get; set; }
        public DateTime ExpiresUtc { get; set; }

        // Protected Ticket column contains magical signed string which contains
        // a serialized representation for the ticket for specific user, 
        // in other words it contains all the claims and ticket properties for this user
        [Required]
        public string ProtectedTicket { get; set; }
    }
}