using System;
using System.Linq;
using System.Text.RegularExpressions;

namespace Dna.Utilities
{
    public class Validation
    {
        public static bool IsValidZipCode(string zip)
        {
            return Regex.IsMatch(zip, @"(^\d{5}$)|(^\d{5}-\d{4}$)");
        }

        public static bool IsValidStateAbbreviation(string state)
        {
            var states = new String[]{  "AL","AK","AZ","AR","CA","CO","CT","DE",
                                        "FL","GA","HI","ID","IL","IN","IA","KS",
                                        "KY","LA","ME","MD","MA","MI","MN","MS",
                                        "MO","MT","NE","NV","NH","NJ","NM","NY",
                                        "NC","ND","OH","OK","OR","PA","RI","SC",
                                        "SD","TN","TX","UT","VT","VA","WA","WV",
                                        "WI","WY", "DC" };

            return states.Contains(state.ToUpper());
        }
    }
}