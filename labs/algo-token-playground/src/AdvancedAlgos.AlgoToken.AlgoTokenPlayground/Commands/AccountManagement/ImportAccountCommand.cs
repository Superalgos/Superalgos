using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;
using AdvancedAlgos.AlgoToken.Framework.Ethereum;
using Nethereum.Web3.Accounts;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.AccountManagement
{
    public class ImportAccountCommand : ICommand
    {
        private const string DEFAULT_NAME_FORMAT = "account#{0}";

        public string Name { get; set; }
        public string PrivateKey { get; set; }

        public Task ExecuteAsync(RuntimeContext context)
        {
            string name = string.IsNullOrWhiteSpace(Name) ?
                string.Format(CultureInfo.InvariantCulture, DEFAULT_NAME_FORMAT, AccountCounter.Next()) : Name;

            if (context.Accounts.ContainsKey(name)) throw new Exception($"The name '{name}' already exists.");

            var ethAccountDescriptor = new EthAccountDescriptor(name, new Account(PrivateKey));

            context.Accounts.Add(name, ethAccountDescriptor);
            context.CurrentAccount = ethAccountDescriptor;

            Console.WriteLine("Account imported:");
            Console.WriteLine($"- Name: '{name}'.");
            Console.WriteLine($"- Address: '{ethAccountDescriptor.Account.Address}'.");

            return Task.CompletedTask;
        }
    }
}
