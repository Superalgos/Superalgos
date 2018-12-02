using System;
using System.Collections.Generic;
using System.Text;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.ContractManagement;
using Sprache;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Parsers
{
    public static class ContractManagementParsers
    {
        public static void Register()
        {
            (from command in CommonParsers.Token("list-contracts")
             select new ListContractsCommand()
             ).Register();
        }
    }
}
