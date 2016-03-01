using System;
using System.Data;
using System.IO;
using Dna.PT.Automation;
using Dna.PT.Automation.Models;
using Dna.PT.Automation.ValidationMessages;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Support.Events;

namespace Dna.PT.Tests
{
    [TestFixture]
    public class ValidationTest
    {
        public Driver driver;

        // For parallele demonstration
        public IWebDriver webdriver;

        [SetUp]
        public void Init()
        {
            // Use this initialization to run one instance at a time locally
            driver = new Driver();

            // Initialize for parallel test run
            ////DesiredCapabilities desiredCapability = new DesiredCapabilities();
            ////desiredCapability.SetCapability(CapabilityType.Platform, "WINDOWS");
            ////desiredCapability.SetCapability(CapabilityType.BrowserName, "firefox");
            ////desiredCapability.SetCapability(CapabilityType.Version, "31.0");
            
            ////webdriver = new RemoteWebDriver(new Uri("http://localhost:8000/wd/hub"), desiredCapability);
            ////webdriver.Manage().Window.Maximize();
            ////webdriver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(10));
            ////webdriver.Navigate().GoToUrl("http://dnaspawebhybridmobiledemo.azurewebsites.net");
        }

        [TearDown]
        public void Close()
        {
            // uncomment if want to close the driver after running a testcase
            driver.Close();
        }

        [Test]
        public void ValidateRequiredIntegerValue(IWebDriver webdriver)
        {
            // Initialize
            ValidationTestCaseModel validationTestCaseModel = ExcelCsvService.ReadTestDataForTestCaseFromValidationExcelFile("ValidateRequiredIntegerValue");
            ValidationPage validationPage = new ValidationPage(webdriver);

            // Test
            validationPage.GoTo();
            AutomationService.Wait(2);
            validationPage.AddValidation();
            validationPage.WithInteger("").Save();

            // Assert
            Assert.IsTrue(validationPage.ErrorMessageForInteger.Displayed);

            // Test failed with the below MbUnit assertion
            ////Assert.IsTrue(validationPage.ErrorMessageForInteger.Text == ValidationPageErrorMessage.GetErrorMessageForRequiredInteger());

            // The below should be run well for both NUnit and MbUnit
            Assert.IsTrue(validationPage.ErrorMessageForInteger.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForRequiredInteger()));

            // Highlight the result
            validationPage.ErrorMessageForInteger.Highlight(webdriver);
        }

        [Test]
        public void ValidateInvalidIntegerValue(IWebDriver webdriver)
        {
            // Initialize
            ValidationTestCaseModel validationTestCaseModel = ExcelCsvService.ReadTestDataForTestCaseFromValidationExcelFile("ValidateInvalidIntegerValue");
            ValidationPage validationPage = new ValidationPage(webdriver);

            // Test
            validationPage.GoTo();
            AutomationService.Wait(2);
            validationPage.AddValidation();
            validationPage.WithInteger(validationTestCaseModel.IntegerValue).Save();

            // Assert
            Assert.IsTrue(validationPage.ErrorMessageForInteger.Displayed);
            Assert.IsTrue(validationPage.ErrorMessageForInteger.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForInvalidInteger()));

