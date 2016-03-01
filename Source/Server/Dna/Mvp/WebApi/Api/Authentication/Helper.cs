using System;

namespace Dna.Mvp.WebApi.Api.Authentication
{
    using System.Security.Cryptography;

    public class Helper
    {
        // Hash refresh tokens
        public static string GetHash(string input)
        {
            HashAlgorithm hashAlgorithm = new SHA256CryptoServiceProvider();
            byte[] byteValue = System.Text.Encoding.UTF8.GetBytes(input);
            byte[] byteHash = hashAlgorithm.ComputeHash(byteValue);
            return Convert.ToBase64String(byteHash);
        }
    }
}