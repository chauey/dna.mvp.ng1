using System;
using System.Data;
using Dna.PT.Automation;
using Dna.PT.Automation.Pages;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Remote;
using NUnit.Framework;
using System.IO;
using OpenQA.Selenium.Support.Events;
using OpenQA.Selenium.Firefox;
using Dna.PT.Automation.Models;

namespace Dna.PT.Tests.AutomatedTests
{
    [TestFixture]
    public class TypeOfTypeTest
    {
        // TODO: Should we move the WebDriver interface to the base class?
        private IWebDriver _webDriver;

        private Driver _driver;

        // TODO: Should we have a logger defined in the base class?
        //private static ILogger _logger = Logger.GetLogger(this);

        // TODO: Should we have a virtual property for the URL?
        //private string _baseUrl;

        [SetUp]
        public void BeginTest()
        {
            // TODO: Should we inject this?
            this._driver = new Driver();
        }

        [TearDown]
        public void EndTest()
        {
            // TODO: Should we do the init and dispose in the base class?
            this._driver.Close();
        }

        [Test]
        public void NameTextBox_InputEmptyString_Test(IWebDriver webDriver)
        {
            #region Assign

            // loads the input values from Excel and store them as an object-model first
            // TODO: tomorrow

            // initializes the test page
            TypeOfTypePage testPage = new TypeOfTypePage(webDriver);

            #endregion

            #region Act

            // clicks on the left navigation menu to go to the page 
            testPage.GoTo();

            // waits for 2 seconds
            AutomationService.Wait(2);

            // clicks on the 'Add Type Of Type' button (the Client-side section one)
            testPage.TryClickOnAddTypeOfTypeButton();

            // passes input values from the object-model
            // TODO: tomorrow

            #endregion

            #region Assert

            // TODO: assert the outut tomorrow

            #endregion
        }
    }
}
