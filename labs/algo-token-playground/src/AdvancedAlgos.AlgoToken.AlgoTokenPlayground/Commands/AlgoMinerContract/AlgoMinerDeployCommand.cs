using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoTokenDistribution;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.ContractManagement;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.AlgoMinerContract
{
    public class AlgoMinerDeployCommand : DeployContractCommand
    {
        public override string DefaultName => "AlgoMiner";

        public byte MinerType { get; set; }
        public byte Category { get; set; }
        public string MinerAccountAddress { get; set; }
        public string ReferralAccountAddress { get; set; }
        public string TokenAddress { get; set; }

        protected override async Task<TransactionReceipt> DeployContractAsync(RuntimeContext context, Web3 web3)
        {
            var algoMiner = new AlgoMiner(web3, context.GasPriceProvider);
            return await algoMiner.DeployAsync(
                MinerType,
                Category,
                context.ResolveAccountReference(MinerAccountAddress),
                context.ResolveAccountReference(ReferralAccountAddress),
                context.ResolveContractReference(TokenAddress));
        }
    }
}
