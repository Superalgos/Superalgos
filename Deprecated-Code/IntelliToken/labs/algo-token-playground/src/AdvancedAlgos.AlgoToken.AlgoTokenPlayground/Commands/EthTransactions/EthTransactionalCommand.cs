using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.EthTransactions
{
    public abstract class EthTransactionalCommand : ICommand
    {
        public async Task ExecuteAsync(RuntimeContext context)
        {
            if (context.CurrentAccount == null) throw new Exception("Current account is not set.");

            var web3 = new Web3(context.CurrentAccount.Account, context.EthNetworkUrl);

            var transactionReceipt = await ExecuteAsync(context, web3);

            if (transactionReceipt != null)
            {
                Console.WriteLine($"- Gas used: {transactionReceipt.GasUsed.Value}.");
            }
        }

        protected abstract Task<TransactionReceipt> ExecuteAsync(RuntimeContext context, Web3 web3);
    }
}
