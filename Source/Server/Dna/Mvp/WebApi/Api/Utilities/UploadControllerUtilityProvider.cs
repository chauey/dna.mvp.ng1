using System;
using System.IO;
using System.Linq;

namespace Dna.Mvp.WebApi.Api.Utilities
{
    public interface IUploadUtilityProvider
    {
        /// <summary>
        ///     Returns true if the file name's extension is included in the array of allowable extensions
        /// </summary>
        /// <param name="fileName">Name of file including the extension</param>
        /// <param name="allowedExtensions">Allowed extensions must contain the dot. Example: ".png"</param>
        /// <returns>True if extension is allowed</returns>
        bool IsExtensionAllowed(string fileName, string[] allowedExtensions);

        /// <summary>
        ///     Creates a unique filename by prepending GUID + "_" to the original filename
        /// </summary>
        /// <param name="originalFileName">Original filename to make unique</param>
        /// <returns>Unique filename as a string</returns>
        string CreateUniqueFileName(string originalFileName);

        /// <summary>
        ///     Creates a unique filename for a thumnail image of a file
        /// </summary>
        /// <param name="originalFileName">Original filename to make unique</param>
        /// <returns>Unique filename as a string</returns>
        string CreateUniqueFileNameForThumbnail(string originalFileName);

        /// <summary>
        ///     Returns true if the size of the byte array (in MB) exceeds the specified max size MB
        /// </summary>
        /// <param name="bytes">Bytes to check size</param>
        /// <param name="MaxProfileImageSizeMB">Maximum size allowed in MB</param>
        /// <returns>True exceeds max size</returns>
        bool IsFileLargerThan(byte[] bytes, int maxSizeMb);
    }

    public class UploadUtilityProvider : IUploadUtilityProvider
    {
        public string[] ProfileImageAcceptedFileTypes { get; set; }

        public bool IsExtensionAllowed(string fileName, string[] allowedExtensions)
        {
            if (string.IsNullOrEmpty(fileName))
                throw new ArgumentException("fileName");

            if (allowedExtensions == null || !allowedExtensions.Any() ||
                !allowedExtensions.All(x => x.StartsWith(".")) || !allowedExtensions.All(x => x.Length > 2))
                throw new ArgumentException("allowedExtensions");

            var fileExtension = Path.GetExtension(fileName).ToLower();
            return allowedExtensions.Contains(fileExtension);
        }

        public string CreateUniqueFileName(string originalFileName)
        {
            if (string.IsNullOrWhiteSpace(originalFileName))
                throw new ArgumentException("originalFileName");

            return Guid.NewGuid() + "_" + originalFileName;
        }

        public bool IsFileLargerThan(byte[] bytes, int maxSizeMb)
        {
            if (bytes == null)
                throw new ArgumentException("bytes");

            if (maxSizeMb < 1)
                throw new ArgumentException("maxSizeMb");

            return bytes.Length > maxSizeMb*1024*1024;
        }

        public string CreateUniqueFileNameForThumbnail(string originalFileName)
        {
            if (string.IsNullOrWhiteSpace(originalFileName))
                throw new ArgumentException("originalFileName");

            return Guid.NewGuid() + "_thumbnail_" + originalFileName;
        }
    }
}