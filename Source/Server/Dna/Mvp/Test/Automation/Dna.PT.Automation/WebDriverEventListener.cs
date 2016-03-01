using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OpenQA.Selenium.Support.Events;
using OpenQA.Selenium;

namespace Dna.PT.Automation
{
    // https://github.com/SeleniumHQ/selenium/blob/master/java/client/src/org/openqa/selenium/support/events/WebDriverEventListener.java

    public interface WebDriverEventListener
    {
        /**
   * Called before {@link org.openqa.selenium.WebDriver#get get(String url)} respectively
   * {@link org.openqa.selenium.WebDriver.Navigation#to navigate().to(String url)}.
   */
        void BeforeNavigateTo(String url, EventFiringWebDriver driver);

        /**
         * Called after {@link org.openqa.selenium.WebDriver#get get(String url)} respectively
         * {@link org.openqa.selenium.WebDriver.Navigation#to navigate().to(String url)}. Not called, if an
         * exception is thrown.
         */
        void AfterNavigateTo(String url, EventFiringWebDriver driver);

        /**
         * Called before {@link org.openqa.selenium.WebDriver.Navigation#back navigate().back()}.
         */
        void BeforeNavigateBack(EventFiringWebDriver driver);

        /**
         * Called after {@link org.openqa.selenium.WebDriver.Navigation navigate().back()}. Not called, if an
         * exception is thrown.
         */
        void AfterNavigateBack(EventFiringWebDriver driver);

        /**
         * Called before {@link org.openqa.selenium.WebDriver.Navigation#forward navigate().forward()}.
         */
        void BeforeNavigateForward(EventFiringWebDriver driver);

        /**
         * Called after {@link org.openqa.selenium.WebDriver.Navigation#forward navigate().forward()}. Not called,
         * if an exception is thrown.
         */
        void AfterNavigateForward(EventFiringWebDriver driver);

        /**
         * Called before {@link WebDriver#findElement WebDriver.findElement(...)}, or
         * {@link WebDriver#findElements WebDriver.findElements(...)}, or {@link WebElement#findElement
         * WebElement.findElement(...)}, or {@link WebElement#findElement WebElement.findElements(...)}.
         *
         * @param element will be <code>null</code>, if a find method of <code>WebDriver</code> is called.
         */
        void BeforeFindBy(By by, IWebElement element, EventFiringWebDriver driver);

        /**
         * Called after {@link WebDriver#findElement WebDriver.findElement(...)}, or
         * {@link WebDriver#findElements WebDriver.findElements(...)}, or {@link WebElement#findElement
         * WebElement.findElement(...)}, or {@link WebElement#findElement WebElement.findElements(...)}.
         *
         * @param element will be <code>null</code>, if a find method of <code>WebDriver</code> is called.
         */
        void AfterFindBy(By by, IWebElement element, EventFiringWebDriver driver);

        /**
         * Called before {@link WebElement#click WebElement.click()}.
         */
        void BeforeClickOn(IWebElement element, EventFiringWebDriver driver);

        /**
         * Called after {@link WebElement#click WebElement.click()}. Not called, if an exception is
         * thrown.
         */
        void AfterClickOn(object sender, WebElementEventArgs e);

        /**
         * Called before {@link WebElement#clear WebElement.clear()}, {@link WebElement#sendKeys
         * WebElement.sendKeys(...)}.
         */
        void BeforeChangeValueOf(IWebElement element, EventFiringWebDriver driver);

        /**
         * Called after {@link WebElement#clear WebElement.clear()}, {@link WebElement#sendKeys
         * WebElement.sendKeys(...)}}. Not called, if an exception is thrown.
         */
        void AfterChangeValueOf(IWebElement element, EventFiringWebDriver driver);

        /**
         * Called before {@link org.openqa.selenium.remote.RemoteWebDriver#executeScript(java.lang.String, java.lang.Object[]) }
         */
        // Previously: Called before {@link WebDriver#executeScript(String)}
        // See the same issue below.
        void BeforeScript(String script, EventFiringWebDriver driver);

        /**
         * Called after {@link org.openqa.selenium.remote.RemoteWebDriver#executeScript(java.lang.String, java.lang.Object[]) }. Not called if an exception is thrown
         */
        // Previously: Called after {@link WebDriver#executeScript(String)}. Not called if an exception is thrown
        // So someone should check if this is right.  There is no executeScript method
        // in WebDriver, but there is in several other places, like this one
        void AfterScript(String script, EventFiringWebDriver driver);

        /**
         * Called whenever an exception would be thrown.
         */
        void OnException(object sender, WebDriverExceptionEventArgs throwable);
    }
}
