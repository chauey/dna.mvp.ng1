using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OpenQA.Selenium;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.IE;
using OpenQA.Selenium.Firefox;

namespace Dna.PT.Automation
{
    public class Driver
    {
        #region Variables
        public static readonly int DefaultImplicitTimeOut = 20;
        public static readonly int DefaultExplicitTimeOut = 20;

        public IWebDriver WebDriver;
        public IList<IWebDriver> WebDrivers = new List<IWebDriver>();
        #endregion

        #region Constructors
        public Driver()
        {
            TestRunConfiguration testRunConfiguration = AutomationService.GetTestRunConfiguration();
            if (testRunConfiguration.SelectedDriver == "all")
            {
                this.WebDrivers = AutomationService.GetDriverList();
                return; // When no return, there will be an null error with Driver.Manage().Window.Maximize();
            }

            DriverConfigurationList driverList = AutomationService.GetDriverConfigurationList();
            DesiredCapabilities desiredCapability = new DesiredCapabilities();
            string selectedDriver = testRunConfiguration.SelectedDriver;

            if (testRunConfiguration.SelectedDriver.Split('-').Last() == "local")
            {
                switch (testRunConfiguration.SelectedDriver.Split('-').First())
                {
                    case "firefox":
                        this.WebDriver = new FirefoxDriver();
                        break;
                    case "chrome":
                        this.WebDriver = new ChromeDriver("BrowserDrivers");
                        break;
                    case "internet explorer":
                        this.WebDriver = new InternetExplorerDriver("BrowserDrivers");
                        break;
                }
            }
            else
            {
                if (driverList.DriverConfigurationCollection.Count > 0)
                {
                    for (int i = 0; i < driverList.DriverConfigurationCollection.Count; i++)
                    {
                        if (driverList.DriverConfigurationCollection[i].DriverName == selectedDriver)
                        {
                            desiredCapability.SetCapability(CapabilityType.Platform, driverList.DriverConfigurationCollection[i].Platform);
                            desiredCapability.SetCapability(CapabilityType.BrowserName, driverList.DriverConfigurationCollection[i].BrowserName);
                            desiredCapability.SetCapability(CapabilityType.Version, driverList.DriverConfigurationCollection[i].Version);
                            this.WebDriver = new RemoteWebDriver(new Uri(driverList.DriverConfigurationCollection[i].Uri), desiredCapability);
                            break;
                        }
                    }
                }
            }

            this.WebDriver.Manage().Window.Maximize();
            this.WebDriver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(Driver.ImplicitTimeOut));
            this.WebDriver.Navigate().GoToUrl(testRunConfiguration.URLUnderTest);
        }

        public Driver(string driver)
        {
            DriverConfigurationList driverList = AutomationService.GetDriverConfigurationList();
            DesiredCapabilities desiredCapability = new DesiredCapabilities();
            string selectedDriver = driver;

            if (driverList.DriverConfigurationCollection.Count > 0)
            {
                for (int i = 0; i < driverList.DriverConfigurationCollection.Count; i++)
                {
                    if (driverList.DriverConfigurationCollection[i].DriverName == selectedDriver)
                    {
                        desiredCapability.SetCapability(CapabilityType.Platform, driverList.DriverConfigurationCollection[i].Platform);
                        desiredCapability.SetCapability(CapabilityType.BrowserName, driverList.DriverConfigurationCollection[i].BrowserName);
                        desiredCapability.SetCapability(CapabilityType.Version, driverList.DriverConfigurationCollection[i].Version);
                        this.WebDriver = new RemoteWebDriver(new Uri(driverList.DriverConfigurationCollection[i].Uri), desiredCapability);
                        break;
                    }
                }
            }

            this.WebDriver.Manage().Window.Maximize();
            this.WebDriver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(Driver.ImplicitTimeOut));
        }
        #endregion

        #region Properties
        public static int ImplicitTimeOut
        {
            get
            {
                TestRunConfiguration testRunConfiguration = AutomationService.GetTestRunConfiguration();
                int implicitTimeOut = Driver.DefaultImplicitTimeOut;
                try
                {
                    int xmlImplicitTimeOut = int.Parse(testRunConfiguration.ImplicitTimeOut);
                    if (xmlImplicitTimeOut > 0)
                    {
                        implicitTimeOut = xmlImplicitTimeOut;
                    }
                }
                catch
                {
                    implicitTimeOut = DefaultImplicitTimeOut;
                }

                return implicitTimeOut;
            }
        }

        public static int ExplicitTimeOut
        {
            get
            {
                TestRunConfiguration testRunConfiguration = AutomationService.GetTestRunConfiguration();
                int explicitTimeOut = Driver.DefaultExplicitTimeOut;
                try
                {
                    int xmlExplicitTimeOut = int.Parse(testRunConfiguration.ExplicitTimeOut);
                    if (xmlExplicitTimeOut > 0)
                    {
                        explicitTimeOut = xmlExplicitTimeOut;
                    }
                }
                catch
                {
                    explicitTimeOut = DefaultExplicitTimeOut;
                }

                return explicitTimeOut;
            }
        }
        #endregion

        #region Methods
        public void Close()
        {
            this.WebDriver.Close();
            this.WebDrivers = null;
        }
        #endregion
    }
}