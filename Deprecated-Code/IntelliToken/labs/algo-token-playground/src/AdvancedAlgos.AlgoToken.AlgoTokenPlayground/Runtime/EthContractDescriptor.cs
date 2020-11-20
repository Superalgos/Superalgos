using System;
using System.Collections.Generic;
using System.Text;
using Nethereum.Web3.Accounts;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime
{
    public class EthContractDescriptor
    {
        public EthContractDescriptor(string name, string contractAddress)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            ContractAddress = contractAddress ?? throw new ArgumentNullException(nameof(contractAddress));
        }

        public string Name { get; set; }
        public string ContractAddress { get; set; }
    }
}
