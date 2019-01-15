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
    public class AlgoMiner : SmartContract<AlgoMiner>
    {
        private Function _activateMiner;
        private Function _deactivateMiner;
        private Function _migrateMiner;
        private Function _pauseMining;
        private Function _resumeMining;
        private Function _stopAndRemoveOwnership;
        private Function _resetMiner;
        private Function _startMining;
        private Function _stopMining;
        private Function _mine;
        private Function _terminate;

        private Function _addSystem;
        private Function _addCoreTeam;
        private Function _addSupervisor;

        public AlgoMiner(Web3 web3, IGasPriceProvider gasPriceProvider) : base(web3, gasPriceProvider) { }
        public AlgoMiner(string contractAddress, Web3 web3, IGasPriceProvider gasPriceProvider) : base(contractAddress, web3, gasPriceProvider) { }

        protected override string AbiResourceName => $"SmartContracts.src.bin.{nameof(AlgoMiner)}.abi";
        protected override string BinResourceName => $"SmartContracts.src.bin.{nameof(AlgoMiner)}.bin";
        protected override BigInteger DeploymentGasUnits => 1600000;

        public Task<TransactionReceipt> DeployAsync(byte minerType, byte category, string minerAccountAddress, string referralAccountAddress, string tokenAddress)
            => base.DeployAsync(minerType, category, minerAccountAddress, referralAccountAddress, tokenAddress);

        protected override void Initialize(Contract contractDescriptor)
        {
            _activateMiner = contractDescriptor.GetFunction("activateMiner");
            _deactivateMiner = contractDescriptor.GetFunction("deactivateMiner");
            _migrateMiner = contractDescriptor.GetFunction("migrateMiner");
            _pauseMining = contractDescriptor.GetFunction("pauseMining");
            _resumeMining = contractDescriptor.GetFunction("resumeMining");
            _stopAndRemoveOwnership = contractDescriptor.GetFunction("stopAndRemoveOwnership");
            _resetMiner = contractDescriptor.GetFunction("resetMiner");
            _startMining = contractDescriptor.GetFunction("startMining");
            _stopMining = contractDescriptor.GetFunction("stopMining");
            _mine = contractDescriptor.GetFunction("mine");
            _terminate = contractDescriptor.GetFunction("terminate");

            _addSystem = contractDescriptor.GetFunction("addSystem");
            _addCoreTeam = contractDescriptor.GetFunction("addCoreTeam");
            _addSupervisor = contractDescriptor.GetFunction("addSupervisor");
        }

        public Task<TransactionReceipt> ActivateMinerAsync() =>
            InvokeAsync(_activateMiner, 900000);

        public Task<TransactionReceipt> DeactivateMinerAsync() =>
            InvokeAsync(_deactivateMiner, 900000);

        public Task<TransactionReceipt> MigrateMinerAsync(string newMinerAddress) =>
            InvokeAsync(_migrateMiner, 900000, newMinerAddress);

        public Task<TransactionReceipt> PauseMiningAsync() =>
            InvokeAsync(_pauseMining, 900000);

        public Task<TransactionReceipt> ResumeMiningAsync() =>
            InvokeAsync(_resumeMining, 900000);

        public Task<TransactionReceipt> StopAndRemoveOwnershipAsync() =>
            InvokeAsync(_stopAndRemoveOwnership, 900000);

        public Task<TransactionReceipt> ResetMinerAsync(string newOwnerAddress, string newReferralAddress) =>
            InvokeAsync(_resetMiner, 900000, newOwnerAddress, newReferralAddress);

        public Task<TransactionReceipt> StartMiningAsync() =>
            InvokeAsync(_startMining, 900000);

        public Task<TransactionReceipt> StopMiningAsync() =>
            InvokeAsync(_stopMining, 900000);

        public Task<TransactionReceipt> MineAsync() =>
            InvokeAsync(_mine, 900000);

        public Task<TransactionReceipt> TerminateAsync() =>
            InvokeAsync(_terminate, 900000);

        public Task<TransactionReceipt> AddSystemAsync(string account) =>
            InvokeAsync(_addSystem, 900000, account);

        public Task<TransactionReceipt> AddCoreTeamAsync(string account) =>
            InvokeAsync(_addCoreTeam, 900000, account);

        public Task<TransactionReceipt> AddSupervisorAsync(string account) =>
            InvokeAsync(_addSupervisor, 900000, account);
    }
}
