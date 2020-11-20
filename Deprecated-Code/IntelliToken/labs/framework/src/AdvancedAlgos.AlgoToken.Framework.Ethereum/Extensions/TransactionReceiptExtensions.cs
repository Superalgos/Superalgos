using System;
using System.Collections.Generic;
using System.Text;
using Nethereum.RPC.Eth.DTOs;
using AdvancedAlgos.AlgoToken.Framework.Ethereum.Exceptions;

namespace AdvancedAlgos.AlgoToken.Framework.Ethereum.Extensions
{
    public static class TransactionReceiptExtensions
    {
        public static void EnsureSucceededStatus(this TransactionReceipt transactionReceipt)
        {
            if (transactionReceipt.Status.Value != 1) TransactionRejectedException.Throw(transactionReceipt);
        }
    }
}
