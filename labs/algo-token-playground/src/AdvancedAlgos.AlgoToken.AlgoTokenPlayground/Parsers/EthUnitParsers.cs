using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;
using Nethereum.Util;
using Sprache;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Parsers
{
    public static class EthUnitParsers
    {
        public static readonly Parser<BigInteger> EthValue =
            EthUnit("wei")
            .Or(EthUnit("gwei"))
            .Or(EthUnit("eth"))
            .Or(EthUnit("ether"))
            .Or(EthUnit("m"))
            .Or(EthUnit("mether"))
            .Or(CommonParsers.BigIntegerValue);

        public static Parser<BigInteger> EthUnit(string unitName)
            => from value in CommonParsers.BigIntegerValue
               from unit in Parse.IgnoreCase(unitName).Text()
               select Convert(value, unit);

        private static BigInteger Convert(BigInteger value, string unitName)
        {
            switch (unitName.ToLowerInvariant())
            {
                case "wei":
                    return value;
                case "gwei":
                    return UnitConversion.Convert.ToWei(value, UnitConversion.EthUnit.Gwei);
                case "eth":
                case "ether":
                    return UnitConversion.Convert.ToWei(value, UnitConversion.EthUnit.Ether);
                case "m":
                case "mether":
                    return UnitConversion.Convert.ToWei(value, UnitConversion.EthUnit.Mether);
            }

            throw new Exception("Invalid unit.");
        }
    }
}
