using System;
using System.Numerics;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoErc20Token.EthClientExtensions.Extensions;
using AdvancedAlgos.AlgoErc20Token.EthClientExtensions.Reflection;
using Nethereum.Contracts;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;

namespace AdvancedAlgos.AlgoErc20Token.EthClientExtensions
{
    public abstract class SmartContract<TContract> where TContract : SmartContract<TContract>, new()
    {
        private static readonly object _syncForResourceLoader = new object();

        private static string _abi;
        private static string _bin;

        public Web3 Web3 { get; private set; }
        public string ContractAddress { get; private set; }

        protected abstract string AbiResourceName { get; }
        protected abstract string BinResourceName { get; }
        protected abstract BigInteger DeploymentGasUnits { get; }

        protected virtual void Initialize(Contract contractDescriptor) { }

        public static TContract Get(Web3 web3, string contractAddress)
        {
            var contractInstance = new TContract();

            contractInstance.LoadAbiAndBin();

            contractInstance.Web3 = web3;
            contractInstance.ContractAddress = contractAddress;

            var contractDescriptor = web3.Eth.GetContract(_abi, contractAddress);

            contractInstance.Initialize(contractDescriptor);

            return contractInstance;
        }

        public async Task<TransactionReceipt> DeployAsync(Web3 web3, BigInteger gasPrice, params object[] constructorParameters)
        {
            LoadAbiAndBin();

            var transactionReceipt = await web3.Eth.DeployContract.SendRequestAndWaitForReceiptAsync(
                _abi,
                _bin,
                web3.TransactionManager.Account.Address,
                new HexBigInteger(DeploymentGasUnits),
                new HexBigInteger(gasPrice),
                null,
                null,
                constructorParameters);

            transactionReceipt.EnsureSucceededStatus();

            var contractDescriptor = web3.Eth.GetContract(_abi, transactionReceipt.ContractAddress);

            Initialize(contractDescriptor);

            Web3 = web3;
            ContractAddress = transactionReceipt.ContractAddress;

            return transactionReceipt;
        }

        protected async Task<TransactionReceipt> InvokeAsync(Function function, BigInteger gasUnits, BigInteger gasPrice, params object[] parameters)
        {
            var transactionReceipt = await function.SendTransactionAndWaitForReceiptAsync(
                Web3.TransactionManager.Account.Address,
                new HexBigInteger(gasUnits),
                new HexBigInteger(gasPrice),
                null,
                null,
                parameters);

            transactionReceipt.EnsureSucceededStatus();

            return transactionReceipt;
        }

        private void LoadAbiAndBin()
        {
            lock (_syncForResourceLoader)
            {
                if (_abi != null) return;

                _abi = GetType().Assembly.GetResourceString(AbiResourceName);
                _bin = GetType().Assembly.GetResourceString(BinResourceName);
            }
        }
    }
}
