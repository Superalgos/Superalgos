using System;
using System.Collections.Generic;
using System.Text;
using Nethereum.RPC.Eth.DTOs;
using AdvancedAlgos.AlgoErc20Token.EthClientExtensions.Exceptions;

namespace AdvancedAlgos.AlgoErc20Token.EthClientExtensions.Extensions
{
    public static class TransactionReceiptExtensions
    {
        public static void EnsureSucceededStatus(this TransactionReceipt transactionReceipt)
        {
            if (transactionReceipt.Status.Value != 1) TransactionRejectedException.Throw(transactionReceipt);
        }
    }
}
