using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Serialization;

namespace Dna.PT.Automation
{
    public class TestConfiguration
    {
        public DriverConfigurationList GetDriverConfiguration()
        {
            DriverConfigurationList driverConfigurationList;
            XmlSerializer deserializer = new XmlSerializer(typeof(DriverConfigurationList));
            TextReader reader = new StreamReader(Directory.GetCurrentDirectory() + @"\TestConfig.xml");
            object obj = deserializer.Deserialize(reader);
            driverConfigurationList = (DriverConfigurationList)obj;
            reader.Close();
            return driverConfigurationList;
        }
    }

    public class DriverConfiguration
    {
        public string DriverName { get; set; }

        public string BrowserName { get; set; }

        public string Version { get; set; }

        public string MaxInstances { get; set; }

        public string Platform { get; set; }

        public string Uri { get; set; }
    }

    public class DriverConfigurationList
    {
        [XmlElement("DriverConfiguration")]
        public List<DriverConfiguration> DriverConfigurationCollection = new List<DriverConfiguration>();
    }
}