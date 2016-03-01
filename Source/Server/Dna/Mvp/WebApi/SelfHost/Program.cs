using Dna.Mvp.WebApi.Api;
using log4net;
using log4net.Config;

//Here is the once-per-application setup information
[assembly: XmlConfigurator(Watch = true)]

namespace Dna.Mvp.WebApi.SelfHost
{
    internal class Program
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof (Startup));

        private static void Main(string[] args)
        {
            Startup.StartServer();
        }
    }
}