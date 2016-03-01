using Dna.PT.Automation.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dna.PT.Automation
{
    public class ExcelCsvService
    {
        public static string testCaseID = string.Empty;
        private static string validationTestCaseFilePath = @"TestDataFiles\ValidationTestData.csv";

        public static List<ValidationTestCaseModel> ReadAllTestDataForTestCaseFromValidationExcelFile()
        {
            List<ValidationTestCaseModel> validationTestCaseModels = new List<ValidationTestCaseModel>();
            List<string> lines = File.ReadAllLines(validationTestCaseFilePath).Select(a => a.Split(';')[0]).Skip(1).ToList();
            foreach (string line in lines)
            {
                validationTestCaseModels.Add(ConvertToValidationTestCaseModelFromRowValue(line));
            }

            return validationTestCaseModels;
        }

        // Read all lines for test cases in the excel sheet
        public static IList<IList<string>> GetTestCasesFromExcelFile()
        {
            IList<IList<string>> testCaseList = new List<IList<string>>();
            try
            {
                var lines = File.ReadAllLines(validationTestCaseFilePath).Select(a => a.Split(';')).Skip(1).ToList();
                foreach (var item in lines)
                {
                    string[] row = item[0].Split(',');
                    IList<string> rowItem = new List<string>();
                    rowItem.Add(row[0].ToString());
                    rowItem.Add(row[1].ToString());
                    testCaseList.Add(rowItem);
                }
            }
            catch (Exception ex)
            {
                // TODO: use logger to log this exception...
            }

            return testCaseList;
        }

        public static ValidationTestCaseModel ReadTestDataForTestCaseFromValidationExcelFile(string testName)
        {
            string testNameData = File.ReadAllLines(validationTestCaseFilePath)
                .Select(a => a.Split(';').FirstOrDefault())
                .Skip(1)
                .FirstOrDefault(a => a.Contains(testName) && a.Contains(testCaseID));

            return ConvertToValidationTestCaseModelFromRowValue(testNameData);
        }

        private static ValidationTestCaseModel ConvertToValidationTestCaseModelFromRowValue(string rowValue)
        {
            if (rowValue == null)
            {
                return new ValidationTestCaseModel();
            }

            string[] columnArray = rowValue.Split(',');
            return new ValidationTestCaseModel()
            {
                TestCaseID = columnArray[0],
                TestCaseName = columnArray[1],
                IntegerValue = columnArray[2],
                StringValue = columnArray[3],
                AgeValue = columnArray[4],
                DayValue = columnArray[5],
                DayOfBeforeDateValue = columnArray[6],
                DateFormatValue = columnArray[7],
                CreditCardValue = columnArray[8],
                EmailValue = columnArray[9],
                PhoneValue = columnArray[10],
                UrlValue = columnArray[11],
                ZipValue = columnArray[12],
                StartsWithDnaValue = columnArray[13],
                ContainsDnaValue = columnArray[14],
            };
        }
    }
}
