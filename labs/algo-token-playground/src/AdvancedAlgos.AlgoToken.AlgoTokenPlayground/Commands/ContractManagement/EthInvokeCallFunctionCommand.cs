using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;
using AdvancedAlgos.AlgoToken.Framework.Ethereum;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.ContractManagement
{
    public abstract class EthInvokeCallFunctionCommand : ICommand
    {
        public string ContractReference { get; set; }

        public async Task ExecuteAsync(RuntimeContext context)
        {
            var web3 = new Web3(context.EthNetworkUrl);

            try
            {
                var result = await ExecuteAsync(context, context.ResolveContractReference(ContractReference), web3);

                Console.WriteLine(string.Format(CultureInfo.InvariantCulture, "- Result: {0}.", result));
            }
            catch
            {
                Console.WriteLine("Failed to execute the call.");
                throw;
            }
        }

        protected abstract Task<object> ExecuteAsync(RuntimeContext context, string contractAddress, Web3 web3);
    }
}
