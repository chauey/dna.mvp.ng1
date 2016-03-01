using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.Events;

namespace Dna.PT.Automation
{
    public class Listener : WebDriverEventListener
    {
        private EventFiringWebDriver webDriver;

        public Listener(EventFiringWebDriver webDriver)
        {
            this.webDriver = webDriver;
        }

        public void BeforeNavigateTo(String url, EventFiringWebDriver driver)
        {
        }

        /**
         * Called after {@link org.openqa.selenium.WebDriver#get get(String url)} respectively
         * {@link org.openqa.selenium.WebDriver.Navigation#to navigate().to(String url)}. Not called, if an
         * exception is thrown.
         */
        public void AfterNavigateTo(String url, EventFiringWebDriver driver) { }

        /**
         * Called before {@link org.openqa.selenium.WebDriver.Navigation#back navigate().back()}.
         */
        public void BeforeNavigateBack(EventFiringWebDriver driver) { }

        /**
         * Called after {@link org.openqa.selenium.WebDriver.Navigation navigate().back()}. Not called, if an
         * exception is thrown.
         */
        public void AfterNavigateBack(EventFiringWebDriver driver) { }

        /**
         * Called before {@link org.openqa.selenium.WebDriver.Navigation#forward navigate().forward()}.
         */
        public void BeforeNavigateForward(EventFiringWebDriver driver) { }

        /**
         * Called after {@link org.openqa.selenium.WebDriver.Navigation#forward navigate().forward()}. Not called,
         * if an exception is thrown.
         */
        public void AfterNavigateForward(EventFiringWebDriver driver) { }

        /**
         * Called before {@link WebDriver#findElement WebDriver.findElement(...)}, or
         * {@link WebDriver#findElements WebDriver.findElements(...)}, or {@link WebElement#findElement
         * WebElement.findElement(...)}, or {@link WebElement#findElement WebElement.findElements(...)}.
         *
         * @param element will be <code>null</code>, if a find method of <code>WebDriver</code> is called.
         */
        public void BeforeFindBy(By by, IWebElement element, EventFiringWebDriver driver) { }

        /**
         * Called after {@link WebDriver#findElement WebDriver.findElement(...)}, or
         * {@link WebDriver#findElements WebDriver.findElements(...)}, or {@link WebElement#findElement
         * WebElement.findElement(...)}, or {@link WebElement#findElement WebElement.findElements(...)}.
         *
         * @param element will be <code>null</code>, if a find method of <code>WebDriver</code> is called.
         */
        public void AfterFindBy(By by, IWebElement element, EventFiringWebDriver driver) { }

        /**
         * Called before {@link WebElement#click WebElement.click()}.
         */
        public void BeforeClickOn(IWebElement element, EventFiringWebDriver driver)
        {

        }

        /**
         * Called after {@link WebElement#click WebElement.click()}. Not called, if an exception is
         * thrown.
         */
        public void AfterClickOn(object sender, WebElementEventArgs e)
        {
            e.Element.Highlight(e.Driver);
            e.Driver.TakeScreenshot("file3.jpeg");
            e.Element.UnHighlight(e.Driver);
        }
        /**
         * Called before {@link WebElement#clear WebElement.clear()}, {@link WebElement#sendKeys
         * WebElement.sendKeys(...)}.
         */
        public void BeforeChangeValueOf(IWebElement element, EventFiringWebDriver driver) { }

        /**
         * Called after {@link WebElement#clear WebElement.clear()}, {@link WebElement#sendKeys
         * WebElement.sendKeys(...)}}. Not called, if an exception is thrown.
         */
        public void AfterChangeValueOf(IWebElement element, EventFiringWebDriver driver) { }

        /**
         * Called before {@link org.openqa.selenium.remote.RemoteWebDriver#executeScript(java.lang.String, java.lang.Object[]) }
         */
        // Previously: Called before {@link WebDriver#executeScript(String)}
        // See the same issue below.
        public void BeforeScript(String script, EventFiringWebDriver driver) { }

        /**
         * Called after {@link org.openqa.selenium.remote.RemoteWebDriver#executeScript(java.lang.String, java.lang.Object[]) }. Not called if an exception is thrown
         */
        // Previously: Called after {@link WebDriver#executeScript(String)}. Not called if an exception is thrown
        // So someone should check if this is right.  There is no executeScript method
        // in WebDriver, but there is in several other places, like this one
        public void AfterScript(String script, EventFiringWebDriver driver) { }

        /**
         * Called whenever an exception would be thrown.
         */
        public void OnException(object sender, WebDriverExceptionEventArgs e)
        {
            e.Driver.TakeScreenshot("file2.jpeg");
        }
    }
}
