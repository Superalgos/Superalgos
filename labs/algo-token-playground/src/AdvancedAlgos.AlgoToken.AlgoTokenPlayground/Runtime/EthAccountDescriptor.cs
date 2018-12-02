using System;
using System.Collections.Generic;
using System.Text;
using Nethereum.Web3.Accounts;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime
{
    public class EthAccountDescriptor
    {
        public EthAccountDescriptor(string name, Account account)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Account = account ?? throw new ArgumentNullException(nameof(account));
        }

        public string Name { get; set; }
        public Account Account { get; set; }
    }
}
