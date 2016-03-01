using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Excel = Microsoft.Office.Interop.Excel;
using System.Reflection;

namespace Dna.PT.Automation
{
    public class ExcelService
    {
        private static string ExcelConnectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source= '" + Directory.GetCurrentDirectory() + "\\TestData.xlsx';Extended Properties='Excel 8.0;HDR=Yes;'";
        public static string testCaseID = string.Empty;

        public static DataRow ReadTestDataForTestCaseFromExcelFile(string testcase)
        {
            Excel.Application application = new Excel.Application();
            Excel.Workbook workbook = application.Workbooks.Open(Directory.GetCurrentDirectory() + "\\TestData.xlsx");
            Excel.Worksheet workSheet = (Excel.Worksheet)workbook.Worksheets.get_Item(1);

            OleDbConnection connection = new OleDbConnection(ExcelConnectionString);
            connection.Open();
            OleDbCommand command = new OleDbCommand();
            DataTable excelData = new DataTable();
            command.Connection = connection;
            command.CommandType = CommandType.Text;
            command.CommandText = GenerateQueryString(testcase);
            OleDbDataReader reader = command.ExecuteReader();
            excelData.Load(reader);
            foreach (DataRow row in excelData.Rows)
            {
                if (row[0].ToString() == ExcelService.testCaseID && row[1].ToString() == testcase)
                {
                    return row;
                }
            }

            return null;
        }

        // Read all lines for test cases in the excel sheet
        public static IList<IList<string>> GetTestCasesFromExcelFile()
        {
            ////Excel.Application application = new Excel.Application();
            ////Excel.Workbook workbook = application.Workbooks.Open(Directory.GetCurrentDirectory() + "\\TestData.xlsx");
            ////Excel.Worksheet workSheet = (Excel.Worksheet)workbook.Worksheets.get_Item(1);

            ////IList<IList<string>> TestCaseList = new List<IList<string>>();
            ////foreach (Excel.Range row in workSheet.Rows)
            ////{
            ////    if (workSheet.Cells[row.Row, 1] != null && workSheet.Cells[row.Row, 1].Value != null &&
            ////        workSheet.Cells[row.Row, 2] != null && workSheet.Cells[row.Row, 2].Value != null)
            ////    {
            ////        List<string> rowItem = new List<string>();
            ////        rowItem.Add(workSheet.Cells[row.Row, 1].Value.ToString());
            ////        rowItem.Add(workSheet.Cells[row.Row, 2].Value.ToString());
            ////        TestCaseList.Add(rowItem);
            ////    }
            ////}

            ////ReleaseObject(workSheet);
            ////ReleaseObject(workbook);
            ////ReleaseObject(application);

            ////return TestCaseList;

            ////IList<string> TestCaseList = new List<string>();
            IList<IList<string>> TestCaseList = new List<IList<string>>();
            try
            {
                OleDbConnection connection = new OleDbConnection(ExcelConnectionString);
                connection.Open();
                OleDbCommand command = new OleDbCommand();
                DataTable excelData = new DataTable();
                command.Connection = connection;
                command.CommandType = CommandType.Text;

                // Get Sheet Name
                TestRunConfiguration testRunConfiguration = AutomationService.GetTestRunConfiguration();
                string sheetName = testRunConfiguration.TestDataSheet.ToString();
                command.CommandText = "Select [Test Case ID],[Name of Test Case] from [" + sheetName + "$]";
                OleDbDataReader reader = command.ExecuteReader();
                excelData.Load(reader);
                foreach (DataRow row in excelData.Rows)
                {
                    IList<string> rowItem = new List<string>();
                    rowItem.Add(row[0].ToString());
                    rowItem.Add(row[1].ToString());
                    TestCaseList.Add(rowItem);
                }
            }
            catch (Exception ex)
            {
            }

            return TestCaseList;
        }

        private static void ReleaseObject(object obj)
        {
            try
            {
                System.Runtime.InteropServices.Marshal.ReleaseComObject(obj);
                obj = null;
            }
            catch (Exception ex)
            {
                obj = null;
            }
            finally
            {
                GC.Collect();
            }
        } 

        // Define query string to select necessary columns for test data from the excel file
        public static string GenerateQueryString(string testcase)
        {
            string queryString = string.Empty;
            TestRunConfiguration testRunConfiguration = AutomationService.GetTestRunConfiguration();
            string sheetName = testRunConfiguration.TestDataSheet.ToString();
            switch (testcase)
            {
                case "RegisterWithInvalidUsername":
                    queryString = "Select [Test Case ID],[Name of Test Case],[Username],[Password] from [" + sheetName + "$]";
                    break;
                case "ValidateRequiredIntegerValue":
                    queryString = "Select [Test Case ID],[Name of Test Case],[Integer] from [" + sheetName + "$]";
                    break;
                case "ValidateInvalidIntegerValue":
                    queryString = "Select [Test Case ID],[Name of Test Case],[Integer] from [" + sheetName + "$]";
                    break;
                case "ValidateOutOfRangeAgeValue":
                    queryString = "Select [Test Case ID],[Name of Test Case],[Age] from [" + sheetName + "$]";
                    break;
                case "ValidateAgeValueNotInInteger":
                    queryString = "Select [Test Case ID],[Name of Test Case],[Age] from [" + sheetName + "$]";
                    break;
                case "PickDay":
                    queryString = "Select [Test Case ID],[Name of Test Case],[Day], [Date Format] from [" + sheetName + "$]";
                    break;
                ////case "CheckValidationPage":
                ////    queryString = "Select [Test Case ID],[Name of Test Case],[Integer],[String],[Age],[Day],[Date Format],[Credit Card],[Email],[Phone],[URL],[Zip],[Starts With DNA],[Contains DNA] from [" + sheetName + "$]";
                ////    break;
                case "CheckValidationPage":
                    queryString = "Select * from [" + sheetName + "$]";
                    break;
            }

            return queryString;
        }

