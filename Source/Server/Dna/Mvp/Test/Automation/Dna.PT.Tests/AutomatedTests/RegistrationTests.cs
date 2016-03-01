using System;
using System.Data;
////using Microsoft.VisualStudio.TestTools.UnitTesting;
using Dna.PT.Automation;
using OpenQA.Selenium;
using NUnit.Framework;

namespace Dna.PT.Tests
{
    ////[TestClass]
    [TestFixture]
    public class RegistrationTests
    {
        public Driver driver;
        
        ////[TestInitialize]
        [SetUp]
        public void Init()
        {
            driver = new Driver();
        }

        [TearDown]
        public void Close()
        {
            driver.Close();
        }

        ////[TestMethod]
        [Test]
        public void RegisterWithInvalidUsername(IWebDriver webdriver)
        {
            // Initialize
            DataRow row = ExcelService.ReadTestDataForTestCaseFromExcelFile("RegisterWithInvalidUsername");
            RegisterPage registerPage = new RegisterPage(webdriver);

            // Test
            registerPage.GoTo();
            AutomationService.Wait(4);
            registerPage.PutInValueForNeededOperand();
            registerPage.Register(row["Username"].ToString(), row["Password"].ToString());

            // Assert
            AutomationService.SearchElement(webdriver, By.XPath("//div[contains(text(),'Registration failed: Name "+ row["Username"].ToString() +" is already taken.')]")).Highlight(webdriver);
            AutomationService.Wait(2);
            Assert.IsTrue(registerPage.HasErrorMessageWhenRegisteringWithOccupiedName("Registration failed: Name " + row["Username"].ToString() + " is already taken."));
        }
    }
}