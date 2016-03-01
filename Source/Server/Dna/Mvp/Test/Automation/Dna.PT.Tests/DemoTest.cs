using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Support.UI;
using OpenQA.Selenium.Support.Events;
using Dna.PT.Automation;
using System.IO;

namespace Dna.PT.Tests
{
    [TestFixture]
    public class DemoTest
    {
        IWebDriver webdriver;

        [SetUp]
        public void Init()
        {
            webdriver = new FirefoxDriver();
            webdriver.Manage().Window.Maximize();
            webdriver.Navigate().GoToUrl("http://localhost:12483/#/validationList");
        }

        [TearDown]
        public void Close()
        {
            ////webdriver.Close();
            ////webdriver.Quit();
        }

        [Test]
        public void TestLocators()
        {
            webdriver.FindElement(By.Id("integerInput")).FindElement(By.XPath("./..")).Highlight(this.webdriver);
            webdriver.FindElement(By.LinkText("Login")).Highlight(this.webdriver);

            ////// Implicit wait
            ////IWebDriver driver = new FirefoxDriver();
            ////driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(10));
            ////driver.Url = "http://somedomain/url_that_delays_loading";
            ////IWebElement myDynamicElement = driver.FindElement(By.Id("someDynamicElement"));

            // Explicit wait
            ////IWebDriver driver = new FirefoxDriver();
            ////driver.Url = "http://somedomain/url_that_delays_loading";
            ////WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            ////IWebElement myDynamicElement = wait.Until<IWebElement>((d) =>
            ////{
            ////    return d.FindElement(By.Id("someDynamicElement"));
            ////});

            string window1 = webdriver.CurrentWindowHandle;

            // .... Working on window 2. Now move back to window 1
            webdriver.SwitchTo().Window(window1);

            webdriver.SwitchTo().Alert().Accept();
        }

        [Test]
        public void TestTakingScreenshotOnException()
        {
            // try find a non-existent element where NoSuchElementException should be thrown
            var firingDriver = new EventFiringWebDriver(webdriver);
            firingDriver.ExceptionThrown += FiringWebDriver_TakeScreenshotOnException;
            webdriver = firingDriver;
            webdriver.FindElement(By.Id("integerInput1"));
        }

        private void FiringWebDriver_TakeScreenshotOnException(object sender, WebDriverExceptionEventArgs e)
        {
            string timestamp = DateTime.Now.ToString("yyyy-MM-dd-hhmm-ss");
            webdriver.TakeScreenshot(Directory.GetCurrentDirectory() + "\\Exception-" + timestamp + ".jpeg");
            ////webdriver.TakeScreenshot().SaveAsFile("Exception-" + timestamp + ".png", ImageFormat.Png);
        }
    }
}