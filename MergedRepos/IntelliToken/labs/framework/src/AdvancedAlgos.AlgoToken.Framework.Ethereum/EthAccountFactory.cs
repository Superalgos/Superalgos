using System;
using System.Collections.Generic;
using System.Text;
using Nethereum.Hex.HexConvertors.Extensions;
using Nethereum.Signer;
using Nethereum.Web3.Accounts;

namespace AdvancedAlgos.AlgoToken.Framework.Ethereum
{
    public static class EthAccountFactory
    {
        public static Account Create()
        {
            var accountEcKey = EthECKey.GenerateKey();
            var accountPrivateKey = accountEcKey.GetPrivateKeyAsBytes().ToHex();
            return new Account(accountPrivateKey);
        }
    }
}
