using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OpenQA.Selenium;

namespace Dna.PT.Automation
{
    public class RegisterPage : SharedSection
    {
        #region Constructors
        public RegisterPage()
        {
        }

        public RegisterPage(IWebDriver webDriver)
        {
            WebDriver = webDriver;
        }
        #endregion

        #region Methods
        public void GoTo()
        {
            base.GoToRegisterPage();
        }

        public bool HasErrorMessageWhenRegisteringWithOccupiedName(string errorText)
        {
            return AutomationService.HasElement(this.WebDriver, By.XPath("//div[contains(text(),'" + errorText + "')]"));
        }

        public RegisterPage PutInUserName(string username)
        {
            AutomationService.SearchElement(this.WebDriver, By.XPath("//label[contains(text(),'Username')]//following-sibling::*/input")).SendKeys(username);
            return this;
        }

        public RegisterPage PutInPassword(string password)
        {
            AutomationService.SearchElement(this.WebDriver, By.XPath("//label[contains(text(),'Password')]//following-sibling::*/input")).SendKeys(password);
            AutomationService.SearchElement(this.WebDriver, By.XPath("//label[contains(text(),'Confirm Password')]//following-sibling::*/input")).SendKeys(password);
            return this;
        }

        public void Register()
        {
            AutomationService.SearchElement(this.WebDriver, By.XPath("//button[@class='infoButton']")).Click();
        }

        public RegisterPage Reset()
        {
            AutomationService.SearchElement(this.WebDriver, By.XPath("//button[@class='defaultButton']")).Click();
            return this;
        }

        public void Register(string username, string password)
        {
            PutInUserName(username).PutInPassword(password).Register();
        }

        public int GetGivenOperand()
        {
            return short.Parse(AutomationService.SearchElement(this.WebDriver, By.XPath("//span[@class='ng-binding']")).Text);
        }

        public int GetCalculationResult()
        {
            string result = AutomationService.SearchElement(this.WebDriver, By.XPath("//simple-captcha[@class='ng-binding ng-isolate-scope']")).Text;
            result = result.Substring(result.Length-1, 1);
            return short.Parse(result);
        }

        public int GetNeededOperand()
        {
            return GetCalculationResult() - GetGivenOperand();
        }

        public RegisterPage PutInValueForNeededOperand()
        {
            AutomationService.SearchElement(this.WebDriver, By.XPath("//input[@class='ng-pristine ng-valid']")).SendKeys(GetNeededOperand().ToString());
            AutomationService.SearchElement(this.WebDriver, By.XPath("//simple-captcha[@class='ng-binding ng-isolate-scope']")).Highlight(this.WebDriver);
            return this;
        }
        #endregion
    }
}
