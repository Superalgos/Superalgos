using System;
using System.Collections.Generic;
using System.Text;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.AccountManagement;
using Sprache;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Parsers
{
    public static class AccountManagementParsers
    {
        public static void Register()
        {
            (from command in CommonParsers.Token("new-account")
             from name in CommonParsers.Switch('n', "name", CommonParsers.Identifier).Optional()
             select new NewAccountCommand
             {
                 Name = name.GetOrDefault()
             }).Register();

            (from command in CommonParsers.Token("import-account")
             from privateKey in CommonParsers.StringValue
             from name in CommonParsers.Switch('n', "name", CommonParsers.Identifier).Optional()
             select new ImportAccountCommand
             {
                 Name = name.GetOrDefault(),
                 PrivateKey = privateKey
             }).Register();

            (from command in CommonParsers.Token("list-accounts")
             select new ListAccountsCommand()
             ).Register();

            (from command in CommonParsers.Token("set-account")
             from name in CommonParsers.Identifier
             select new SetAccountCommand
             {
                 Name = name
             }).Register();
        }
    }
}
