#pragma warning disable EPS02 // Non-readonly struct used as in-parameter

using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;

namespace AdvancedAlgos.AlgoToken.AlgoErc20Token
{
    public static class AlgoIntegralConverterExtensions
    {
        public const byte TOKEN_DECIMALS = 18;
        public const long MEGA_FACTOR = 1000000;

        public static readonly BigInteger TokenFactor = BigInteger.Pow(10, TOKEN_DECIMALS);

        public static BigInteger Algo(this in byte value) => value * TokenFactor;
        public static BigInteger Algo(this in sbyte value) => value * TokenFactor;
        public static BigInteger Algo(this in short value) => value * TokenFactor;
        public static BigInteger Algo(this in ushort value) => value * TokenFactor;
        public static BigInteger Algo(this in int value) => value * TokenFactor;
        public static BigInteger Algo(this in uint value) => value * TokenFactor;
        public static BigInteger Algo(this in long value) => value * TokenFactor;
        public static BigInteger Algo(this in ulong value) => value * TokenFactor;

        public static BigInteger MAlgo(this in byte value) => value * TokenFactor * MEGA_FACTOR;
        public static BigInteger MAlgo(this in sbyte value) => value * TokenFactor * MEGA_FACTOR;
        public static BigInteger MAlgo(this in short value) => value * TokenFactor * MEGA_FACTOR;
        public static BigInteger MAlgo(this in ushort value) => value * TokenFactor * MEGA_FACTOR;
        public static BigInteger MAlgo(this in int value) => value * TokenFactor * MEGA_FACTOR;
        public static BigInteger MAlgo(this in uint value) => value * TokenFactor * MEGA_FACTOR;
        public static BigInteger MAlgo(this in long value) => value * TokenFactor * MEGA_FACTOR;
        public static BigInteger MAlgo(this in ulong value) => value * TokenFactor * MEGA_FACTOR;
    }
}
