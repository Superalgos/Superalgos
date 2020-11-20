using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoErc20Token;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.ContractManagement;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.AlgoTokenContract
{
    public class AlgoTokenBalanceOfCommand : EthInvokeCallFunctionCommand
    {
        public string OwnerAddress { get; set; }

        protected override async Task<object> ExecuteAsync(RuntimeContext context, string contractAddress, Web3 web3)
        {
            var algoToken = new AlgoTokenV1(contractAddress, web3, context.GasPriceProvider);
            return await algoToken.BalanceOfAsync(context.ResolveAccountOrContractReference(OwnerAddress));
        }
    }
}
