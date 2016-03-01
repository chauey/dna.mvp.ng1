using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace Dna.PT.Automation.Pages
{
    public class TypeOfTypePage : SharedSection
    {
        #region Constructors

        public TypeOfTypePage()
        {
        }

        public TypeOfTypePage(IWebDriver webDriver)
        {
            base.WebDriver = webDriver;
        }

        #endregion

        #region Properties

        #region Action Buttons

        public IWebElement BackButton
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("typeOfTypeBackButton"), 10);
            }
        }

        public IWebElement CancelButton
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("typeOfTypeCancelButton"), 10);
            }
        }

        public IWebElement SaveButton
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("typeOfTypeSaveButton"), 10);
            }
        }

        public IWebElement DeleteButton
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.Id("typeOfTypeDeleteButton"), 10);
            }
        }

        #endregion

        #region Main Columns

        public IWebElement NameTextBox
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.XPath("//input[@id='Name']"), 10);
            }
        }

        public IWebElement AbbreviationTextBox
        {
            get
            {
                return AutomationService.SearchElement(this.WebDriver, By.XPath("//input[@id='Abbreviation']"), 10);
            }
        }

        #endregion

        #region Foreign-key Combo-box(es)

        /// <summary>
        /// 
        /// </summary>
        /// <exception cref="OpenQA.Selenium.NoSuchElementException">
        /// OpenQA.Selenium.NoSuchElementException
        /// </exception>
        public SelectElement ParentComboBox
        {
            get
            {
                IWebElement parentComboBox = AutomationService.SearchElement(
                    this.WebDriver,
                    By.XPath("//select[@id='Parent']"),
                    10);

                return new SelectElement(parentComboBox);
            }
        }

        public SelectElement TypeComboBox
        {
            get
            {
                IWebElement typeComboBox = AutomationService.SearchElement(
                    this.WebDriver,
                    By.XPath("//select[@id='Type']"),
                    10);

                return new SelectElement(typeComboBox);
            }
        }

        #endregion

        #endregion

        #region Methods

        public void GoTo()
        {
            base.GoToTypeOfTypeListPage();
        }

        public TypeOfTypePage TryClickOnAddTypeOfTypeButton()
        {
            IWebElement addTypeOfTypeButton = AutomationService.SearchElement(
                this.WebDriver,
                By.Id("typeOfTypeClientAddButton"));

            addTypeOfTypeButton.Click();

            return this;
        }

        public TypeOfTypePage TryClickOnBackButton()
        {
            this.BackButton.Click();

            return this;
        }

        public TypeOfTypePage TryClickOnCancelButton()
        {
            this.CancelButton.Click();

            return this;
        }

        public TypeOfTypePage TryClickOnSaveButton()
        {
            this.SaveButton.Click();

            return this;
        }

        public TypeOfTypePage TryClickOnDeleteButton()
        {
            this.DeleteButton.Click();

            return this;
        }

        public TypeOfTypePage TrySendKeysToNameTextBox(string text)
        {

            this.NameTextBox.SendKeys(text);

            return this;
        }

        public TypeOfTypePage TrySendKeysToAbbreviationTextBox(string text)
        {
            this.AbbreviationTextBox.SendKeys(text);

            return this;
        }

        public TypeOfTypePage TrySelectTextOnParentComboBox(string option)
        {
            this.ParentComboBox.SelectByText(option);

            return this;
        }

        public TypeOfTypePage TrySelectIndexOnParentComboBox(int index)
        {
            this.ParentComboBox.SelectByIndex(index);

            return this;
        }

        public TypeOfTypePage TrySelectValueOnParentComboBox(string value)
        {
            this.ParentComboBox.SelectByValue(value);

            return this;
        }

        public TypeOfTypePage TrySelectTextOnTypeComboBox(string option)
        {
            this.TypeComboBox.SelectByText(option);

            return this;
        }

        public TypeOfTypePage TrySelectIndexOnTypeComboBox(int index)
        {
            this.TypeComboBox.SelectByIndex(index);

            return this;
        }

        public TypeOfTypePage TrySelectValueOnTypeComboBox(string value)
        {
            this.TypeComboBox.SelectByValue(value);

            return this;
        }

        #endregion
    }
}
