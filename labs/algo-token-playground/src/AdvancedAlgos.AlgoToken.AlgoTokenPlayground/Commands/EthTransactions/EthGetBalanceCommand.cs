using System;
using System.Collections.Generic;
using System.Globalization;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoErc20Token;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.EthTransactions;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.EthTransactions
{
    public class EthGetBalanceCommand : ICommand
    {
        public string Account { get; set; }

        public async Task ExecuteAsync(RuntimeContext context)
        {
            var web3 = new Web3(context.EthNetworkUrl);

            try
            {
                var balance = await web3.Eth.GetBalance.SendRequestAsync(context.ResolveAccountOrContractReference(Account));

                Console.WriteLine(string.Format(CultureInfo.InvariantCulture, "- Balance: {0}.", balance.Value));
            }
            catch
            {
                Console.WriteLine("Failed to get balance.");
                throw;
            }
        }
    }
}
