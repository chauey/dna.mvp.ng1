using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace A3.Utilities
{
  public  static class EncryptionUtiliy
    {
        const string HASH_KEY = "M00nlight!";
        const int URL_TTL_SEC = 300; // 5 minutes		

        public static string Encrypt(string valueToEncrypt, string key)
        {
            try
            {
                TripleDESCryptoServiceProvider tripleDesCryptoServiceProvider =
                    new TripleDESCryptoServiceProvider();
                MD5CryptoServiceProvider md5CryptoServiceProvider = new MD5CryptoServiceProvider();
                byte[] byteHash, byteBuff;
                string strTempKey = key;
                byteHash = md5CryptoServiceProvider.ComputeHash(ASCIIEncoding.ASCII.GetBytes(strTempKey));
                tripleDesCryptoServiceProvider.Key = byteHash;
                tripleDesCryptoServiceProvider.Mode = CipherMode.ECB; //CBC, CFB
                byteBuff = ASCIIEncoding.ASCII.GetBytes(valueToEncrypt);
                return Convert.ToBase64String(tripleDesCryptoServiceProvider.CreateEncryptor().
                    TransformFinalBlock(byteBuff, 0, byteBuff.Length));
            }
            catch (Exception ex)
            {
                return "Wrong Input. " + ex.Message;
            }
        }

        public static string Decrypt(string valueEncrypted, string key)
        {
            try
            {
                TripleDESCryptoServiceProvider tripleDesCryptoServiceProvider =
                    new TripleDESCryptoServiceProvider();
                MD5CryptoServiceProvider md5CryptoServiceProvider = new MD5CryptoServiceProvider();
                byte[] byteHash, byteBuff;
                string strTempKey = key;
                byteHash = md5CryptoServiceProvider.ComputeHash(ASCIIEncoding.ASCII.GetBytes(strTempKey));
                tripleDesCryptoServiceProvider.Key = byteHash;
                tripleDesCryptoServiceProvider.Mode = CipherMode.ECB; //CBC, CFB
                byteBuff = Convert.FromBase64String(valueEncrypted);
                string valueDecrypted = ASCIIEncoding.ASCII.GetString
                (tripleDesCryptoServiceProvider.CreateDecryptor().TransformFinalBlock
                (byteBuff, 0, byteBuff.Length));
                return valueDecrypted;
            }
            catch (Exception ex)
            {
                return "Wrong Input. " + ex.Message;
            }
        }
    }
}
