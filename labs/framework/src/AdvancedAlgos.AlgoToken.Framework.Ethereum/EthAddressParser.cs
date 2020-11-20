using System;
using System.Collections.Generic;
using System.Text;
using Nethereum.Hex.HexConvertors.Extensions;
using Nethereum.Util;

namespace AdvancedAlgos.AlgoToken.Framework.Ethereum
{
    public static class EthAddressParser
    {
        private static readonly AddressUtil _addressUtil = new AddressUtil();

        public static bool ValidateAddress(string address)
        {
            try
            {
                if (!_addressUtil.IsValidAddressLength(address)) return false;
                address = _addressUtil.ConvertToChecksumAddress(address);
                return _addressUtil.IsChecksumAddress(address);
            }
            catch
            {
                return false;
            }
        }
    }
}
