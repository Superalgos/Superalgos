using System;
using System.Collections.Generic;
using System.Text;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.AlgoTokenContract;
using Sprache;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Parsers
{
    public static class AlgoTokenParsers
    {
        public static void Register()
        {
            (from command in CommonParsers.Token("deploy-algotoken")
             from name in CommonParsers.Switch('n', "name", CommonParsers.Identifier).Optional()
             select new AlgoTokenDeployCommand
             {
                 Name = name.GetOrDefault()
             }).Register();

            (from contractReference in CommonParsers.Invoke("algotoken-transfer")
             from to in CommonParsers.StringValue
             from value in EthUnitParsers.EthValue
             select new AlgoTokenTransferCommand
             {
                 ContractReference = contractReference,
                 To = to,
                 Value = value
             }).Register();

            (from contractReference in CommonParsers.Invoke("algotoken-balanceof")
             from owner in CommonParsers.StringValue
             select new AlgoTokenBalanceOfCommand
             {
                 ContractReference = contractReference,
                 OwnerAddress = owner
             }).Register();

            (from contractReference in CommonParsers.Invoke("algotoken-pause")
             select new AlgoTokenPauseCommand
             {
                 ContractReference = contractReference,
             }).Register();

            (from contractReference in CommonParsers.Invoke("algotoken-unpause")
             select new AlgoTokenUnpauseCommand
             {
                 ContractReference = contractReference,
             }).Register();
        }
    }
}