            // Highlight the result
            validationPage.ErrorMessageForInteger.Highlight(webdriver);
        }

        [Test]
        public void ValidateOutOfRangeAgeValue(IWebDriver webdriver)
        {
            // Initialize
            ValidationTestCaseModel validationTestCaseModel = ExcelCsvService.ReadTestDataForTestCaseFromValidationExcelFile("ValidateOutOfRangeAgeValue");
            ValidationPage validationPage = new ValidationPage(webdriver);

            // Test
            validationPage.GoTo();
            AutomationService.Wait(2);
            validationPage.AddValidation();
            AutomationService.Wait(2);
            validationPage.WithAge(validationTestCaseModel.AgeValue).Save();

            // Assert
            Assert.IsTrue(validationPage.ErrorMessageForAge.Displayed);
            Assert.IsTrue(validationPage.ErrorMessageForAge.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForOutOfRangeAge()));

            // Highlight the result
            validationPage.ErrorMessageForAge.Highlight(webdriver);
        }

        [Test]
        public void ValidateAgeValueNotInInteger(IWebDriver webdriver)
        {
            // Initialize
            ValidationTestCaseModel validationTestCaseModel = ExcelCsvService.ReadTestDataForTestCaseFromValidationExcelFile("ValidateAgeValueNotInInteger");
            ValidationPage validationPage = new ValidationPage(webdriver);

            // Test
            validationPage.GoTo();
            AutomationService.Wait(2);
            validationPage.AddValidation();
            AutomationService.Wait(2);
            validationPage.WithAge(validationTestCaseModel.AgeValue);
            validationPage.Save();

            // Assert
            Assert.IsTrue(validationPage.ErrorMessageForAge.Displayed);
            Assert.IsTrue(validationPage.ErrorMessageForAge.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForNonIntegerAge()));

            // Highlight the result
            validationPage.ErrorMessageForAge.Highlight(webdriver);
        }

        [Test]
        public void PickDay(IWebDriver webdriver)
        {
            // Initialize
            ValidationTestCaseModel validationTestCaseModel = ExcelCsvService.ReadTestDataForTestCaseFromValidationExcelFile("PickDay");
            ValidationPage validationPage = new ValidationPage(webdriver);

            // Test
            validationPage.GoTo();
            AutomationService.Wait(2);
            validationPage.AddValidation();
            validationPage.OpenCalendar();
            AutomationService.Wait(2);
            validationPage.SelectDay(validationTestCaseModel.DayValue).SelectDateFormat(validationTestCaseModel.DateFormatValue);
            string dateText = validationPage.DateTextBox.GetAttribute("value");

            // Assert
            Assert.IsTrue(validationPage.CheckDateFormat(dateText, validationTestCaseModel.DateFormatValue));

            // Highlight the result
            validationPage.DateFormatTextBox.Highlight(webdriver);
            validationPage.DateTextBox.FindElement(By.XPath("./..")).Highlight(webdriver);
        }

        [Test]
        public void CheckValidationPage(IWebDriver webdriver)
        {
            // Initialize
            ValidationTestCaseModel validationTestCaseModel = ExcelCsvService.ReadTestDataForTestCaseFromValidationExcelFile("CheckValidationPage");
            ValidationPage validationPage = new ValidationPage(webdriver);

            // Test
            validationPage.GoTo();

            // Wait until Add Validation button is clickable
            AutomationService.SearchElement(webdriver, By.LinkText("Add Validation")).WaitUntilClickable(webdriver,10);

            validationPage.AddValidation();
            validationPage
                .WithInteger(validationTestCaseModel.IntegerValue)
                .WithString(validationTestCaseModel.StringValue)
                .SelectDateFormat(validationTestCaseModel.DateFormatValue)
                .OpenCalendar().SelectDay(validationTestCaseModel.DayValue)
                .OpenBeforeDateCalendar().SelectDayOfBeforeDay(validationTestCaseModel.DayOfBeforeDateValue)
                .WithAge(validationTestCaseModel.AgeValue)
                .WithCreditCard(validationTestCaseModel.CreditCardValue)
                .WithEmail(validationTestCaseModel.EmailValue)
                .WithPhone(validationTestCaseModel.PhoneValue)
                .WithURL(validationTestCaseModel.UrlValue)
                .WithZip(validationTestCaseModel.ZipValue)
                .WithStartsWithText(validationTestCaseModel.StartsWithDnaValue)
                .WithContainsText(validationTestCaseModel.ContainsDnaValue)
                .Save();

            // Assert
            string dateText = validationPage.DateTextBox.GetAttribute("value");
            Assert.IsTrue(validationPage.ErrorMessageForInteger.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForRequiredInteger()), "The error message for the required field is not as expected");
            Assert.IsTrue(validationPage.CheckDateFormat(dateText, validationTestCaseModel.DateFormatValue));
            Assert.IsTrue(validationPage.ErrorMessageForAge.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForOutOfRangeAge()));
            Assert.IsTrue(validationPage.ErrorMessageForCreditCard.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForOutOfLengthCreditCardNumber()));
            Assert.IsTrue(validationPage.ErrorMessageForEmail.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForInvalidEmailFormat(validationTestCaseModel.EmailValue)));
            Assert.IsTrue(validationPage.ErrorMessageForPhone.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForNonIntegerPhoneNumber(validationTestCaseModel.PhoneValue)));
            Assert.IsTrue(validationPage.ErrorMessageForURL.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForInvalidURL(validationTestCaseModel.UrlValue)));
            Assert.IsTrue(validationPage.ErrorMessageForZip.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForNonIntegerZip(validationTestCaseModel.ZipValue)));
            Assert.IsTrue(validationPage.ErrorMessageForTextStartingWithDNA.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForTextStartingWithDNA(validationTestCaseModel.StartsWithDnaValue)));
            Assert.IsTrue(validationPage.ErrorMessageForTextContainingDNA.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForTextContainingDNA(validationTestCaseModel.ContainsDnaValue)));

            // Highlight the result
            validationPage.ErrorMessageForInteger.Highlight(webdriver);
            validationPage.DateFormatTextBox.Highlight(webdriver);
            validationPage.DateTextBox.FindElement(By.XPath("./..")).Highlight(webdriver);
            validationPage.ErrorMessageForAge.Highlight(webdriver);
            validationPage.ErrorMessageForCreditCard.Highlight(webdriver);
            validationPage.ErrorMessageForEmail.Highlight(webdriver);
            validationPage.ErrorMessageForPhone.Highlight(webdriver);
            validationPage.ErrorMessageForURL.Highlight(webdriver);
            validationPage.ErrorMessageForZip.Highlight(webdriver);
            validationPage.ErrorMessageForTextStartingWithDNA.Highlight(webdriver);
            validationPage.ErrorMessageForTextContainingDNA.Highlight(webdriver);

            // Screenshot
            webdriver.TakeScreenshot(Directory.GetCurrentDirectory() + "\\file1.jpeg");
        }

        [Test]
        public void ValidateRequiredIntegerValue_P()
        {
            ValidationTestCaseModel validationTestCaseModel = ExcelCsvService.ReadTestDataForTestCaseFromValidationExcelFile("ValidateRequiredIntegerValue");
            ValidationPage validationPage = new ValidationPage(driver.WebDriver);

            // Test
            validationPage.GoTo();
            AutomationService.Wait(5);
            validationPage.AddValidation();
            validationPage.WithInteger("").Save();

            // Assert
            Assert.IsTrue(validationPage.ErrorMessageForInteger.Displayed);

            // Test failed with the below MbUnit assertion
            ////Assert.IsTrue(validationPage.ErrorMessageForInteger.Text == ValidationPageErrorMessage.GetErrorMessageForRequiredInteger());

            // The below should be run well for both NUnit and MbUnit
            Assert.IsTrue(validationPage.ErrorMessageForInteger.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForRequiredInteger()));

            // Highlight the result
            validationPage.ErrorMessageForInteger.Highlight(driver.WebDriver);
        }

        [Test]
        public void ValidateInvalidIntegerValue_P()
        {
            // Initialize
            ////DataRow row = ExcelService.ReadTestDataForTestCaseFromExcelFile("ValidateInvalidIntegerValue");
            ValidationTestCaseModel validationTestCaseModel = ExcelCsvService.ReadTestDataForTestCaseFromValidationExcelFile("ValidateInvalidIntegerValue");
            ValidationPage validationPage = new ValidationPage(this.driver.WebDriver);

            // Test
            validationPage.GoTo();
            AutomationService.Wait(2);
            validationPage.AddValidation();
            validationPage.WithInteger(validationTestCaseModel.IntegerValue).Save();

            // Assert
            Assert.IsTrue(validationPage.ErrorMessageForInteger.Displayed);
            Assert.IsTrue(validationPage.ErrorMessageForInteger.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForInvalidInteger()));

            // Highlight the result
            validationPage.ErrorMessageForInteger.Highlight(this.driver.WebDriver);
        }

        [Test]
        public void ValidateOutOfRangeAgeValue_P()
        {
            // Initialize
            ////DataRow row = ExcelService.ReadTestDataForTestCaseFromExcelFile("ValidateOutOfRangeAgeValue");
            ValidationTestCaseModel validationTestCaseModel = ExcelCsvService.ReadTestDataForTestCaseFromValidationExcelFile("ValidateOutOfRangeAgeValue");
            ValidationPage validationPage = new ValidationPage(this.driver.WebDriver);

            // Test
            validationPage.GoTo();
            AutomationService.Wait(2);
            validationPage.AddValidation();
            validationPage.WithAge(validationTestCaseModel.AgeValue).Save();

            // Assert
            Assert.IsTrue(validationPage.ErrorMessageForAge.Displayed);
            Assert.IsTrue(validationPage.ErrorMessageForAge.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForOutOfRangeAge()));

            // Highlight the result
            validationPage.ErrorMessageForAge.Highlight(this.driver.WebDriver);
        }

        [Test]
        public void TakeScreenshotOnException()
        {
            ValidationTestCaseModel validationTestCaseModel = ExcelCsvService.ReadTestDataForTestCaseFromValidationExcelFile("ValidateRequiredIntegerValue");

            ////DataRow row = ExcelService.ReadTestDataForTestCaseFromExcelFile("ValidateRequiredIntegerValue");
            EventFiringWebDriver eventDriver = new EventFiringWebDriver(this.driver.WebDriver);
            eventDriver.ExceptionThrown += new EventHandler<WebDriverExceptionEventArgs>(firingDriver_ExceptionThrown);
            
            
            ValidationPage validationPage = new ValidationPage(eventDriver);
            

            // Test
            validationPage.GoTo();
            AutomationService.Wait(5);
            validationPage.AddValidation();
            validationPage.WithInteger("");
            validationPage.Save();
            // Assert
            Assert.IsTrue(validationPage.ErrorMessageForInteger.Displayed);

            // Test failed with the below MbUnit assertion
            ////Assert.IsTrue(validationPage.ErrorMessageForInteger.Text == ValidationPageErrorMessage.GetErrorMessageForRequiredInteger());

            // The below should be run well for both NUnit and MbUnit
            Assert.IsTrue(validationPage.ErrorMessageForInteger.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForRequiredInteger()));

            // Highlight the result
            validationPage.ErrorMessageForInteger.Highlight(eventDriver);
        }

        [Test]
        public void ValidateAllFields()
        {
            ValidationTestCaseModel validationTestCaseModel =
                ExcelCsvService.ReadTestDataForTestCaseFromValidationExcelFile("ValidateAllFields");

            EventFiringWebDriver eventDriver = new EventFiringWebDriver(this.driver.WebDriver);
            eventDriver.ExceptionThrown += new EventHandler<WebDriverExceptionEventArgs>(firingDriver_ExceptionThrown);

            ValidationPage validationPage = new ValidationPage(eventDriver);
            validationPage.GoTo();
            AutomationService.Wait(5);
            validationPage.AddValidation();

            // Integer
            validationPage.WithInteger(validationTestCaseModel.IntegerValue);
            validationPage.Save();
            Assert.IsTrue(validationPage.ErrorMessageForInteger.Displayed);

            // Age
            validationPage.WithAge("a");
            validationPage.Save();
            Assert.IsTrue(validationPage.ErrorMessageForAge.Text.Contains("integer"));

            validationPage.WithAge(validationTestCaseModel.AgeValue);
            validationPage.Save();
            Assert.IsTrue(validationPage.ErrorMessageForAge.Text.Contains("1 and 150"));

            // Credit card
            validationPage.WithCreditCard("a");
            validationPage.Save();
            Assert.IsTrue(validationPage.ErrorMessageForCreditCard.Text.Contains("number"));

            validationPage.WithCreditCard(validationTestCaseModel.CreditCardValue);
            validationPage.Save();
            Assert.IsTrue(validationPage.ErrorMessageForCreditCard.Text.Contains("16"));

            // Email
            validationPage.WithEmail(validationTestCaseModel.EmailValue);
            validationPage.Save();
            Assert.IsTrue(validationPage.ErrorMessageForEmail.Displayed);

            // Phone
            validationPage.WithPhone("a");
            validationPage.Save();
            Assert.IsTrue(validationPage.ErrorMessageForPhone.Text.Contains("positive"));

            validationPage.WithPhone(validationTestCaseModel.PhoneValue);
            validationPage.Save();
            Assert.IsTrue(validationPage.ErrorMessageForPhone.Text.Contains("15"));

            // URL
            validationPage.WithURL(validationTestCaseModel.UrlValue);
            validationPage.Save();
            Assert.IsTrue(validationPage.ErrorMessageForURL.Displayed);

            // Zip
            validationPage.WithZip("a");
            validationPage.Save();
            Assert.IsTrue(validationPage.ErrorMessageForZip.Text.Contains("positive"));

            validationPage.WithZip(validationTestCaseModel.ZipValue);
            validationPage.Save();
            Assert.IsTrue(validationPage.ErrorMessageForZip.Text.Contains("5"));

            // Starts with
            validationPage.WithStartsWithText(validationTestCaseModel.ZipValue);
            validationPage.Save();
            Assert.IsTrue(validationPage.ErrorMessageForTextStartingWithDNA.Displayed);

            // Contains
            validationPage.WithContainsText(validationTestCaseModel.ContainsDnaValue);
            validationPage.Save();
            Assert.IsTrue(validationPage.ErrorMessageForTextContainingDNA.Displayed);
        }


        public void firingDriver_ExceptionThrown(object sender, WebDriverExceptionEventArgs e)
        {
            ////log.Debug(e.ThrownException.StackTrace + e.ThrownException.Message);
            ////ITakesScreenshot shot = (ITakesScreenshot)e.Driver;
            e.Driver.TakeScreenshot("file1.jpeg");
        }

        [Test]
        public void TakeScreenshotOnExceptionWithListener()
        { 
            EventFiringWebDriver eventDriver = new EventFiringWebDriver(this.driver.WebDriver);
            WebDriverEventListener eventListener = new Listener(eventDriver);
            ////driver = new EventFiringWebDriver(new FirefoxDriver()).register(eventListener);
            eventDriver.ExceptionThrown += new EventHandler<WebDriverExceptionEventArgs>(eventListener.OnException);
            eventDriver.ElementClicked += new EventHandler<WebElementEventArgs>(eventListener.AfterClickOn);


            ////DataRow row = ExcelService.ReadTestDataForTestCaseFromExcelFile("ValidateRequiredIntegerValue");
            ValidationTestCaseModel validationTestCaseModel = ExcelCsvService.ReadTestDataForTestCaseFromValidationExcelFile("ValidateRequiredIntegerValue");
            ValidationPage validationPage = new ValidationPage(eventDriver);

            // Test
            validationPage.GoTo();
            AutomationService.Wait(5);
            validationPage.AddValidation();
            validationPage.WithInteger("");
            validationPage.SelectDay("2");
            // Assert
            Assert.IsTrue(validationPage.ErrorMessageForInteger.Displayed);

            // Test failed with the below MbUnit assertion
            ////Assert.IsTrue(validationPage.ErrorMessageForInteger.Text == ValidationPageErrorMessage.GetErrorMessageForRequiredInteger());

            // The below should be run well for both NUnit and MbUnit
            Assert.IsTrue(validationPage.ErrorMessageForInteger.Text.Contains(ValidationPageErrorMessage.GetErrorMessageForRequiredInteger()));

            // Highlight the result
            validationPage.ErrorMessageForInteger.Highlight(this.driver.WebDriver);
        }

        void eventDriver_ElementClicked(object sender, WebElementEventArgs e)
        {
            throw new NotImplementedException();
        }


    }
}