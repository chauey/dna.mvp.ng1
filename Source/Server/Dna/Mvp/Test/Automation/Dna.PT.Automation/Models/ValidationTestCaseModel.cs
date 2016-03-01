using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dna.PT.Automation.Models
{
    public class ValidationTestCaseModel : TestCaseBaseModel
    {
        public string IntegerValue { get; set; }
        public string StringValue { get; set; }
        public string DateFormatValue { get; set; }
        public string DayValue { get; set; }
        public string DayOfBeforeDateValue { get; set; }
        public string AgeValue { get; set; }
        public string CreditCardValue { get; set; }
        public string EmailValue { get; set; }
        public string PhoneValue { get; set; }
        public string UrlValue { get; set; }
        public string ZipValue { get; set; }
        public string StartsWithDnaValue { get; set; }
        public string ContainsDnaValue { get; set; }
    }
}
