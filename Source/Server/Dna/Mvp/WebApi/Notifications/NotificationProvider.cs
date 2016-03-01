using System;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Reflection;

namespace Dna.Mvp.Notifications
{
    public interface INotificationProvider
    {
        Email GetSystemEmailTemplate(SystemEmailTemplate template);
        void Send(Email email);
    }

    public class NotificationProvider : INotificationProvider
    {
        private readonly MailAddress _fromAddress;
        private readonly bool _smtpEnableSsl;
        private readonly string _smtpHost, _smtpPassword;
        private readonly int _smtpPort;

        public NotificationProvider()
        {
            _fromAddress = new MailAddress("system@agencymultiplied.com", "Agency Multiplied");
            _smtpHost = "smtpout.secureserver.net";
            _smtpPort = 80;
            _smtpEnableSsl = false;
            _smtpPassword = "a3SysMail";
        }

        public Email GetSystemEmailTemplate(SystemEmailTemplate template)
        {
            switch (template)
            {
                case SystemEmailTemplate.PasswordReset:
                    return new Email()
                    {
                        Message = LoadFileContent("Dna.Mvp.Notifications.EmailTemplates.PasswordResetRequest.html"),
                        Subject = "A3 Password Reset Request"
                    };
                        
                case SystemEmailTemplate.UserCreation:
                    return new Email()
                    {
                        Message = LoadFileContent("Dna.Mvp.Notifications.EmailTemplates.UserCreation.html"),
                        Subject = "Welcome to A3"
                    };
            }

            throw new ArgumentException("template");
        }

        public void Send(Email email)
        {
            var smtp = new SmtpClient
            {
                Host = _smtpHost,
                Port = _smtpPort,
                EnableSsl = _smtpEnableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_fromAddress.Address, _smtpPassword)
            };

            using (var message = new MailMessage())
            {
                message.From = _fromAddress;
                message.Subject = email.Subject;
                message.Body = email.Message;
                message.IsBodyHtml = email.IsBodyHtml;

                foreach (var to in email.Recepients)
                {
                    message.To.Add(new MailAddress(to));
                }

                smtp.Send(message);
            }
        }


        private string LoadFileContent(string location)
        {
            var assembly = Assembly.GetExecutingAssembly();
            var fileStream = assembly.GetManifestResourceStream(location);
            
            if (fileStream == null)
                throw new NullReferenceException("Unable to load " + location);

            using (var textStreamReader = new StreamReader(fileStream))
            {
                return textStreamReader.ReadToEnd();
            }
        }
    }
    public enum SystemEmailTemplate
    {
        PasswordReset,
        UserCreation
    }
}