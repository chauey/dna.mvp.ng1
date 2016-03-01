using System;
using System.Collections.Generic;
using System.Drawing.Imaging;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using OpenQA.Selenium;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Support.UI;
using System.IO;

namespace Dna.PT.Automation
{
    public static class AutomationService
    {
        public static IList<IWebDriver> GetDriverList()
        {
            IList<IWebDriver> drivers = new List<IWebDriver>();
            DriverConfigurationList driverList = GetDriverConfigurationList();
            if (driverList.DriverConfigurationCollection.Count > 0)
            {
                foreach (DriverConfiguration driverConfiguration in driverList.DriverConfigurationCollection)
                {
                    DesiredCapabilities capability = new DesiredCapabilities();
                    capability.SetCapability(CapabilityType.Platform, driverConfiguration.Platform);
                    capability.SetCapability(CapabilityType.BrowserName, driverConfiguration.BrowserName);
                    capability.SetCapability(CapabilityType.Version, driverConfiguration.Version);
                    IWebDriver driverItem = new RemoteWebDriver(new Uri(driverConfiguration.Uri), capability);
                    drivers.Add(driverItem);
                }
            }

            return drivers;
        }

        public static DriverConfigurationList GetDriverConfigurationList()
        {
            Config config = new Config();
            TestEnvironment testEnvironment = new TestEnvironment();
            testEnvironment = config.GetTestEnvironment();
            TestRunConfiguration testRunConfiguration = GetTestRunConfiguration();

            // Get driver configuration
            DriverConfigurationList driverList = new DriverConfigurationList();
            driverList = testEnvironment.DriverConfigurationList;
            return driverList;
        }

        public static TestRunConfiguration GetTestRunConfiguration()
        {
            // Get test environment
            Config config = new Config();
            TestEnvironment testEnvironment = new TestEnvironment();
            testEnvironment = config.GetTestEnvironment();

            // Get test environment
            TestRunConfiguration testRunConfiguration = new TestRunConfiguration();
            testRunConfiguration = testEnvironment.TestRunConfiguration;
            return testRunConfiguration;
        }

        public static string GetURLUnderTest()
        {
            TestRunConfiguration testRunConfiguration = GetTestRunConfiguration();
            string urlUnderTest = testRunConfiguration.URLUnderTest;
            return urlUnderTest;
        }

        public static IWebElement SearchElement(IWebDriver driver, By by, int timeInSeconds)
        {
            WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeInSeconds));
            wait.Until(ExpectedConditions.ElementIsVisible(by));
            return driver.FindElement(by);
        }

        // Implement the ElementIsClickable
        ////public static Func<IWebDriver, IWebElement> ElementIsClickable(By locator)
        ////{
        ////    return driver =>
        ////    {
        ////        var element = driver.FindElement(locator);
        ////        return (element != null && element.Displayed && element.Enabled) ? element : null;
        ////    };
        ////}

        public static IWebElement SearchElement(IWebDriver driver, By by)
        {
            return driver.FindElement(by);
        }

        public static void SendKeys(this IWebElement element, string value, bool clearFirst)
        {
            if (clearFirst)
            {
                element.Clear();
            }

            element.SendKeys(value);
        }

        public static bool HasElement(this IWebDriver driver, By by)
        {
            try
            {
                SearchElement(driver, by);
            }
            catch (NoSuchElementException)
            {
                return false;
            }

            return true;
        }

        public static bool HasElement(this IWebElement element, By by)
        {
            try
            {
                element.FindElement(by);
            }
            catch (NoSuchElementException)
            {
                return false;
            }

            return true;
        }

        public static void Highlight(IWebDriver driver, IWebElement element)
        {
            var jsDriver = (IJavaScriptExecutor)driver;
            string highlightJavascript = @"$(arguments[0]).css({ ""border-width"" : ""2px"", ""border-style"" : ""solid"", ""border-color"" : ""yellow"" });";
            jsDriver.ExecuteScript(highlightJavascript, new object[] { element });
        }

        public static void UnHighlight(this IWebElement element, IWebDriver driver)
        {
            var jsDriver = (IJavaScriptExecutor)driver;
            string highlightJavascript = @"$(arguments[0]).css({ ""border-width"" : ""2px"", ""border-style"" : ""none"", ""border-color"" : ""yellow"" });";
            jsDriver.ExecuteScript(highlightJavascript, new object[] { element });
        }

        public static void Highlight(this IWebElement element, IWebDriver driver)
        {
            var jsDriver = (IJavaScriptExecutor)driver;
            string highlightJavascript = @"$(arguments[0]).css({ ""border-width"" : ""2px"", ""border-style"" : ""solid"", ""border-color"" : ""yellow"" });";
            jsDriver.ExecuteScript(highlightJavascript, new object[] { element });
        }

        public static void Highlight(this SelectElement element, IWebDriver driver)
        {
            var jsDriver = (IJavaScriptExecutor)driver;
            string highlightJavascript = @"$(arguments[0]).css({ ""border-width"" : ""2px"", ""border-style"" : ""solid"", ""border-color"" : ""yellow"" });";
            jsDriver.ExecuteScript(highlightJavascript, new object[] { element });
        }

        public static bool CompareTwoLists(IList<string> currentList, IList<string> targetList)
        {
            if (currentList.Count == targetList.Count && currentList.Count > 0)
            {
                for (int i = 0; i < currentList.Count; i++)
                {
                    if (currentList[i].ToString() != targetList[i].ToString())
                    {
                        return false;
                    }
                }

                return true;
            }

            return false;
        }

        public static void BringElementToView(this IWebElement webElement, IWebDriver driver)
        {
            ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].scrollIntoView();", webElement);
        }

        public static void Wait(int second)
        {
            Thread.Sleep(TimeSpan.FromSeconds(second));
        }

        public static void BringElementToViewWithBottomAlignment(this IWebElement webElement, IWebDriver driver)
        {
            ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].scrollIntoView(false);", webElement);
        }

        public static void WaitForPageLoaded(this IWebDriver webdriver)
        {
            IWait<IWebDriver> wait = new OpenQA.Selenium.Support.UI.WebDriverWait(webdriver, TimeSpan.FromSeconds(30));
            wait.Until(driver => ((IJavaScriptExecutor)webdriver).ExecuteScript("return document.readyState").Equals("complete"));
        }

        public static void TakeScreenshot (this IWebDriver driver, string saveLocation)
        {
            var screenshot = ((ITakesScreenshot)driver).GetScreenshot();
            byte[] imageBytes = Convert.FromBase64String(screenshot.ToString());

            using (BinaryWriter bw = new BinaryWriter(new FileStream(saveLocation, FileMode.Create, FileAccess.Write)))
            {
                bw.Write(imageBytes);
                bw.Close();
            }
        }

        public static bool WaitUntilClickable(this IWebElement element, IWebDriver webdriver, int timeoutSeconds)
        {
            WebDriverWait wait = new WebDriverWait(webdriver, TimeSpan.FromSeconds(timeoutSeconds));
            wait.Until(targetElement => element.Enabled);
            return true;
        }
    }

    public static class ExpectedConditionsExtensions
    {
        public static Func<IWebDriver, IWebElement> ElementIsClickable(this ExpectedConditions expectedConditions, By locator)
        {
            return driver =>
            {
                var element = driver.FindElement(locator);
                return (element != null && element.Displayed && element.Enabled) ? element : null;
            };
        }
    }
}