        public static void WriteTestCaseResult(string testcase)
        {
            TestRunConfiguration testRunConfiguration = AutomationService.GetTestRunConfiguration();
            Excel.Workbook workbook;
            Excel.Application myExcelApp = new Excel.Application();
            ////string myPath = @"C:\Workspaces\DnaCLV2\Source\PatientPortalAutomationTest\TestData.xlsx";
            string excelFilePath = Directory.GetCurrentDirectory() + "\\TestData.xlsx";
            workbook = myExcelApp.Workbooks.Open(excelFilePath);
            foreach (Excel.Worksheet worksheet in workbook.Worksheets)
            {
                if (worksheet.Name == testRunConfiguration.TestDataSheet.ToString())
                {
                    Excel.Range usedRange = worksheet.UsedRange;
                    foreach (Excel.Range row in usedRange.Rows)
                    {
                        if (worksheet.Cells[row.Row, 2].Value == testcase)
                        {
                            worksheet.Cells[row.Row, 3].Value = "Pass";
                            worksheet.Cells[row.Row, 3].Font.Color = System.Drawing.Color.Blue;
                        }
                    }
                }
            }

            workbook.Save();
            myExcelApp.Quit();
        }

        // For future implementation of writing test results to excel file
        public static void WriteTestCaseResult(string testcaseID, string worksheetName, bool result)
        {
            Excel.Workbook workbook;
            Excel.Application myExcelApp = new Excel.Application();
            //// string myPath = @"C:\Workspaces\DnaCLV2\Source\PatientPortalAutomationTest\TestData.xlsx";
            string myPath = Directory.GetCurrentDirectory() + "\\TestData.xlsx";
            workbook = myExcelApp.Workbooks.Open(myPath);
            foreach (Excel.Worksheet worksheet in workbook.Worksheets)
            {
                if (worksheet.Name == worksheetName)
                {
                    Excel.Range usedRange = worksheet.UsedRange;
                    foreach (Excel.Range row in usedRange.Rows)
                    {
                        if (worksheet.Cells[row.Row, 1].Value == testcaseID)
                        {
                            if (result)
                            {
                                worksheet.Cells[row.Row, 3].Value = "Passed";
                                worksheet.Cells[row.Row, 3].Font.Color = System.Drawing.Color.Blue;
                            }
                            else
                            {
                                worksheet.Cells[row.Row, 3].Value = "Failed";
                                worksheet.Cells[row.Row, 3].Font.Color = System.Drawing.Color.Red;
                            }
                        }
                    }
                }
            }

            workbook.Save();
            myExcelApp.Quit();
        }


        //excelFilePath

        ////     public static void WriteTestResult(string testcaseID, Excel.Workbook workbook, string worksheetName, bool result, string excelFilePath)
        ////     {
        ////         foreach (Excel.Worksheet worksheet in workbook.Worksheets)
        ////         {
        ////             if (worksheet.Name == worksheetName)
        ////             {
        ////                 Excel.Range usedRange = worksheet.UsedRange;
        ////                 foreach (Excel.Range row in usedRange.Rows)
        ////                 {
        ////                     if (worksheet.Cells[row.Row, 1].Value == testcaseID)
        ////                     {
        ////                         if (result)
        ////                         {
        ////                             worksheet.Cells[row.Row, 3].Value = "Passed";
        ////                             worksheet.Cells[row.Row, 3].Font.Color = System.Drawing.Color.Blue;
        ////                         }
        ////                         else
        ////                         {
        ////                             worksheet.Cells[row.Row, 3].Value = "Failed";
        ////                             worksheet.Cells[row.Row, 3].Font.Color = System.Drawing.Color.Red;
        ////                         }

        ////                         break;
        ////                     }
        ////                 }
        ////             }
        ////         }

        ////         workbook.SaveAs(excelFilePath, Microsoft.Office.Interop.Excel.XlFileFormat.xlWorkbookNormal,
        ////Missing.Value, Missing.Value, Missing.Value, Missing.Value, Microsoft.Office.Interop.Excel.XlSaveAsAccessMode.xlExclusive,
        ////Missing.Value, Missing.Value, Missing.Value,
        ////Missing.Value, Missing.Value);
        ////     }

        public static void WriteTestResult(string testcaseID, Excel.Workbook workbook, string worksheetName, bool result)
        {
            foreach (Excel.Worksheet worksheet in workbook.Worksheets)
            {
                if (worksheet.Name == worksheetName)
                {
                    Excel.Range usedRange = worksheet.UsedRange;
                    foreach (Excel.Range row in usedRange.Rows)
                    {
                        if (worksheet.Cells[row.Row, 1].Value == testcaseID)
                        {
                            if (result)
                            {
                                worksheet.Cells[row.Row, 3].Value = "Passed";
                                worksheet.Cells[row.Row, 3].Font.Color = System.Drawing.Color.Blue;
                            }
                            else
                            {
                                worksheet.Cells[row.Row, 3].Value = "Failed";
                                worksheet.Cells[row.Row, 3].Font.Color = System.Drawing.Color.Red;
                            }

                            break;
                        }
                    }
                }
            }

            workbook.Save();
        }
    }
}
