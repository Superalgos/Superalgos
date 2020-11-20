using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Threading.Tasks;
using AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Runtime;
using AdvancedAlgos.AlgoToken.Framework.Ethereum;

namespace AdvancedAlgos.AlgoToken.AlgoTokenPlayground.Commands.AccountManagement
{
    public class NewAccountCommand : ICommand
    {
        private const string DEFAULT_NAME_FORMAT = "account#{0}";

        public string Name { get; set; }

        public Task ExecuteAsync(RuntimeContext context)
        {
            string name = string.IsNullOrWhiteSpace(Name) ?
                string.Format(CultureInfo.InvariantCulture, DEFAULT_NAME_FORMAT, AccountCounter.Next()) : Name;

            if (context.Accounts.ContainsKey(name)) throw new Exception($"The name '{name}' already exists.");

            var ethAccountDescriptor = new EthAccountDescriptor(name, EthAccountFactory.Create());

            context.Accounts.Add(name, ethAccountDescriptor);
            context.CurrentAccount = ethAccountDescriptor;

            Console.WriteLine("New account created:");
            Console.WriteLine($"- Name: '{name}'.");
            Console.WriteLine($"- Address: '{ethAccountDescriptor.Account.Address}'.");
            Console.WriteLine($"- Private Key: '{ethAccountDescriptor.Account.PrivateKey}'.");

            return Task.CompletedTask;
        }
    }
}
