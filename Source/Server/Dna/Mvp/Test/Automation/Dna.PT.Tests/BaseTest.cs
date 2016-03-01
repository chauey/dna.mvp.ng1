using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dna.PT.Automation;
using NUnit.Framework;

namespace Dna.PT.Tests
{
    [TestFixture]
    public class BaseTest
    {
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
    }
}