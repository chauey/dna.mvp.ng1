using Dna.Mvp.WebApi.Api.Authentication.Entities;
using Microsoft.Owin.Security.DataHandler.Encoder;
using System;
using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace Dna.Mvp.WebApi.Api.Authentication.Models
{
    public static class AudiencesStore
    {
        public static ConcurrentDictionary<string, Audience> AudiencesList = new ConcurrentDictionary<string, Audience>();

        static AudiencesStore()
        {
            // HACK: Add current Resource Server with key (We should store these information somewhere)
            AudiencesList.TryAdd("86b6477804ce4ec8b3a17c775160b346",
                                new Audience
                                {
                                    ClientId = "86b6477804ce4ec8b3a17c775160b346",
                                    Base64Secret = "4BP724M_er2aAPVklcHzl_tCruUOFCdzFEtiJmrB1lY",
                                    Name = "Mvp App"
                                });
        }

        public static Audience AddAudience(string name)
        {
            var clientId = Guid.NewGuid().ToString("N");

            var key = new byte[32];
            RNGCryptoServiceProvider.Create().GetBytes(key);
            var base64Secret = TextEncodings.Base64Url.Encode(key);

            Audience newAudience = new Audience { ClientId = clientId, Base64Secret = base64Secret, Name = name };
            AudiencesList.TryAdd(clientId, newAudience);
            return newAudience;
        }

        public static Audience FindAudience(string clientId)
        {
            Audience audience = null;
            if (AudiencesList.TryGetValue(clientId, out audience))
            {
                return audience;
            }
            return null;
        }
    }
}