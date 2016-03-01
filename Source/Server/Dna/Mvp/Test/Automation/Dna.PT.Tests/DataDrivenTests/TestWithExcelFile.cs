using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Reflection;
////using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using NUnit.Framework;
using Dna.PT.Automation;
using Excel = Microsoft.Office.Interop.Excel;

namespace Dna.PT.Tests
{
    ////[TestClass]
    [TestFixture]
    public class TestWithTestDataFile
    {
        ////Driver driver;
        ////Excel.Workbook workbook;
        ////string sheetName;
        ////public string excelFilePath;

        [TestFixtureSetUp]
        public void InitializeTestFixture()
        {
            ////Excel.Application myExcelApp = new Excel.Application();
            ////myExcelApp.DisplayAlerts = false;
            ////excelFilePath = Directory.GetCurrentDirectory() + "\\TestData.xlsx";
            ////workbook = myExcelApp.Workbooks.Open(excelFilePath);
            ////TestRunConfiguration testRunConfiguration = AutomationService.GetTestRunConfiguration();
            ////sheetName = testRunConfiguration.TestDataSheet.ToString();
        }

        [TestFixtureTearDown]
        public void CloseTestFixture()
        {
            ////workbook.Close();
        }

        public Driver driver;

        [SetUp]
        public void Init()
        {
            driver = new Driver();
        }

        [TearDown]
        public void Close()
        {
            // driver.Close();
        }

        ////[SetUp]
        ////////[TestInitialize]
        ////public void SetupTest()
        ////{
        ////    driver = new Driver();
        ////}

        //////[TearDown]
        ////////[TestCleanup]
        ////public void CloseTest()
        ////{
        ////    // driver.Close();
        ////}

        public void Test(string testCaseID, string testCaseName)
        {
            string assemblyName = Assembly.GetExecutingAssembly().GetName().Name;
            foreach (Type t in Assembly.GetExecutingAssembly().GetTypes())
            {
                    foreach (MethodInfo m in t.GetMethods())
                    {
                        if (m.Name == testCaseName)
                        {
                            ExcelCsvService.testCaseID = testCaseID;
                            Type type = Type.GetType(assemblyName + "." + t.Name);
                            object instance = Activator.CreateInstance(type);
                            MethodInfo method = type.GetMethod(testCaseName, new Type[] { typeof(IWebDriver) });
                            method.Invoke(instance, new object[] { driver.WebDriver });
                            break;
                        }
                    }
            }
        }

        public IList<IList<string>> GetTestCases()
        {
            IList<IList<string>> testCaseList = ExcelService.GetTestCasesFromExcelFile();
            return testCaseList;
        }

        [Test, TestCaseSource("TestCaseDataList")]
        public void RunAllTestCasesInTestDataFile(string testCaseID, string testCaseName)
        {
            Test(testCaseID, testCaseName);
        }

        public IEnumerable<TestCaseData> TestCaseDataList
        {
            get
            {
                IList<IList<string>> testCaseDataList =  ExcelCsvService.GetTestCasesFromExcelFile();
                foreach (IList<string> testCaseItem in testCaseDataList)
                {
                    TestCaseData testCaseData = new TestCaseData(testCaseItem[0].ToString(), testCaseItem[1].ToString());
                    yield return testCaseData;
                }
            }
        }
    }
}