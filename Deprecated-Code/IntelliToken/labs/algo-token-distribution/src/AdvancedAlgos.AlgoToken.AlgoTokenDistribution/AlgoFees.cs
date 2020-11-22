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
    public class AlgoFees : SmartContract<AlgoFees>
    {
        private Function _registerMiner;
        private Function _unregisterMiner;
        private Function _mine;
        private Function _terminate;

        private Function _addSystem;
        private Function _addCoreTeam;

        private Function _getMinerCount;
        private Function _getMinerByIndex;

        public AlgoFees(Web3 web3, IGasPriceProvider gasPriceProvider) : base(web3, gasPriceProvider) { }
        public AlgoFees(string contractAddress, Web3 web3, IGasPriceProvider gasPriceProvider) : base(contractAddress, web3, gasPriceProvider) { }

        protected override string AbiResourceName => $"SmartContracts.src.bin.{nameof(AlgoFees)}.abi";
        protected override string BinResourceName => $"SmartContracts.src.bin.{nameof(AlgoFees)}.bin";
        protected override BigInteger DeploymentGasUnits => 1400000;

        public Task<TransactionReceipt> DeployAsync(string tokenAddress)
            => base.DeployAsync(tokenAddress);

        protected override void Initialize(Contract contractDescriptor)
        {
            _registerMiner = contractDescriptor.GetFunction("registerMiner");
            _unregisterMiner = contractDescriptor.GetFunction("unregisterMiner");
            _mine = contractDescriptor.GetFunction("mine");
            _terminate = contractDescriptor.GetFunction("terminate");

            _addSystem = contractDescriptor.GetFunction("addSystem");
            _addCoreTeam = contractDescriptor.GetFunction("addCoreTeam");

            _getMinerCount = contractDescriptor.GetFunction("getMinerCount");
            _getMinerByIndex = contractDescriptor.GetFunction("getMinerByIndex");
        }

        public Task<TransactionReceipt> RegisterMinerAsync(string minerAddress) =>
            InvokeAsync(_registerMiner, 900000, minerAddress);

        public Task<TransactionReceipt> UnregisterMinerAsync(string minerAddress) =>
            InvokeAsync(_unregisterMiner, 900000, minerAddress);

        public Task<TransactionReceipt> MineAsync() =>
            InvokeAsync(_mine, 1500000);

        public Task<TransactionReceipt> TerminateAsync() =>
            InvokeAsync(_terminate, 900000);

        public Task<TransactionReceipt> AddSystemAsync(string account) =>
            InvokeAsync(_addSystem, 900000, account);

        public Task<TransactionReceipt> AddCoreTeamAsync(string account) =>
            InvokeAsync(_addCoreTeam, 900000, account);

        public Task<BigInteger> GetMinerCountAsync() =>
            _getMinerCount.CallAsync<BigInteger>();

        public Task<string> GetMinerByIndexAsync(BigInteger index) =>
            _getMinerByIndex.CallAsync<string>(index);
    }
}
