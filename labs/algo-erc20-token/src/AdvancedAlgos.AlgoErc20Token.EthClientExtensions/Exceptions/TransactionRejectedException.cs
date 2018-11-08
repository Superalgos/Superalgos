#pragma warning disable RCS1194 // Implement exception constructors.

using System;
using System.Collections.Generic;
using System.Text;
using Nethereum.RPC.Eth.DTOs;

namespace AdvancedAlgos.AlgoErc20Token.EthClientExtensions.Exceptions
{
    public class TransactionRejectedException : Exception
    {
        private const string ERROR_MESSAGE = "Failed to execute the transaction.";

        public TransactionRejectedException(TransactionReceipt transactionReceipt)
            : base(ERROR_MESSAGE)
        {
            TransactionReceipt = transactionReceipt;
        }

        public TransactionReceipt TransactionReceipt { get; }

        public static void Throw(TransactionReceipt transactionReceipt) => throw new TransactionRejectedException(transactionReceipt);
    }
}
