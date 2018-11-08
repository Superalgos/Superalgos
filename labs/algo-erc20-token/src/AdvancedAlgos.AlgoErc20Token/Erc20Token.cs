using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoErc20Token.EthClientExtensions;
using Nethereum.Contracts;
using Nethereum.RPC.Eth.DTOs;

namespace AdvancedAlgos.AlgoErc20Token
{
    public abstract class Erc20Token<TContract> : SmartContract<TContract>
        where TContract : SmartContract<TContract>, new()
    {
        private Function _transfer;
        private Function _balanceOf;
        private Function _pause;
        private Function _unpause;

        protected override void Initialize(Contract contractDescriptor)
        {
            _transfer = contractDescriptor.GetFunction("transfer");
            _balanceOf = contractDescriptor.GetFunction("balanceOf");
            _pause = contractDescriptor.GetFunction("pause");
            _unpause = contractDescriptor.GetFunction("unpause");
        }

        public Task<TransactionReceipt> TransferAsync(BigInteger gasPrice, string to, BigInteger value) =>
            InvokeAsync(_transfer, 900000, gasPrice, to, value);

        public Task<BigInteger> BalanceOfAsync(string owner) =>
            _balanceOf.CallAsync<BigInteger>(owner);

        public Task<TransactionReceipt> PauseAsync(BigInteger gasPrice) =>
            InvokeAsync(_pause, 900000, gasPrice);

        public Task<TransactionReceipt> UnpauseAsync(BigInteger gasPrice) =>
            InvokeAsync(_unpause, 900000, gasPrice);
    }
}
