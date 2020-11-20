using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using AdvancedAlgos.AlgoToken.AlgoTokenDistribution.Algorithms;
using Xunit;

namespace AdvancedAlgos.AlgoToken.AlgoTokenDistribution.IntegrationTests.Algorithms
{
    public class FeesDistributionAlgorithmTests
    {
        [Fact]
        public void TestDistributionAlgorithm1()
        {
            var miners = new long[] { 100, 100, 100, 100, 100, 100 };
            var fees = FeesDistributionAlgorithm.Distribute(151000, miners);

            Assert.Equal(10, fees[0]);
            Assert.Equal(100, fees[1]);
            Assert.Equal(200, fees[2]);
            Assert.Equal(300, fees[3]);
            Assert.Equal(400, fees[4]);
            Assert.Equal(500, fees[5]);

            Assert.Equal(151000, GetTotalAmount(miners, fees));
        }

        [Fact]
        public void TestDistributionAlgorithm2()
        {
            var miners = new long[] { 100, 100, 0, 100, 100, 100 };
            var fees = FeesDistributionAlgorithm.Distribute(131000, miners);

            Assert.Equal(10, fees[0]);
            Assert.Equal(100, fees[1]);
            Assert.Equal(0, fees[2]);
            Assert.Equal(300, fees[3]);
            Assert.Equal(400, fees[4]);
            Assert.Equal(500, fees[5]);

            Assert.Equal(131000, GetTotalAmount(miners, fees));
        }

        private static decimal GetTotalAmount(long[] miners, decimal[] fees)
        {
            decimal totalAmount = 0;

            for (int i = 0; i < 6; i++)
            {
                totalAmount += miners[i] * fees[i];
            }

            return totalAmount;
        }
    }
}
