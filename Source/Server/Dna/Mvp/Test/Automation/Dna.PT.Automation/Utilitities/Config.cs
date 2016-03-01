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
    public class Config
    {
        public TestEnvironment GetTestEnvironment()
        {
            TestEnvironment testEnvironment;
            XmlSerializer deserializer = new XmlSerializer(typeof(TestEnvironment));
            string path = Directory.GetCurrentDirectory() + @"\Config.xml";
            TextReader reader = new StreamReader(path);
            object obj = deserializer.Deserialize(reader);
            testEnvironment = (TestEnvironment)obj;
            reader.Close();
            return testEnvironment;
        }
    }

    public class TestEnvironment
    {
        public TestRunConfiguration TestRunConfiguration = new TestRunConfiguration();
        public DriverConfigurationList DriverConfigurationList = new DriverConfigurationList();
    }

    public class TestRunConfiguration
    {
        public string Parallel { get; set; }

        public string RemoteControl { get; set; }

        public string SelectedDriver { get; set; }

        public string URLUnderTest { get; set; }

        public string ImplicitTimeOut { get; set; }

        public string ExplicitTimeOut { get; set; }

        ////public string ExcelOleDbConnectionString { get; set; }

        public string TestDataSheet { get; set; }
    }
}