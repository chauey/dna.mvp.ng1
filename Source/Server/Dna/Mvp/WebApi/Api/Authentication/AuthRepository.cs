using Dna.Mvp.WebApi.Api.Models;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Dna.Mvp.WebApi.Api.Authentication
{
    using Dna.Mvp.WebApi.Api.Authentication.Entities;

    using Microsoft.AspNet.Identity;

    public class AuthRepository : IDisposable
    {
        private AuthContext _ctx;

        // We are depending on the “UserManager” that provides the domain logic for working with user information
        // The “UserManager” knows when to hash a password, how and when to validate a user, and how to manage claims
        // Read more: http://odetocode.com/blogs/scott/archive/2014/01/20/implementing-asp-net-identity.aspx
        private UserManager<IdentityUser> _userManager;
        private RoleManager<IdentityRole> _roleManager;

        public AuthRepository()
        {
            _ctx = new AuthContext();
            _userManager = new UserManager<IdentityUser>(new UserStore<IdentityUser>(_ctx));
            _roleManager = new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(_ctx));
        }

        public async Task<IdentityResult> RegisterUser(AccountBindingModel registerBindingModel)
        {
            IdentityUser user = new IdentityUser
            {
                UserName = registerBindingModel.UserName,
                Email = registerBindingModel.Email
            };

            var result = await _userManager.CreateAsync(user, registerBindingModel.Password);

            return result;
        }

        public async Task<IdentityUser> FindByUsername(string username)
        {
            IdentityUser user = await _userManager.FindByNameAsync(username);
            return user;
        } 

        public async Task<IdentityUser> FindUser(string userName, string password)
        {
            IdentityUser user = await _userManager.FindAsync(userName, password);

            return user;
        }

        public async Task<IdentityRole> FindRole(string roleId)
        {
            IdentityRole role = _roleManager.FindById(roleId);
                //return Task.FromResult<IdentityRole>(null);
                
           
            return role;
        }

        #region Support manipulating the Client and Refresh tables
        public Client FindClient(string clientId)
        {
            var client = _ctx.Clients.Find(clientId);

            return client;
        }

        public async Task<bool> AddRefreshToken(RefreshToken token)
        {

            var existingToken = _ctx.RefreshTokens.SingleOrDefault(
                r => r.Subject == token.Subject && r.ClientId == token.ClientId);

            if (existingToken != null)
            {
                var result = await RemoveRefreshToken(existingToken);
            }

            _ctx.RefreshTokens.Add(token);

            return await _ctx.SaveChangesAsync() > 0;
        }

        public async Task<bool> RemoveRefreshToken(string refreshTokenId)
        {
            var refreshToken = await _ctx.RefreshTokens.FindAsync(refreshTokenId);

            if (refreshToken != null)
            {
                _ctx.RefreshTokens.Remove(refreshToken);
                return await _ctx.SaveChangesAsync() > 0;
            }

            return false;
        }

        public async Task<bool> RemoveRefreshToken(RefreshToken refreshToken)
        {
            _ctx.RefreshTokens.Remove(refreshToken);
            return await _ctx.SaveChangesAsync() > 0;
        }

        public async Task<RefreshToken> FindRefreshToken(string refreshTokenId)
        {
            var refreshToken = await _ctx.RefreshTokens.FindAsync(refreshTokenId);

            return refreshToken;
        }

        public List<RefreshToken> GetAllRefreshTokens()
        {
            return _ctx.RefreshTokens.ToList();
        }
        #endregion

        #region Open Authentication
        // Find external social user account
        public async Task<IdentityUser> FindAsync(UserLoginInfo loginInfo)
        {
            IdentityUser user = await _userManager.FindAsync(loginInfo);

            return user;
        }

        // Create the user without password
        public async Task<IdentityResult> CreateAsync(IdentityUser user)
        {
            var result = await _userManager.CreateAsync(user);

            return result;
        }

        // Link external social user account with local database account
        public async Task<IdentityResult> AddLoginAsync(string userId, UserLoginInfo login)
        {
            var result = await _userManager.AddLoginAsync(userId, login);

            return result;
        }
        #endregion Open Authentication

        public void Dispose()
        {
            _ctx.Dispose();
            _userManager.Dispose();

        }
    }
}