using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoErc20Token;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.EthTransactions;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.EthTransactions
{
    public class EthTransferCommand : EthTransactionalCommand
    {
        public string To { get; set; }
        public BigInteger Value { get; set; }

        protected override async Task<TransactionReceipt> ExecuteAsync(RuntimeContext context, Web3 web3)
        {
            return await web3.TransactionManager.TransactionReceiptService.SendRequestAndWaitForReceiptAsync(() =>
                web3.TransactionManager.SendTransactionAsync(
                    context.CurrentAccount.Account.Address,
                    context.ResolveAccountOrContractReference(To),
                    new HexBigInteger(Value)));
        }
    }
}
