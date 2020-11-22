using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;

namespace AdvancedAlgos.AlgoToken.Framework.Ethereum
{
    public interface IGasPriceProvider
    {
        BigInteger GetGasPrice();
    }
}
