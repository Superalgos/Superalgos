using System;
using System.Collections.Generic;
using System.Text;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.AlgoPoolContract;
using Sprache;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Parsers
{
    public static class AlgoPoolParsers
    {
        public static void Register()
        {
            (from command in CommonParsers.Token("deploy-algopool")
             from poolType in CommonParsers.ByteValue
             from tokenAddress in CommonParsers.StringValue
             from name in CommonParsers.Switch('n', "name", CommonParsers.Identifier).Optional()
             select new AlgoPoolDeployCommand
             {
                 Name = name.GetOrDefault(),
                 PoolType = poolType,
                 TokenAddress = tokenAddress
             }).Register();

            (from contractReference in CommonParsers.Invoke("algopool-trasfertominer")
             from minerAddress in CommonParsers.StringValue
             select new AlgoPoolTrasferToMinerCommand
             {
                 ContractReference = contractReference,
                 MinerAddress = minerAddress
             }).Register();
        }
    }
}
