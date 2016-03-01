using System.Collections.Generic;

namespace Dna.Mvp.Notifications
{
    public class Email
    {
        public string Subject { get; set; }
        public string Message { get; set; }
        public IList<string> Recepients { get; set; }
        public bool IsBodyHtml { get; set; }

        public Email()
        {
            IsBodyHtml = true;
            Recepients = new List<string>();
        }
    }
}