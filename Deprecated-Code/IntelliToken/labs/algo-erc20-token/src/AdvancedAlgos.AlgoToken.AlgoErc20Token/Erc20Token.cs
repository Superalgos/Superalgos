using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.Framework.Ethereum;
using Nethereum.Contracts;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;

namespace AdvancedAlgos.AlgoToken.AlgoErc20Token
{
    public abstract class Erc20Token<TContract> : SmartContract<TContract>
        where TContract : SmartContract<TContract>
    {
        private Function _transfer;
        private Function _balanceOf;
        private Function _pause;
        private Function _unpause;

        public Erc20Token(Web3 web3, IGasPriceProvider gasPriceProvider) : base(web3, gasPriceProvider) { }
        public Erc20Token(string contractAddress, Web3 web3, IGasPriceProvider gasPriceProvider) : base(contractAddress, web3, gasPriceProvider) { }

        public Task<TransactionReceipt> DeployAsync()
            => base.DeployAsync();

        protected override void Initialize(Contract contractDescriptor)
        {
            _transfer = contractDescriptor.GetFunction("transfer");
            _balanceOf = contractDescriptor.GetFunction("balanceOf");
            _pause = contractDescriptor.GetFunction("pause");
            _unpause = contractDescriptor.GetFunction("unpause");
        }

        public Task<TransactionReceipt> TransferAsync(string to, BigInteger value) =>
            InvokeAsync(_transfer, 900000, to, value);

        public Task<BigInteger> BalanceOfAsync(string owner) =>
            _balanceOf.CallAsync<BigInteger>(owner);

        public Task<TransactionReceipt> PauseAsync() =>
            InvokeAsync(_pause, 900000);

        public Task<TransactionReceipt> UnpauseAsync() =>
            InvokeAsync(_unpause, 900000);
    }
}
