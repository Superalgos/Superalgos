using System;
using System.Collections.Generic;
using System.Text;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.AlgoMinerContract;
using Sprache;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Parsers
{
    public static class AlgoMinerParsers
    {
        public static void Register()
        {
            (from command in CommonParsers.Token("deploy-algominer")
             from minerType in CommonParsers.ByteValue
             from category in CommonParsers.ByteValue
             from minerAccountAddress in CommonParsers.StringValue
             from referralAccountAddress in CommonParsers.StringValue
             from tokenAddress in CommonParsers.StringValue
             from name in CommonParsers.Switch('n', "name", CommonParsers.Identifier).Optional()
             select new AlgoMinerDeployCommand
             {
                 Name = name.GetOrDefault(),
                 MinerType = minerType,
                 Category = category,
                 MinerAccountAddress = minerAccountAddress,
                 ReferralAccountAddress = referralAccountAddress,
                 TokenAddress = tokenAddress
             }).Register();

            (from contractReference in CommonParsers.Invoke("algominer-activateminer")
             select new AlgoMinerActivateMinerCommand
             {
                 ContractReference = contractReference,
             }).Register();

            (from contractReference in CommonParsers.Invoke("algominer-deactivateminer")
             select new AlgoMinerDeactivateMinerCommand
             {
                 ContractReference = contractReference,
             }).Register();

            (from contractReference in CommonParsers.Invoke("algominer-migrateminer")
             from newMinerAddress in CommonParsers.StringValue
             select new AlgoMinerMigrateMinerCommand
             {
                 ContractReference = contractReference,
                 NewMinerAddress = newMinerAddress
             }).Register();

            (from contractReference in CommonParsers.Invoke("algominer-pausemining")
             select new AlgoMinerPauseMiningCommand
             {
                 ContractReference = contractReference,
             }).Register();

            (from contractReference in CommonParsers.Invoke("algominer-resumemining")
             select new AlgoMinerResumeMiningCommand
             {
                 ContractReference = contractReference,
             }).Register();

            (from contractReference in CommonParsers.Invoke("algominer-stopandremoveownership")
             select new AlgoMinerStopAndRemoveOwnershipCommand
             {
                 ContractReference = contractReference,
             }).Register();

            (from contractReference in CommonParsers.Invoke("algominer-resetminer")
             from newOwnerAddress in CommonParsers.StringValue
             from newReferralAddress in CommonParsers.StringValue
             select new AlgoMinerResetMinerCommand
             {
                 ContractReference = contractReference,
                 NewOwnerAddress = newOwnerAddress,
                 NewReferralAddress = newReferralAddress
             }).Register();

            (from contractReference in CommonParsers.Invoke("algominer-startmining")
             select new AlgoMinerStartMiningCommand
             {
                 ContractReference = contractReference,
             }).Register();

            (from contractReference in CommonParsers.Invoke("algominer-stopmining")
             select new AlgoMinerStopMiningCommand
             {
                 ContractReference = contractReference,
             }).Register();

            (from contractReference in CommonParsers.Invoke("algominer-mine")
             select new AlgoMinerMineCommand
             {
                 ContractReference = contractReference,
             }).Register();

            (from contractReference in CommonParsers.Invoke("algominer-terminate")
             select new AlgoMinerTerminateCommand
             {
                 ContractReference = contractReference
             }).Register();

            (from contractReference in CommonParsers.Invoke("algominer-addsystem")
             from account in CommonParsers.StringValue
             select new AlgoMinerAddSystemCommand
             {
                 ContractReference = contractReference,
                 Account = account
             }).Register();

            (from contractReference in CommonParsers.Invoke("algominer-addcoreteam")
             from account in CommonParsers.StringValue
             select new AlgoMinerAddCoreTeamCommand
             {
                 ContractReference = contractReference,
                 Account = account
             }).Register();

            (from contractReference in CommonParsers.Invoke("algominer-addsupervisor")
             from account in CommonParsers.StringValue
             select new AlgoMinerAddSupervisorCommand
             {
                 ContractReference = contractReference,
                 Account = account
             }).Register();
        }
    }
}
