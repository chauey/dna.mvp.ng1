using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

namespace Dna.Mvp.WebApi.Utilities
{
    public class ImageUtility : IDisposable
    {
        private Image _img;

        public ImageUtility(string path)
        {
            _img = Image.FromFile(path);
            Init();
        }

        public ImageUtility(Stream stream)
        {
            _img = Image.FromStream(stream);
            Init();
        }

        public ImageUtility(Image img)
        {
            _img = img;
            Init();
        }

        public ImageFormat Format { get; set; }
        public Color BackgroundColor { get; set; }
        public int Quality { get; set; }

        public Image CurrentImage
        {
            get { return this._img; }
        }

        private void Init()
        {
            Format = ImageFormat.Jpeg;
            BackgroundColor = Color.White;
        }

        public void ResizeToHeight(int height)
        {
            var proportion = (double)_img.Width / _img.Height;
            var width = (int)Math.Round(proportion * height);

            Resize(width, height);
        }

        public void ResizeToWidth(int width)
        {
            var proportion = (double)_img.Height / _img.Width;
            var height = (int)Math.Round(proportion * width);

            Resize(width, height);
        }

        public void Resize(int width, int height)
        {
            // Create new image canvas -- use maxWidth and maxHeight in this function call if you wish
            // to set the exact dimensions of the output image.
            var newImage = new Bitmap(width, height, PixelFormat.Format32bppArgb);

            // Render the new image, using a graphic object
            using (var newGraphic = Graphics.FromImage(newImage))
            {
                // Set the background color to be transparent (can change this to any color)
                newGraphic.Clear(BackgroundColor);

                // Set the method of scaling to use -- HighQualityBicubic is said to have the best quality
                newGraphic.InterpolationMode = InterpolationMode.HighQualityBicubic;

                // Apply the transformation onto the new graphic
                var sourceDimensions = new Rectangle(0, 0, _img.Width, _img.Height);
                var destinationDimensions = new Rectangle(0, 0, width, height);
                newGraphic.DrawImage(_img, destinationDimensions, sourceDimensions, GraphicsUnit.Pixel);
            }

            _img.Dispose();
            // Image has been modified by all the references to it's related graphic above. Return changes.
            _img = newImage;
        }

        public void SetQuality(int quality)
        {
            if (quality < 0 || quality > 100)
                throw new ArgumentOutOfRangeException("quality must be between 0 and 100.");

            Quality = quality;
        }

        public byte[] GetBytes()
        {
            byte[] imageBytes;

            var qualityParam = new EncoderParameter(Encoder.Quality, Quality);
            var encoderParams = new EncoderParameters(1);
            encoderParams.Param[0] = qualityParam;

            var imageCodec = GetEncoderInfo("image/png");

            using (var stream = new MemoryStream())
            {
                _img.Save(stream, imageCodec, encoderParams);
                imageBytes = stream.GetBuffer();
            }

            return imageBytes;
        }

        /// <summary>
        ///     Returns the image codec with the given mime type
        /// </summary>
        private static ImageCodecInfo GetEncoderInfo(string mimeType)
        {
            // Get image codecs for all image formats 
            var codecs = ImageCodecInfo.GetImageEncoders();

            // Find the correct image codec 
            for (var i = 0; i < codecs.Length; i++)
                if (codecs[i].MimeType == mimeType)
                    return codecs[i];

            return null;
        }

        public void Dispose()
        {
            _img.Dispose();
        }
    }
}