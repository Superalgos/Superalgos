using System;
using System.Collections.Generic;
using System.Text;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.EthTransactions;
using Sprache;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Parsers
{
    public static class EthTransactionsParsers
    {
        public static void Register()
        {
            (from command in CommonParsers.Token("eth-transfer")
             from to in CommonParsers.StringValue
             from value in EthUnitParsers.EthValue
             select new EthTransferCommand
             {
                 To = to,
                 Value = value
             }).Register();

            (from command in CommonParsers.Token("eth-getbalance")
             from account in CommonParsers.StringValue
             select new EthGetBalanceCommand
             {
                 Account = account
             }).Register();
        }
    }
}
