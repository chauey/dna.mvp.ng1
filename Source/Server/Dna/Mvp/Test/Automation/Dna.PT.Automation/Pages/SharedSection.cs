using OpenQA.Selenium;

namespace Dna.PT.Automation
{
    public class SharedSection
    {
        public IWebDriver WebDriver { get; set; }

        #region Constructors
        public SharedSection()
        {
        }
        public SharedSection(IWebDriver webDriver)
        {
            this.WebDriver = webDriver;
        }
        #endregion

        #region Methods
        public string GetHomePageTitle()
        {
            return AutomationService.SearchElement(this.WebDriver, By.XPath("//span[@class='brand-title']")).Text;
        }

        public virtual void GoToLoginPage()
        {
            AutomationService.SearchElement(this.WebDriver, By.LinkText("Login")).Click();
        }

        public void GoToRegisterPage()
        {
            AutomationService.SearchElement(this.WebDriver, By.LinkText("Register")).Click();
        }

        public void GoToValidationPage()
        {
            ////AutomationService.SearchElement(this.WebDriver, By.LinkText("Validations")).Click();
            AutomationService.SearchElement(this.WebDriver, By.XPath("//a[@href='#/validationList']")).Click();
        }

        /// <summary>
        /// Looks for a menu which has the link to the typeOfTypeList page
        /// and do the Click action on it.
        /// </summary>
        public void GoToTypeOfTypeListPage()
        {
            // looks for an menu element from the left menu-bar
            // that links to the TypeOfType list page
            IWebElement typeOfTypeMenuElement =
                AutomationService.SearchElement(this.WebDriver, By.XPath("//a[@href='#/typeOfTypeList']"));

            if (typeOfTypeMenuElement != null)
            {
                // performs a click action on the found element.
                typeOfTypeMenuElement.Click();
            }
        }

        #endregion
    }
}
