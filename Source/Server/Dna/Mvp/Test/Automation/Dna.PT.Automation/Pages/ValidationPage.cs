using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System.Text.RegularExpressions;

namespace Dna.PT.Automation
{
    public class ValidationPage : SharedSection
    {
        #region Constructors
        public ValidationPage()
        {
        }

        public ValidationPage(IWebDriver webDriver)
        {
            WebDriver = webDriver;
        }
        #endregion

        #region enum
        public enum DateFormat
        {
            ddMMMMyyyy,
            ddMMyyyy,
            MMddyyyy,
            MMMMddyyyy,
            yyyyMMdd,
            shortDate,
            mediumDate,
            longDate,
            fullDate
        }
        #endregion

        #region Properties

        public IWebElement IntegerTextBox
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.XPath("//input[@id='integerInput']"),10);
            }
        }

        public IWebElement StringTextBox
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.XPath("//input[@id='stringInput']"),10);
            }
        }

        public SelectElement DateFormatSelectBox
        {
            get
            {
                return new SelectElement(AutomationService.SearchElement(this.WebDriver, By.Id("dateFormatInput")));
            }
        }


        public IWebElement DateFormatTextBox
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("dateFormatInput"));
            }
        }

        public IWebElement DateButton
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("datePopup"));
            }
        }

        public IWebElement DateTextBox
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("dateInput"));
            }
        }

        public IWebElement BeforeDateButton
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("beforeDatePopup"));
            }
        }

        public IWebElement AfterDateButton
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("afterDatePopup"));
            }
        }

        public IWebElement Calendar
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.XPath("//input[@id='afterDateInput']//following-sibling::*/"));
            }
        }

        public IWebElement CalendarCloseButton
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.XPath("//input[@id='afterDateInput']//following-sibling::*/li[@class='ng-scope']/button"));
            }
        }

        public IWebElement AgeTextBox
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("ageInput"));
            }
        }

        public IWebElement CreditCardTextBox
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("creditCardInput"));
            }
        }

        public IWebElement EmailTextBox
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("emailInput"));
            }
        }

        public IWebElement PhoneTextBox
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("phoneInput"));
            }
        }

        public IWebElement URLTextBox
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("uRLInput"));
            }
        }

        public IWebElement ZipTextBox
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("zipInput"));
            }
        }

        public IWebElement StartsWithDNATextBox
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("startsWithDPTInput"));
            }
        }

        public IWebElement ContainsDNATextBox
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("containsDPTInput"));
            }
        }

        public IWebElement DateNavigationLeftButton
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.XPath("//button[@class='btn btn-default btn-sm pull-left']"));
            }
        }

        public IWebElement DateNavigationRightButton
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.XPath("//button[@class='btn btn-default btn-sm pull-right']"));
            }
        }

        public IWebElement SaveButton
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.XPath("//button[3]"), 10);
            }
        }

        ////public bool isErrorMessageForRequiredField
        ////{
        ////    get
        ////    {
        ////        // return AutomationService.HasElement(this.WebDriver, By.XPath("//span[contains(text(),\"Error: 'integer' is required\")]"));
        ////    }
        ////}

        #endregion

        #region Error Message Popup
        public IWebElement ErrorMessageForInteger
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("errorMessageForintegerInput"));
            }
        }

        public IWebElement ErrorMessageForAge
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("errorMessageForageInput"));
            }
        }

        public IWebElement ErrorMessageForCreditCard
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("errorMessageForcreditCardInput"));
            }
        }

        public IWebElement ErrorMessageForPhone
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("errorMessageForphoneInput"));
            }
        }
        //errorMessageForphoneInput

        public IWebElement ErrorMessageForEmail
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("errorMessageForemailInput"));
            }
        }

        public IWebElement ErrorMessageForURL
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("errorMessageForuRLInput"));
            }
        }

        public IWebElement ErrorMessageForZip
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("errorMessageForzipInput"));
            }
        }

        public IWebElement ErrorMessageForTextStartingWithDNA
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("errorMessageForstartsWithDPTInput"));
            }
        }

        public IWebElement ErrorMessageForTextContainingDNA
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("errorMessageForcontainsDPTInput"));
            }
        }
        ////span[contains(text(),'01') and @class='ng-binding']
        ////button[@class='btn btn-default btn-sm pull-left']
        #endregion

        #region Methods
        public void GoTo()
        {
            base.GoToValidationPage();
        }

        public ValidationPage AddValidation()
        {
            AutomationService.SearchElement(this.WebDriver, By.LinkText("Add Validation"), 10).Click();
            return this;
        }

        public ValidationPage WithInteger(string integer)
        {
            this.IntegerTextBox.SendKeys(integer, true);
            return this;
        }

        public ValidationPage WithString(string text)
        {
            this.StringTextBox.SendKeys(text, true);
            return this;
        }

        ////public ValidationPage PickDay(string day)
        ////{
        ////    AutomationService.SearchElement(this.WebDriver, By.XPath("//span[contains(text(),'" + day + "') and @class='ng-binding']")).Click();
        ////    return this;
        ////}
        
        public ValidationPage OpenCalendar()
        {
            this.DateButton.Click();
            return this;
        }

        public ValidationPage OpenBeforeDateCalendar()
        {
            this.BeforeDateButton.Click();
            return this;
        }

        public ValidationPage OpenAfterDateCalendar()
        {
            this.AfterDateButton.Click();
            return this;
        }

        // close calendar
        ////input[@id='afterDateInput']//following-sibling::*/li[@class='ng-scope']/button
        // calendar
        //input[@id='afterDateInput']//following-sibling::*/

        public ValidationPage SelectDateFormat(DateFormat dateFormat)
        {
            string dateFormatText = string.Empty;
            switch (dateFormat)
            {
                case DateFormat.ddMMMMyyyy:
                    dateFormatText = "dd-MMMM-yyyy";
                    break;
                case DateFormat.ddMMyyyy:
                    dateFormatText = "dd-MM-yyyy";
                    break;
                case DateFormat.MMddyyyy:
                    dateFormatText = "MM-dd-yyyy";
                    break;
                case DateFormat.MMMMddyyyy:
                    dateFormatText = "MMMM-dd-yyyy";
                    break;
                case DateFormat.yyyyMMdd:
                    dateFormatText = "yyyy-MM-dd";
                    break;
                default:
                    dateFormatText = dateFormat.ToString();
                    break;
            }

            this.DateFormatSelectBox.SelectByText(dateFormatText);
            return this;
        }

        public ValidationPage SelectDateFormat(string dateFormatText)
        {
            this.DateFormatSelectBox.SelectByText(dateFormatText);
            return this;
        }

        public ValidationPage SelectDay(string day)
        {
            AutomationService.SearchElement(this.WebDriver, By.XPath("//span[contains(text(),'" + day + "') and @class='ng-binding']")).Click();
            return this;
        }

        public ValidationPage SelectDayOfBeforeDay(string day)
        {
            AutomationService.SearchElement(this.WebDriver, By.XPath("//label[contains(text(),'Before Date')]/following-sibling::*//ul//span[contains(text(),'" + day + "') and @class='ng-binding']")).Click();
            return this;
        }

        public ValidationPage SelectDayOfAfterDay(string day)
        {
            AutomationService.SearchElement(this.WebDriver, By.XPath("//label[contains(text(),'After Date')]/following-sibling::*//ul//span[contains(text(),'" + day + "') and @class='ng-binding']")).Click();
            return this;
        }
        ////label[contains(text(),'Before Date')]/following-sibling::*//ul//span[contains(text(),'18') and @class='ng-binding']

        public ValidationPage CloseCalendar()
        {
            this.CalendarCloseButton.Click();
            return this;
        }

        public string GetDateFromDateTextBox()
        {
            return this.DateTextBox.GetAttribute("value");
        }

        public ValidationPage WithAge(string age)
        {
            this.AgeTextBox.SendKeys(age, true);
            return this;
        }

        public ValidationPage WithCreditCard(string creditCard)
        {
            this.CreditCardTextBox.SendKeys(creditCard, true);
            return this;
        }

        public ValidationPage WithEmail(string email)
        {
            this.EmailTextBox.SendKeys(email, true);
            return this;
        }

        public ValidationPage WithPhone(string phone)
        {
            this.PhoneTextBox.SendKeys(phone, true);
            return this;
        }

        public ValidationPage WithURL(string url)
        {
            this.URLTextBox.SendKeys(url, true);
            return this;
        }

        public ValidationPage WithZip(string zip)
        {
            this.ZipTextBox.SendKeys(zip, true);
            return this;
        }

        public ValidationPage WithStartsWithText(string text)
        {
            this.StartsWithDNATextBox.SendKeys(text, true);
            return this;
        }

        public ValidationPage WithContainsText(string text)
        {
            this.ContainsDNATextBox.SendKeys(text, true);
            return this;
        }

        public ValidationPage Save()
        {
           //// this.SaveButton.BringElementToViewWithBottomAlignment(this.WebDriver);
            this.SaveButton.Click();
            return this;
        }
        #endregion

        #region Assert Methods
        //(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d
        //^(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d$
        public bool CheckDateFormat(string dateText, string dateFormatText)
        {
            Regex dateFormatRegex;
            string dateFormatRegexPattern = string.Empty;
            switch (dateFormatText)
            {
                case "dd-MM-yyyy":
                    dateFormatRegexPattern = @"(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d";
                    break;
            }

            dateFormatRegex = new Regex(dateFormatRegexPattern);
            if(dateFormatRegex.Match(dateText).Success)
            {
                return true;
            }

            return false;
        }
        #endregion
    }
}