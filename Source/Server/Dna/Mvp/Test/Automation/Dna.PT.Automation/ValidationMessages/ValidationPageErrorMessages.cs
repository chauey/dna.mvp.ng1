namespace Dna.PT.Automation.ValidationMessages
{
    public class ValidationPageErrorMessage
    {
        #region Error Message Variables
        ////public const string RequiredInteger = "'integer' is required";
        ////public const string InvalidInteger = "'integer' must be an integer between the values of -2147483648 and 2147483647; 'integer' must be an integer";
        ////public const string OutOfRangeAge = "age must be between 1 and 150";
        ////public const string AgeNotInInteger = "'age' must be an integer between the values of -2147483648 and 2147483647; 'age' must be an integer";
        ////public const string InvalidCreditCardNumberFormat = "'creditCard' must be a number; 'creditCard' must be an integer";
        ////public const string CreditCardNumberOutOfLength = "creditCard must be equal or less than 16 characters.";
        ////public const string PhoneNumberOutOfLength = "'phone' must be a string with 15 characters or less";
        ////public const string ZipOutOfLength = "'zip' must be a string with 5 characters or less";
        #endregion

        #region Get Error Messages
        public static string GetErrorMessageForRequiredInteger()
        {
            return "'integer' is required";
        }

        public static string GetErrorMessageForInvalidInteger()
        {
            return "'integer' must be an integer between the values of -2147483648 and 2147483647; 'integer' must be an integer";
        }

        public static string GetErrorMessageForOutOfRangeAge()
        {
            return "age must be between 1 and 150";
        }

        public static string GetErrorMessageForNonIntegerAge()
        {
            return "'age' must be an integer between the values of -2147483648 and 2147483647; 'age' must be an integer";
        }

        public static string GetErrorMessageForInvalidCreditCardNumberFormat()
        {
            return "'creditCard' must be a number; 'creditCard' must be an integer";
        }

        public static string GetErrorMessageForOutOfLengthCreditCardNumber()
        {
            return "creditCard must be equal or less than 16 characters.";
        }

        public static string GetErrorMessageForOutOfLengthPhoneNumber()
        {
            return "'phone' must be a string with 15 characters or less";
        }

        public static string GetErrorMessageForOutOfLengthZip()
        {
            return "'zip' must be a string with 5 characters or less";
        }

        public static string GetErrorMessageForInvalidEmailFormat(string email)
        {
            return "The email '" + email + "' is not a valid email address";
        }

        public static string GetErrorMessageForNonIntegerPhoneNumber(string phoneNumber)
        {
            return "'" + phoneNumber + "' is not a positive integer.";
        }

        public static string GetErrorMessageForInvalidURL(string url)
        {
            return "The uRL '" + url + "' is not a valid url";
        }

        public static string GetErrorMessageForNonIntegerZip(string zip)
        {
            return "'" + zip + "' is not a positive integer.";
        }

        public static string GetErrorMessageForTextContainingDNA(string inputText)
        {
            return "'" + inputText + "' must contains 'DNA' or 'dna'.";
        }

        public static string GetErrorMessageForTextStartingWithDNA(string inputText)
        {
            return "'" + inputText + "' must starts with 'DNA' or 'dna'";
        }
        #endregion
    }
}
