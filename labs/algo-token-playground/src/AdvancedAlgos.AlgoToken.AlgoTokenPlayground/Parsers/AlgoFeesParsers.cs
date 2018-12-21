using System;
using System.Collections.Generic;
using System.Text;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.AlgoFeesContract;
using Sprache;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Parsers
{
    public static class AlgoFeesParsers
    {
        public static void Register()
        {
            (from command in CommonParsers.Token("deploy-algofees")
             from tokenAddress in CommonParsers.StringValue
             from name in CommonParsers.Switch('n', "name", CommonParsers.Identifier).Optional()
             select new AlgoFeesDeployCommand
             {
                 Name = name.GetOrDefault(),
                 TokenAddress = tokenAddress
             }).Register();

            (from contractReference in CommonParsers.Invoke("algofees-registerminer")
             from minerAddress in CommonParsers.StringValue
             select new AlgoFeesRegisterMinerCommand
             {
                 ContractReference = contractReference,
                 MinerAddress = minerAddress
             }).Register();

            (from contractReference in CommonParsers.Invoke("algofees-unregisterminer")
             from minerAddress in CommonParsers.StringValue
             select new AlgoFeesUnregisterMinerCommand
             {
                 ContractReference = contractReference,
                 MinerAddress = minerAddress
             }).Register();

            (from contractReference in CommonParsers.Invoke("algofees-mine")
             select new AlgoFeesMineCommand
             {
                 ContractReference = contractReference
             }).Register();

            (from contractReference in CommonParsers.Invoke("algofees-terminate")
             select new AlgoFeesTerminateCommand
             {
                 ContractReference = contractReference
             }).Register();
        }
    }
}
