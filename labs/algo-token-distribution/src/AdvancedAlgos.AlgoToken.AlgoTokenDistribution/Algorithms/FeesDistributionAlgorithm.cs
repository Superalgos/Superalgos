using System;
using System.Collections.Generic;
using System.Text;

namespace AdvancedAlgos.AlgoToken.AlgoTokenDistribution.Algorithms
{
    public static class FeesDistributionAlgorithm
    {
        private static decimal[] _categoryProportions = new decimal[]
        {
            1,
            10,
            20,
            30,
            40,
            50
        };

        public static decimal[] Distribute(decimal totalAmount, long[] miners)
        {
            decimal totalProportion = 0;

            for (int i = 0; i < 6; i++)
            {
                totalProportion += _categoryProportions[i] * miners[i];
            }

            var allocationPercentage = new decimal[6];

            for (int i = 0; i < 6; i++)
            {
                if (miners[i] > 0) allocationPercentage[i] = _categoryProportions[i] / totalProportion;
            }

            var feePerMiner = new decimal[6];

            for (int i = 0; i < 6; i++)
            {
                if (miners[i] > 0) feePerMiner[i] = Math.Round(totalAmount * allocationPercentage[i]);
            }

            return feePerMiner;
        }
    }
}
