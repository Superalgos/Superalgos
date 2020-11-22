using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.EthTransactions;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;
using AdvancedAlgos.AlgoToken.Framework.Ethereum.Exceptions;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.ContractManagement
{
    public abstract class DeployContractCommand : EthTransactionalCommand
    {
        private const string DEFAULT_NAME_FORMAT = "{0}#{1}";

        public string Name { get; set; }

        public abstract string DefaultName { get; }

        protected abstract Task<TransactionReceipt> DeployContractAsync(RuntimeContext context, Web3 web3);

        protected override async Task<TransactionReceipt> ExecuteAsync(RuntimeContext context, Web3 web3)
        {
            string name = string.IsNullOrWhiteSpace(Name) ?
                string.Format(CultureInfo.InvariantCulture, DEFAULT_NAME_FORMAT, DefaultName, ContractCounter.Next()) : Name;

            if (context.Contracts.ContainsKey(name)) throw new Exception($"The name '{name}' already exists.");

            try
            {
                var transactionReceipt = await DeployContractAsync(context, web3);

                if (transactionReceipt == null) return null;

                context.Contracts.Add(name, new EthContractDescriptor(name, transactionReceipt.ContractAddress));

                Console.WriteLine("Contract successfully deployed.");
                Console.WriteLine($"- Contract Name: '{name}'.");
                Console.WriteLine($"- Contract Address: '{transactionReceipt.ContractAddress}'.");

                return transactionReceipt;
            }
            catch
            {
                Console.WriteLine("Failed to deploy the contract.");
                throw;
            }
        }
    }
}
