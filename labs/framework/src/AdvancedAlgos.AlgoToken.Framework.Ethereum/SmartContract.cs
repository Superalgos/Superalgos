using System;
using System.Numerics;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.Framework.Ethereum.Extensions;
using AdvancedAlgos.AlgoToken.Framework.Ethereum.Reflection;
using Nethereum.Contracts;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;

namespace AdvancedAlgos.AlgoToken.Framework.Ethereum
{
    public abstract class SmartContract<TContract> where TContract : SmartContract<TContract>
    {
        private static readonly object _syncForResourceLoader = new object();

        private static string _abi;
        private static string _bin;

        public SmartContract(Web3 web3, IGasPriceProvider gasPriceProvider)
        {
            Web3 = web3 ?? throw new ArgumentNullException(nameof(web3));
            GasPriceProvider = gasPriceProvider ?? throw new ArgumentNullException(nameof(gasPriceProvider));

            LoadAbiAndBin();
        }

        public SmartContract(string contractAddress, Web3 web3, IGasPriceProvider gasPriceProvider)
        {
            Web3 = web3 ?? throw new ArgumentNullException(nameof(web3));
            GasPriceProvider = gasPriceProvider ?? throw new ArgumentNullException(nameof(gasPriceProvider));
            ContractAddress = contractAddress ?? throw new ArgumentNullException(nameof(contractAddress));

            LoadAbiAndBin();

            var contractDescriptor = web3.Eth.GetContract(_abi, contractAddress);

            Initialize(contractDescriptor);
        }

        public Web3 Web3 { get; private set; }
        public IGasPriceProvider GasPriceProvider { get; }
        public string ContractAddress { get; private set; }

        protected abstract string AbiResourceName { get; }
        protected abstract string BinResourceName { get; }
        protected abstract BigInteger DeploymentGasUnits { get; }

        public void Bind(Web3 web3)
        {
            Web3 = web3 ?? throw new ArgumentNullException(nameof(web3));

            var contractDescriptor = Web3.Eth.GetContract(_abi, ContractAddress);

            Initialize(contractDescriptor);
        }

        protected virtual void Initialize(Contract contractDescriptor) { }

        protected async Task<TransactionReceipt> DeployAsync(params object[] constructorParameters)
        {
            var transactionReceipt = await Web3.Eth.DeployContract.SendRequestAndWaitForReceiptAsync(
                _abi,
                _bin,
                Web3.TransactionManager.Account.Address,
                new HexBigInteger(DeploymentGasUnits),
                new HexBigInteger(GasPriceProvider.GetGasPrice()),
                null,
                null,
                constructorParameters);

            transactionReceipt.EnsureSucceededStatus();

            var contractDescriptor = Web3.Eth.GetContract(_abi, transactionReceipt.ContractAddress);

            Initialize(contractDescriptor);

            ContractAddress = transactionReceipt.ContractAddress;

            return transactionReceipt;
        }

        protected async Task<TransactionReceipt> InvokeAsync(Function function, BigInteger gasUnits, params object[] parameters)
        {
            var transactionReceipt = await function.SendTransactionAndWaitForReceiptAsync(
                Web3.TransactionManager.Account.Address,
                new HexBigInteger(gasUnits),
                new HexBigInteger(GasPriceProvider.GetGasPrice()),
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
