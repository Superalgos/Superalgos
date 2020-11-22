using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.EthTransactions;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.ContractManagement
{
    public abstract class EthInvokeTransactionalFunctionCommand : EthTransactionalCommand
    {
        public string ContractReference { get; set; }

        protected abstract Task<TransactionReceipt> ExecuteAsync(RuntimeContext context, string contractAddress, Web3 web3);

        protected override async Task<TransactionReceipt> ExecuteAsync(RuntimeContext context, Web3 web3)
        {
            try
            {
                var transactionReceipt = await ExecuteAsync(context, context.ResolveContractReference(ContractReference), web3);

                Console.WriteLine("Function successfully executed.");

                return transactionReceipt;
            }
            catch
            {
                Console.WriteLine("Failed to execute the transaction.");
                throw;
            }
        }
    }
}