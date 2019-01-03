using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.Framework.Ethereum;
using Nethereum.Contracts;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;

namespace AdvancedAlgos.AlgoToken.AlgoTokenDistribution
{
    public class AlgoPool : SmartContract<AlgoPool>
    {
        private Function _transferToMiner;
        private Function _terminate;

        public AlgoPool(Web3 web3, IGasPriceProvider gasPriceProvider) : base(web3, gasPriceProvider) { }
        public AlgoPool(string contractAddress, Web3 web3, IGasPriceProvider gasPriceProvider) : base(contractAddress, web3, gasPriceProvider) { }

        protected override string AbiResourceName => $"SmartContracts.src.bin.{nameof(AlgoPool)}.abi";
        protected override string BinResourceName => $"SmartContracts.src.bin.{nameof(AlgoPool)}.bin";
        protected override BigInteger DeploymentGasUnits => 1200000;

        public Task<TransactionReceipt> DeployAsync(byte poolType, string tokenAddress)
            => base.DeployAsync(poolType, tokenAddress);

        protected override void Initialize(Contract contractDescriptor)
        {
            _transferToMiner = contractDescriptor.GetFunction("transferToMiner");
            _terminate = contractDescriptor.GetFunction("terminate");
        }

        public Task<TransactionReceipt> TransferToMinerAsync(string minerAddress) =>
            InvokeAsync(_transferToMiner, 900000, minerAddress);

        public Task<TransactionReceipt> TerminateAsync() =>
            InvokeAsync(_terminate, 900000);
    }
}
