using System;

namespace Dna.Mvp.WebApi.Api.Authentication.Providers
{
    using Dna.Mvp.WebApi.Api.Authentication.Entities;
    using Microsoft.Owin.Security.Infrastructure;
    using System.Threading.Tasks;

    // Generating the Refresh Token and Persisting it:
    // Generate the Refresh Token and Store it in our database inside the table “RefreshTokens”
    public class SimpleRefreshTokenProvider : IAuthenticationTokenProvider
    {
        public void Create(AuthenticationTokenCreateContext context)
        {
            throw new NotImplementedException();
        }

        public async Task CreateAsync(AuthenticationTokenCreateContext context)
        {
            var clientid = context.Ticket.Properties.Dictionary["as:client_id"];

            if (string.IsNullOrEmpty(clientid))
            {
                return;
            }

            // 1. Generate a unique identifier for the refresh token
            var refreshTokenId = Guid.NewGuid().ToString("n");

            using (AuthRepository _repo = new AuthRepository())
            {
                // 2. Read the refresh token life time (in minutes) value from the Owin context 
                // where we set this value once we validate the client
                var refreshTokenLifeTime = context.OwinContext.Get<string>("as:clientRefreshTokenLifeTime");

                // 3. Set the IssuedUtc, and ExpiresUtc values for the ticket, 
                // to determine how long the refresh token will be valid for
                var token = new RefreshToken()
                {
                    Id = Helper.GetHash(refreshTokenId),
                    ClientId = clientid,
                    Subject = context.Ticket.Identity.Name,
                    IssuedUtc = DateTime.UtcNow,
                    ExpiresUtc = DateTime.UtcNow.AddMinutes(Convert.ToDouble(refreshTokenLifeTime))
                };

                context.Ticket.Properties.IssuedUtc = token.IssuedUtc;
                context.Ticket.Properties.ExpiresUtc = token.ExpiresUtc;

                // 4. Serialize the ticket content and we’ll be able to 
                // store this magical serialized string on the database.
                token.ProtectedTicket = context.SerializeTicket();

                // 5. Build a token record which will be saved in RefreshTokens table.
                // (Note that we check the token which will be saved on the database is
                // unique for this Subject (User) and the Client, if it not unique,
                // we’ll delete the existing one and store new refresh token. 
                // It is better to hash the refresh token identifier before storing it, 
                // so if anyone has access to the database he’ll not see the real refresh tokens.)
                var result = await _repo.AddRefreshToken(token);

                if (result)
                {
                    // 6. Lastly we will send back the refresh token id 
                    // (without hashing it) in the response body
                    context.SetToken(refreshTokenId);
                }

            }
        }

        public void Receive(AuthenticationTokenReceiveContext context)
        {
            throw new NotImplementedException();
        }

        public async Task ReceiveAsync(AuthenticationTokenReceiveContext context)
        {
            // 1. Set the “Access-Control-Allow-Origin” header by getting the value from Owin Context
            var allowedOrigin = context.OwinContext.Get<string>("as:clientAllowedOrigin");
            context.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] { allowedOrigin });

            // 2. Get the refresh token id from the request and hash this id 
            // and look for this token using the hashed refresh token id in table “RefreshTokens”
            string hashedTokenId = Helper.GetHash(context.Token);

            using (AuthRepository _repo = new AuthRepository())
            {
                // use the magical signed string which contains a serialized representation for the ticket 
                // to build the ticket and identities for the user mapped to this refresh token
                var refreshToken = await _repo.FindRefreshToken(hashedTokenId);

                if (refreshToken != null)
                {
                    // Get protectedTicket from refreshToken class
                    context.DeserializeTicket(refreshToken.ProtectedTicket);
                    // 3. Remove the existing refresh token from tables “RefreshTokens” because 
                    // in our logic we are allowing only one refresh token per user and client
                    var result = await _repo.RemoveRefreshToken(hashedTokenId);
                }
            }
        }
    }
}